/**
 * Chhayavastralaya API Test Suite
 * Run with: npx tsx scripts/test-api.ts
 * Requires the Next.js dev server running at http://localhost:3000
 */

const BASE = 'http://localhost:3000'

// ─── Types ───────────────────────────────────────────────────────────────────

interface TestResult {
  name: string
  passed: boolean
  error?: string
  data?: unknown
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

function extractCookies(headers: Headers): string {
  const raw = headers.getSetCookie?.() ?? []
  if (raw.length > 0) return raw.map((c) => c.split(';')[0]).join('; ')
  // Fallback for environments where getSetCookie isn't available
  const single = headers.get('set-cookie') ?? ''
  return single.split(';')[0]
}

async function api(
  method: string,
  path: string,
  body?: unknown,
  cookies?: string,
): Promise<{ status: number; json: any; cookies: string }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (cookies) headers['Cookie'] = cookies

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  })

  const newCookies = extractCookies(res.headers)
  let json: any = null
  const ct = res.headers.get('content-type') ?? ''
  if (ct.includes('json')) {
    json = await res.json()
  } else {
    json = { _raw: await res.text() }
  }

  return { status: res.status, json, cookies: newCookies }
}

// ─── Test runner ──────────────────────────────────────────────────────────────

async function run(name: string, fn: () => Promise<void>): Promise<TestResult> {
  try {
    await fn()
    return { name, passed: true }
  } catch (err: any) {
    return { name, passed: false, error: String(err?.message ?? err) }
  }
}

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(msg)
}

function assertStatus(actual: number, expected: number, context?: any): void {
  if (actual !== expected) {
    throw new Error(
      `Expected HTTP ${expected}, got ${actual}. Body: ${JSON.stringify(context).slice(0, 200)}`,
    )
  }
}

// ─── Shared state ─────────────────────────────────────────────────────────────

const ts = Date.now()
const store1Email = `owner1-${ts}@test.chhaya.dev`
const store1Password = 'TestPass123!'
const store1Name = `Test Store ${ts}`

const store2Email = `owner2-${ts}@test.chhaya.dev`
const store2Password = 'TestPass123!'
const store2Name = `Rival Store ${ts}`

let session1Cookies = ''
let session2Cookies = ''

let createdProductId = ''
let createdOrderId = ''
let createdCustomerId = ''
let createdStaffId = ''
let createdTaskId = ''

// ─── Individual tests ─────────────────────────────────────────────────────────

// 1. Register store 1 + owner
async function testRegisterStore1(): Promise<void> {
  const { status, json } = await api('POST', '/api/auth/register', {
    name: 'Test Owner One',
    email: store1Email,
    password: store1Password,
    storeName: store1Name,
    phone: '9000000001',
  })
  assertStatus(status, 200, json)
  assert(!!json.userId, 'Expected userId in response')
  assert(!!json.storeId, 'Expected storeId in response')
}

// 2. Login store 1 — capture session cookies
async function testLoginStore1(): Promise<void> {
  // NextAuth credentials sign-in via CSRF + POST
  // Step 1: get CSRF token
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`)
  const csrfJson = await csrfRes.json()
  const csrfToken: string = csrfJson.csrfToken
  const csrfCookie = extractCookies(csrfRes.headers)

  assert(!!csrfToken, 'Expected csrfToken from /api/auth/csrf')

  // Step 2: POST credentials
  const body = new URLSearchParams({
    csrfToken,
    email: store1Email,
    password: store1Password,
    redirect: 'false',
    json: 'true',
    callbackUrl: BASE,
  })

  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: csrfCookie,
    },
    body: body.toString(),
    redirect: 'manual',
  })

  // NextAuth returns 302 on success; collect all set-cookie headers
  const loginCookies = extractCookies(loginRes.headers)
  // Merge CSRF cookie with session cookie
  const merged = [csrfCookie, loginCookies].filter(Boolean).join('; ')
  session1Cookies = merged

  // Verify session is valid by hitting a protected route
  const { status, json } = await api('GET', '/api/products', undefined, session1Cookies)
  assertStatus(status, 200, json)
  assert(Array.isArray(json.products), 'Expected products array')
}

// 3a. Create product
async function testCreateProduct(): Promise<void> {
  const { status, json } = await api(
    'POST',
    '/api/products',
    {
      name: `Silk Kurta ${ts}`,
      sellingPrice: 1299,
      costPrice: 600,
      mrp: 1499,
      taxRate: 12,
      unit: 'piece',
      tags: ['silk', 'kurta'],
      imageUrls: [],
      isFeatured: false,
    },
    session1Cookies,
  )
  assertStatus(status, 201, json)
  assert(!!json.id, 'Expected product id')
  createdProductId = json.id
}

// 3b. Read product list
async function testListProducts(): Promise<void> {
  const { status, json } = await api('GET', '/api/products', undefined, session1Cookies)
  assertStatus(status, 200, json)
  assert(Array.isArray(json.products), 'Expected products array')
  assert(json.total >= 1, 'Expected at least 1 product')
}

// 3c. Get single product
async function testGetProduct(): Promise<void> {
  const { status, json } = await api(
    'GET',
    `/api/products/${createdProductId}`,
    undefined,
    session1Cookies,
  )
  assertStatus(status, 200, json)
  assert(json.id === createdProductId, 'Product id mismatch')
}

// 3d. Update product
async function testUpdateProduct(): Promise<void> {
  const { status, json } = await api(
    'PATCH',
    `/api/products/${createdProductId}`,
    { sellingPrice: 1399, isFeatured: true },
    session1Cookies,
  )
  assertStatus(status, 200, json)
  assert(json.sellingPrice === 1399, 'sellingPrice not updated')
}

// 3e. Soft-delete product
async function testDeleteProduct(): Promise<void> {
  const { status, json } = await api(
    'DELETE',
    `/api/products/${createdProductId}`,
    undefined,
    session1Cookies,
  )
  assertStatus(status, 200, json)
  assert(json.success === true || json.isActive === false || !!json.id, 'Expected success response')
}

// 4a. Create customer (needed for order)
async function testCreateCustomer(): Promise<void> {
  const { status, json } = await api(
    'POST',
    '/api/customers',
    {
      name: `Priya Sharma ${ts}`,
      phone: '9111111111',
      email: `priya-${ts}@example.com`,
      tags: ['vip'],
    },
    session1Cookies,
  )
  assertStatus(status, 201, json)
  assert(!!json.id, 'Expected customer id')
  createdCustomerId = json.id
}

// 4b. Create order with items
async function testCreateOrder(): Promise<void> {
  const { status, json } = await api(
    'POST',
    '/api/orders',
    {
      customerId: createdCustomerId,
      source: 'POS',
      paymentMethod: 'CASH',
      subtotal: 1399,
      taxAmt: 167.88,
      discountAmt: 0,
      shippingAmt: 0,
      total: 1566.88,
      items: [
        {
          productId: createdProductId,
          productName: `Silk Kurta ${ts}`,
          quantity: 1,
          unitPrice: 1399,
          taxRate: 12,
          taxAmt: 167.88,
          discountAmt: 0,
          total: 1566.88,
        },
      ],
    },
    session1Cookies,
  )
  assertStatus(status, 201, json)
  assert(!!json.id, 'Expected order id')
  assert(!!json.orderNumber, 'Expected orderNumber')
  createdOrderId = json.id
}

// 4c. List orders
async function testListOrders(): Promise<void> {
  const { status, json } = await api('GET', '/api/orders', undefined, session1Cookies)
  assertStatus(status, 200, json)
  assert(Array.isArray(json.orders), 'Expected orders array')
  assert(json.total >= 1, 'Expected at least 1 order')
}

// 4d. Get single order
async function testGetOrder(): Promise<void> {
  const { status, json } = await api(
    'GET',
    `/api/orders/${createdOrderId}`,
    undefined,
    session1Cookies,
  )
  assertStatus(status, 200, json)
  assert(json.id === createdOrderId, 'Order id mismatch')
  assert(Array.isArray(json.items), 'Expected items array')
}

// 4e. Update order status
async function testUpdateOrderStatus(): Promise<void> {
  const { status, json } = await api(
    'PATCH',
    `/api/orders/${createdOrderId}`,
    { status: 'CONFIRMED', paymentStatus: 'PAID' },
    session1Cookies,
  )
  assertStatus(status, 200, json)
  assert(json.status === 'CONFIRMED', 'Order status not updated')
}

// 4f. Cancel order (soft-delete via status)
async function testCancelOrder(): Promise<void> {
  const { status, json } = await api(
    'DELETE',
    `/api/orders/${createdOrderId}`,
    undefined,
    session1Cookies,
  )
  assertStatus(status, 200, json)
  assert(json.success === true, 'Expected success: true')
}

// 5. Inventory — list
async function testListInventory(): Promise<void> {
  const { status, json } = await api('GET', '/api/inventory', undefined, session1Cookies)
  assertStatus(status, 200, json)
  assert(Array.isArray(json.items), 'Expected items array')
}

// 6b. Read customer list
async function testListCustomers(): Promise<void> {
  const { status, json } = await api('GET', '/api/customers', undefined, session1Cookies)
  assertStatus(status, 200, json)
  assert(Array.isArray(json.customers), 'Expected customers array')
  assert(json.total >= 1, 'Expected at least 1 customer')
}

// 6c. Update customer
async function testUpdateCustomer(): Promise<void> {
  const { status, json } = await api(
    'PATCH',
    `/api/customers/${createdCustomerId}`,
    { notes: 'VIP client, prefers silk', tags: ['vip', 'silk'] },
    session1Cookies,
  )
  assertStatus(status, 200, json)
}

// 7a. Create staff member
async function testCreateStaff(): Promise<void> {
  const staffEmail = `staff-${ts}@test.chhaya.dev`
  const { status, json } = await api(
    'POST',
    '/api/staff',
    {
      name: 'Test Cashier',
      email: staffEmail,
      password: 'StaffPass123!',
      phone: '9222222222',
      role: 'CASHIER',
      designation: 'Counter Staff',
      department: 'Sales',
    },
    session1Cookies,
  )
  assertStatus(status, 201, json)
  assert(!!json.id, 'Expected staff id')
  createdStaffId = json.id
}

// 7b. List staff
async function testListStaff(): Promise<void> {
  const { status, json } = await api('GET', '/api/staff', undefined, session1Cookies)
  assertStatus(status, 200, json)
  assert(Array.isArray(json.staff), 'Expected staff array')
  assert(json.total >= 1, 'Expected at least 1 staff member')
}

// 7c. Update staff
async function testUpdateStaff(): Promise<void> {
  const { status, json } = await api(
    'PATCH',
    `/api/staff/${createdStaffId}`,
    { designation: 'Senior Cashier' },
    session1Cookies,
  )
  assertStatus(status, 200, json)
}

// 8. Analytics
async function testAnalytics(): Promise<void> {
  const { status, json } = await api(
    'GET',
    '/api/analytics?range=30',
    undefined,
    session1Cookies,
  )
  assertStatus(status, 200, json)
  assert('revenue' in json, 'Expected revenue field')
  assert('orderCount' in json, 'Expected orderCount field')
  assert('newCustomers' in json, 'Expected newCustomers field')
  assert(Array.isArray(json.revenueByDay), 'Expected revenueByDay array')
}

// 9a. Create agent task
async function testCreateAgentTask(): Promise<void> {
  const { status, json } = await api(
    'POST',
    '/api/agents/tasks',
    {
      agent: 'CORE',
      title: `Test Task ${ts}`,
      description: 'Automated test task — verify API is working',
      priority: 'LOW',
    },
    session1Cookies,
  )
  assertStatus(status, 201, json)
  assert(Array.isArray(json.tasks), 'Expected tasks array')
  assert(json.tasks.length >= 1, 'Expected at least 1 task')
  createdTaskId = json.tasks[0].id
}

// 9b. List agent tasks
async function testListAgentTasks(): Promise<void> {
  const { status, json } = await api('GET', '/api/agents/tasks', undefined, session1Cookies)
  assertStatus(status, 200, json)
  assert(Array.isArray(json.tasks), 'Expected tasks array')
}

// 9c. Agent stats
async function testAgentStats(): Promise<void> {
  const { status, json } = await api('GET', '/api/agents/stats', undefined, session1Cookies)
  assertStatus(status, 200, json)
  assert('totals' in json, 'Expected totals field')
  assert('byStatus' in json, 'Expected byStatus field')
  assert('byAgent' in json, 'Expected byAgent field')
}

// 10. Auth guard — unauthenticated requests return 401
async function testAuthGuardProducts(): Promise<void> {
  const { status } = await api('GET', '/api/products')
  assertStatus(status, 401, { note: 'No cookies sent' })
}

async function testAuthGuardOrders(): Promise<void> {
  const { status } = await api('GET', '/api/orders')
  assertStatus(status, 401, { note: 'No cookies sent' })
}

async function testAuthGuardAnalytics(): Promise<void> {
  const { status } = await api('GET', '/api/analytics')
  assertStatus(status, 401, { note: 'No cookies sent' })
}

// 11. Register store 2 + login
async function testRegisterStore2(): Promise<void> {
  const { status, json } = await api('POST', '/api/auth/register', {
    name: 'Test Owner Two',
    email: store2Email,
    password: store2Password,
    storeName: store2Name,
    phone: '9000000002',
  })
  assertStatus(status, 200, json)
  assert(!!json.userId, 'Expected userId')
  assert(!!json.storeId, 'Expected storeId')
}

async function testLoginStore2(): Promise<void> {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`)
  const csrfJson = await csrfRes.json()
  const csrfToken: string = csrfJson.csrfToken
  const csrfCookie = extractCookies(csrfRes.headers)

  const body = new URLSearchParams({
    csrfToken,
    email: store2Email,
    password: store2Password,
    redirect: 'false',
    json: 'true',
    callbackUrl: BASE,
  })

  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: csrfCookie,
    },
    body: body.toString(),
    redirect: 'manual',
  })

  const loginCookies = extractCookies(loginRes.headers)
  session2Cookies = [csrfCookie, loginCookies].filter(Boolean).join('; ')

  // Confirm store2 session works
  const { status, json } = await api('GET', '/api/products', undefined, session2Cookies)
  assertStatus(status, 200, json)
}

// 11b. Tenant isolation — store2 cannot read store1's product
async function testTenantIsolationProduct(): Promise<void> {
  assert(!!createdProductId, 'No product id from store1 to test isolation with')
  const { status } = await api(
    'GET',
    `/api/products/${createdProductId}`,
    undefined,
    session2Cookies,
  )
  // Should be 404 (record not found in store2's scope) or 403
  assert(
    status === 404 || status === 403,
    `Expected 404 or 403 for cross-tenant product access, got ${status}`,
  )
}

// 11c. Tenant isolation — store2 cannot read store1's customer
async function testTenantIsolationCustomer(): Promise<void> {
  assert(!!createdCustomerId, 'No customer id from store1')
  const { status } = await api(
    'GET',
    `/api/customers/${createdCustomerId}`,
    undefined,
    session2Cookies,
  )
  assert(
    status === 404 || status === 403,
    `Expected 404 or 403 for cross-tenant customer access, got ${status}`,
  )
}

// 11d. Tenant isolation — store2's product list should not contain store1 products
async function testTenantIsolationProductList(): Promise<void> {
  const { status, json } = await api('GET', '/api/products', undefined, session2Cookies)
  assertStatus(status, 200, json)
  const ids: string[] = (json.products ?? []).map((p: any) => p.id)
  assert(
    !ids.includes(createdProductId),
    `Store2 product list contains store1 product id ${createdProductId}`,
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nChhayavastralaya API Test Suite`)
  console.log(`Target: ${BASE}`)
  console.log(`${'─'.repeat(60)}\n`)

  const tests: { name: string; fn: () => Promise<void> }[] = [
    { name: '01 Register store + owner (store 1)', fn: testRegisterStore1 },
    { name: '02 Login store 1 (get session cookie)', fn: testLoginStore1 },
    { name: '03 Create product', fn: testCreateProduct },
    { name: '04 List products', fn: testListProducts },
    { name: '05 Get single product', fn: testGetProduct },
    { name: '06 Update product', fn: testUpdateProduct },
    { name: '07 Soft-delete product', fn: testDeleteProduct },
    { name: '08 Create customer', fn: testCreateCustomer },
    { name: '09 Create order with items', fn: testCreateOrder },
    { name: '10 List orders', fn: testListOrders },
    { name: '11 Get single order', fn: testGetOrder },
    { name: '12 Update order status', fn: testUpdateOrderStatus },
    { name: '13 Cancel order (soft-delete)', fn: testCancelOrder },
    { name: '14 List inventory', fn: testListInventory },
    { name: '15 List customers', fn: testListCustomers },
    { name: '16 Update customer', fn: testUpdateCustomer },
    { name: '17 Create staff member', fn: testCreateStaff },
    { name: '18 List staff', fn: testListStaff },
    { name: '19 Update staff', fn: testUpdateStaff },
    { name: '20 Analytics GET stats', fn: testAnalytics },
    { name: '21 Create agent task', fn: testCreateAgentTask },
    { name: '22 List agent tasks', fn: testListAgentTasks },
    { name: '23 Agent stats GET', fn: testAgentStats },
    { name: '24 Auth guard — /api/products (no cookie)', fn: testAuthGuardProducts },
    { name: '25 Auth guard — /api/orders (no cookie)', fn: testAuthGuardOrders },
    { name: '26 Auth guard — /api/analytics (no cookie)', fn: testAuthGuardAnalytics },
    { name: '27 Register store 2 (tenant isolation setup)', fn: testRegisterStore2 },
    { name: '28 Login store 2', fn: testLoginStore2 },
    { name: '29 Tenant isolation — cannot read store1 product', fn: testTenantIsolationProduct },
    { name: '30 Tenant isolation — cannot read store1 customer', fn: testTenantIsolationCustomer },
    { name: '31 Tenant isolation — product list is scoped', fn: testTenantIsolationProductList },
  ]

  const results: TestResult[] = []

  for (const t of tests) {
    const result = await run(t.name, t.fn)
    results.push(result)

    const icon = result.passed ? '✓' : '✗'
    const label = result.passed ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'
    const suffix = result.error ? `  → ${result.error}` : ''
    console.log(`  ${label} ${t.name}${suffix}`)
  }

  const passed = results.filter((r) => r.passed).length
  const total = results.length
  const failed = total - passed

  console.log(`\n${'─'.repeat(60)}`)
  if (failed === 0) {
    console.log(`\x1b[32m${passed}/${total} tests passed\x1b[0m`)
  } else {
    console.log(`\x1b[31m${passed}/${total} tests passed  (${failed} failed)\x1b[0m`)
  }

  if (failed > 0) {
    console.log('\nFailed tests:')
    results
      .filter((r) => !r.passed)
      .forEach((r) => console.log(`  ✗ ${r.name}\n    ${r.error}`))
  }

  console.log('')
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
