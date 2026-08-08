import { PrismaClient, UserRole, OrderStatus, PaymentStatus, OrderSource, StockMovementType, DiscountType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  const passwordHash = await bcrypt.hash('Demo@1234', 12)

  // ─────────────────────────────────────────────
  // STORE 1: Chhaya Boutique
  // ─────────────────────────────────────────────

  const boutiqueStore = await prisma.$transaction(async (tx) => {
    const store = await tx.store.create({
      data: {
        name: 'Chhaya Boutique',
        slug: 'chhaya-boutique-demo',
        description: 'Premium Indian ethnic wear for the modern woman and man.',
        phone: '9876543210',
        email: 'info@chhayaboutique.com',
        address: { line1: '12, Lajpat Nagar Market', city: 'New Delhi', state: 'Delhi', pincode: '110024', country: 'India' },
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        plan: 'PRO',
      },
    })

    await tx.storeSettings.create({
      data: {
        storeId: store.id,
        lowStockThreshold: 10,
        taxRate: 5,
        invoicePrefix: 'CB',
        receiptMessage: 'Thank you for shopping at Chhaya Boutique! Visit again.',
        whatsappNotifications: true,
        emailNotifications: true,
      },
    })

    // Owner
    const ownerUser = await tx.user.create({
      data: {
        name: 'Priya Sharma',
        email: 'priya@chhayaboutique.com',
        passwordHash,
        phone: '9876543210',
        role: UserRole.OWNER,
        storeId: store.id,
      },
    })

    // Warehouse
    const warehouse = await tx.warehouse.create({
      data: {
        storeId: store.id,
        name: 'Main Warehouse',
        address: { line1: 'Shop No. 12, Lajpat Nagar', city: 'New Delhi', state: 'Delhi', pincode: '110024' },
        isDefault: true,
      },
    })

    // Categories
    const catWomen = await tx.category.create({
      data: { storeId: store.id, name: "Women's Wear", slug: 'womens-wear', description: 'Kurtas, Sarees, Lehengas and more' },
    })
    const catMen = await tx.category.create({
      data: { storeId: store.id, name: "Men's Wear", slug: 'mens-wear', description: 'Shirts, Kurtas and ethnic wear for men' },
    })
    const catAcc = await tx.category.create({
      data: { storeId: store.id, name: 'Accessories', slug: 'accessories', description: 'Dupattas, bags, and fashion accessories' },
    })

    // Products
    const productsData = [
      {
        name: 'Anarkali Kurta Set',
        slug: 'anarkali-kurta-set-cb01',
        sku: 'CB-AKS-001',
        categoryId: catWomen.id,
        costPrice: 850,
        sellingPrice: 1499,
        mrp: 1799,
        taxRate: 5,
        unit: 'piece',
        description: 'Beautiful floral Anarkali kurta with palazzo and dupatta in cotton blend fabric.',
        tags: ['kurta', 'anarkali', 'women', 'cotton'],
        qty: 80,
      },
      {
        name: 'Banarasi Silk Saree',
        slug: 'banarasi-silk-saree-cb02',
        sku: 'CB-BSS-002',
        categoryId: catWomen.id,
        costPrice: 2200,
        sellingPrice: 3999,
        mrp: 4999,
        taxRate: 5,
        unit: 'piece',
        description: 'Pure Banarasi silk saree with gold zari work, perfect for festive occasions.',
        tags: ['saree', 'banarasi', 'silk', 'festive'],
        qty: 35,
      },
      {
        name: 'Lehenga Choli Set',
        slug: 'lehenga-choli-set-cb03',
        sku: 'CB-LCS-003',
        categoryId: catWomen.id,
        costPrice: 3500,
        sellingPrice: 6499,
        mrp: 7999,
        taxRate: 5,
        unit: 'piece',
        description: 'Heavy embroidered lehenga choli with net dupatta, ideal for weddings.',
        tags: ['lehenga', 'bridal', 'wedding', 'embroidered'],
        qty: 20,
      },
      {
        name: 'Straight Fit Kurti',
        slug: 'straight-fit-kurti-cb04',
        sku: 'CB-SFK-004',
        categoryId: catWomen.id,
        costPrice: 350,
        sellingPrice: 699,
        mrp: 899,
        taxRate: 5,
        unit: 'piece',
        description: 'Comfortable daily wear straight cut kurti in printed cotton.',
        tags: ['kurti', 'casual', 'daily wear', 'cotton'],
        qty: 120,
      },
      {
        name: 'Chanderi Silk Dupatta',
        slug: 'chanderi-silk-dupatta-cb05',
        sku: 'CB-CSD-005',
        categoryId: catAcc.id,
        costPrice: 280,
        sellingPrice: 549,
        mrp: 699,
        taxRate: 5,
        unit: 'piece',
        description: 'Light Chanderi silk dupatta with printed border, available in multiple colours.',
        tags: ['dupatta', 'chanderi', 'silk', 'accessory'],
        qty: 150,
      },
      {
        name: 'Embroidered Potli Bag',
        slug: 'embroidered-potli-bag-cb06',
        sku: 'CB-EPB-006',
        categoryId: catAcc.id,
        costPrice: 180,
        sellingPrice: 399,
        mrp: 499,
        taxRate: 5,
        unit: 'piece',
        description: 'Handcrafted embroidered potli bag perfect for ethnic occasions.',
        tags: ['bag', 'potli', 'embroidered', 'ethnic'],
        qty: 90,
      },
      {
        name: "Men's Nehru Jacket",
        slug: 'mens-nehru-jacket-cb07',
        sku: 'CB-MNJ-007',
        categoryId: catMen.id,
        costPrice: 650,
        sellingPrice: 1199,
        mrp: 1499,
        taxRate: 5,
        unit: 'piece',
        description: 'Premium cotton Nehru jacket for men, suitable for festive and formal occasions.',
        tags: ['nehru jacket', 'men', 'festive', 'cotton'],
        qty: 45,
      },
      {
        name: "Men's Pathani Suit",
        slug: 'mens-pathani-suit-cb08',
        sku: 'CB-MPS-008',
        categoryId: catMen.id,
        costPrice: 900,
        sellingPrice: 1699,
        mrp: 1999,
        taxRate: 5,
        unit: 'piece',
        description: 'Classic Pathani suit in premium cotton blend fabric with side pockets.',
        tags: ['pathani', 'men', 'kurta', 'cotton'],
        qty: 60,
      },
      {
        name: "Men's Linen Kurta",
        slug: 'mens-linen-kurta-cb09',
        sku: 'CB-MLK-009',
        categoryId: catMen.id,
        costPrice: 400,
        sellingPrice: 799,
        mrp: 999,
        taxRate: 5,
        unit: 'piece',
        description: 'Breathable linen kurta for men, ideal for summer and casual outings.',
        tags: ['kurta', 'men', 'linen', 'casual'],
        qty: 75,
      },
      {
        name: 'Jute Tote Bag',
        slug: 'jute-tote-bag-cb10',
        sku: 'CB-JTB-010',
        categoryId: catAcc.id,
        costPrice: 120,
        sellingPrice: 249,
        mrp: 349,
        taxRate: 5,
        unit: 'piece',
        description: 'Eco-friendly jute tote bag with hand-block print, perfect for shopping.',
        tags: ['bag', 'jute', 'eco-friendly', 'tote'],
        qty: 110,
      },
    ]

    const products: { id: string; sellingPrice: number; taxRate: number; name: string; inventoryItemId: string }[] = []

    for (const p of productsData) {
      const { qty, ...productFields } = p
      const product = await tx.product.create({
        data: { storeId: store.id, ...productFields },
      })
      const invItem = await tx.inventoryItem.create({
        data: {
          productId: product.id,
          warehouseId: warehouse.id,
          quantity: qty,
          reorderPoint: 10,
          reorderQuantity: 50,
          lastRestockedAt: new Date(),
        },
      })
      products.push({ id: product.id, sellingPrice: product.sellingPrice, taxRate: product.taxRate, name: product.name, inventoryItemId: invItem.id })
    }

    // Staff
    const staffDefs = [
      { name: 'Rahul Kumar', email: 'rahul@chhayaboutique.com', phone: '9812345678', role: UserRole.MANAGER, employeeId: 'EMP001', designation: 'Store Manager', salary: 28000 },
      { name: 'Sunita Devi', email: 'sunita@chhayaboutique.com', phone: '9823456789', role: UserRole.CASHIER, employeeId: 'EMP002', designation: 'Cashier', salary: 18000 },
      { name: 'Ramesh Yadav', email: 'ramesh@chhayaboutique.com', phone: '9834567890', role: UserRole.WAREHOUSE_STAFF, employeeId: 'EMP003', designation: 'Warehouse Staff', salary: 16000 },
    ]

    const staffMembers: { id: string }[] = []
    for (const s of staffDefs) {
      const user = await tx.user.create({
        data: { name: s.name, email: s.email, passwordHash, phone: s.phone, role: s.role, storeId: store.id },
      })
      const staff = await tx.staffMember.create({
        data: {
          storeId: store.id,
          userId: user.id,
          employeeId: s.employeeId,
          designation: s.designation,
          salary: s.salary,
          joinedAt: new Date('2023-01-15'),
          isActive: true,
        },
      })
      staffMembers.push({ id: staff.id })
    }

    // Customers
    const customersData = [
      { name: 'Anjali Singh', phone: '9701234567', email: 'anjali.singh@gmail.com', address: { line1: '45, Karol Bagh', city: 'New Delhi', state: 'Delhi', pincode: '110005' } },
      { name: 'Meena Kumari', phone: '9712345678', email: null, address: { line1: '8, Chandni Chowk', city: 'New Delhi', state: 'Delhi', pincode: '110006' } },
      { name: 'Pooja Verma', phone: '9723456789', email: 'pooja.verma@yahoo.com', address: { line1: '23, Sarojini Nagar', city: 'New Delhi', state: 'Delhi', pincode: '110023' } },
      { name: 'Rekha Gupta', phone: '9734567890', email: null, address: { line1: '67, Rohini Sector 3', city: 'New Delhi', state: 'Delhi', pincode: '110085' } },
      { name: 'Kavita Joshi', phone: '9745678901', email: 'kavita.joshi@gmail.com', address: { line1: '12, Dwarka Sector 10', city: 'New Delhi', state: 'Delhi', pincode: '110075' } },
      { name: 'Suman Patel', phone: '9756789012', email: null, address: { line1: '34, Vasant Kunj', city: 'New Delhi', state: 'Delhi', pincode: '110070' } },
      { name: 'Lalita Mishra', phone: '9767890123', email: 'lalita.mishra@gmail.com', address: { line1: '5, Greater Kailash', city: 'New Delhi', state: 'Delhi', pincode: '110048' } },
      { name: 'Deepa Sharma', phone: '9778901234', email: null, address: { line1: '78, Pitampura', city: 'New Delhi', state: 'Delhi', pincode: '110034' } },
    ]

    const customers: { id: string }[] = []
    for (const c of customersData) {
      const customer = await tx.customer.create({
        data: { storeId: store.id, ...c },
      })
      customers.push({ id: customer.id })
    }

    // Discounts
    await tx.discount.create({
      data: {
        storeId: store.id,
        code: 'WELCOME10',
        type: DiscountType.PERCENTAGE,
        value: 10,
        minOrderValue: 500,
        maxUses: 100,
        isActive: true,
        startsAt: new Date('2024-01-01'),
        expiresAt: new Date('2026-12-31'),
      },
    })
    await tx.discount.create({
      data: {
        storeId: store.id,
        code: 'FLAT200',
        type: DiscountType.FLAT,
        value: 200,
        minOrderValue: 1000,
        maxUses: 200,
        isActive: true,
        startsAt: new Date('2024-01-01'),
        expiresAt: new Date('2026-12-31'),
      },
    })

    // Orders
    const orderDefs = [
      { custIdx: 0, status: OrderStatus.DELIVERED, source: OrderSource.POS, paymentMethod: 'cash', items: [{ pIdx: 0, qty: 2 }, { pIdx: 4, qty: 1 }], date: new Date('2024-11-10') },
      { custIdx: 1, status: OrderStatus.DELIVERED, source: OrderSource.WHATSAPP, paymentMethod: 'upi', items: [{ pIdx: 1, qty: 1 }], date: new Date('2024-11-15') },
      { custIdx: 2, status: OrderStatus.DELIVERED, source: OrderSource.POS, paymentMethod: 'card', items: [{ pIdx: 2, qty: 1 }, { pIdx: 5, qty: 2 }], date: new Date('2024-12-01') },
      { custIdx: 3, status: OrderStatus.CONFIRMED, source: OrderSource.WHATSAPP, paymentMethod: 'upi', items: [{ pIdx: 3, qty: 3 }], date: new Date('2024-12-05') },
      { custIdx: 4, status: OrderStatus.DELIVERED, source: OrderSource.POS, paymentMethod: 'cash', items: [{ pIdx: 6, qty: 1 }, { pIdx: 7, qty: 1 }], date: new Date('2024-12-10') },
      { custIdx: 5, status: OrderStatus.DELIVERED, source: OrderSource.POS, paymentMethod: 'cash', items: [{ pIdx: 8, qty: 2 }], date: new Date('2024-12-15') },
      { custIdx: 6, status: OrderStatus.PENDING, source: OrderSource.WHATSAPP, paymentMethod: 'upi', items: [{ pIdx: 0, qty: 1 }, { pIdx: 9, qty: 3 }], date: new Date('2025-01-03') },
      { custIdx: 7, status: OrderStatus.CONFIRMED, source: OrderSource.POS, paymentMethod: 'card', items: [{ pIdx: 1, qty: 1 }], date: new Date('2025-01-05') },
      { custIdx: 0, status: OrderStatus.DELIVERED, source: OrderSource.POS, paymentMethod: 'cash', items: [{ pIdx: 3, qty: 2 }, { pIdx: 4, qty: 1 }], date: new Date('2025-01-08') },
      { custIdx: 2, status: OrderStatus.DELIVERED, source: OrderSource.WHATSAPP, paymentMethod: 'upi', items: [{ pIdx: 5, qty: 1 }, { pIdx: 9, qty: 2 }], date: new Date('2025-01-12') },
      { custIdx: 1, status: OrderStatus.CONFIRMED, source: OrderSource.POS, paymentMethod: 'cash', items: [{ pIdx: 7, qty: 1 }], date: new Date('2025-01-20') },
      { custIdx: 3, status: OrderStatus.DELIVERED, source: OrderSource.POS, paymentMethod: 'card', items: [{ pIdx: 2, qty: 1 }], date: new Date('2025-02-01') },
      { custIdx: 4, status: OrderStatus.PENDING, source: OrderSource.WHATSAPP, paymentMethod: 'upi', items: [{ pIdx: 6, qty: 2 }], date: new Date('2025-02-10') },
      { custIdx: 6, status: OrderStatus.DELIVERED, source: OrderSource.POS, paymentMethod: 'cash', items: [{ pIdx: 8, qty: 1 }, { pIdx: 0, qty: 1 }], date: new Date('2025-02-15') },
      { custIdx: 5, status: OrderStatus.DELIVERED, source: OrderSource.WHATSAPP, paymentMethod: 'upi', items: [{ pIdx: 1, qty: 1 }, { pIdx: 3, qty: 2 }], date: new Date('2025-02-20') },
    ]

    const customerSpend: Record<string, { total: number; count: number }> = {}

    for (let i = 0; i < orderDefs.length; i++) {
      const def = orderDefs[i]
      const customerId = customers[def.custIdx].id
      const staffId = staffMembers[i % 2].id

      let subtotal = 0
      const orderItemsPayload: {
        productId: string
        productName: string
        quantity: number
        unitPrice: number
        taxRate: number
        taxAmt: number
        discountAmt: number
        total: number
      }[] = []

      for (const item of def.items) {
        const prod = products[item.pIdx]
        const lineSubtotal = prod.sellingPrice * item.qty
        const lineTax = parseFloat(((lineSubtotal * prod.taxRate) / 100).toFixed(2))
        const lineTotal = lineSubtotal + lineTax
        subtotal += lineSubtotal
        orderItemsPayload.push({
          productId: prod.id,
          productName: prod.name,
          quantity: item.qty,
          unitPrice: prod.sellingPrice,
          taxRate: prod.taxRate,
          taxAmt: lineTax,
          discountAmt: 0,
          total: lineTotal,
        })
      }

      const taxAmt = parseFloat(((subtotal * 5) / 100).toFixed(2))
      const total = parseFloat((subtotal + taxAmt).toFixed(2))
      const paymentStatus = def.status === OrderStatus.PENDING ? PaymentStatus.PENDING : PaymentStatus.PAID
      const orderNumber = `CB-${String(2024 + Math.floor(i / 10)).slice(2)}${String(i + 1).padStart(4, '0')}`

      const order = await tx.order.create({
        data: {
          storeId: store.id,
          orderNumber,
          customerId,
          status: def.status,
          paymentStatus,
          paymentMethod: def.paymentMethod,
          subtotal,
          taxAmt,
          discountAmt: 0,
          shippingAmt: 0,
          total,
          source: def.source,
          staffId,
          createdAt: def.date,
          updatedAt: def.date,
          items: { create: orderItemsPayload },
        },
      })

      // StockMovements
      for (const item of def.items) {
        const prod = products[item.pIdx]
        await tx.stockMovement.create({
          data: {
            inventoryItemId: prod.inventoryItemId,
            type: StockMovementType.SALE,
            quantity: -item.qty,
            reference: order.id,
            note: `Sale via order ${orderNumber}`,
            createdAt: def.date,
          },
        })
      }

      if (def.status === OrderStatus.DELIVERED || def.status === OrderStatus.CONFIRMED) {
        if (!customerSpend[customerId]) customerSpend[customerId] = { total: 0, count: 0 }
        customerSpend[customerId].total += total
        customerSpend[customerId].count += 1
      }
    }

    // Update customer totalSpent and orderCount
    for (const [custId, data] of Object.entries(customerSpend)) {
      await tx.customer.update({
        where: { id: custId },
        data: { totalSpent: parseFloat(data.total.toFixed(2)), orderCount: data.count },
      })
    }

    return store
  })

  console.log(`✅ Store 1 created: ${boutiqueStore.name}`)

  // ─────────────────────────────────────────────
  // STORE 2: Rajesh Electronics
  // ─────────────────────────────────────────────

  const electronicsStore = await prisma.$transaction(async (tx) => {
    const store = await tx.store.create({
      data: {
        name: 'Rajesh Electronics',
        slug: 'rajesh-electronics-demo',
        description: 'Your trusted electronics store for mobiles, laptops and accessories.',
        phone: '9988776655',
        email: 'info@rajeshelectronics.com',
        address: { line1: '5, Electronics Market, SP Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560002', country: 'India' },
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        plan: 'FREE',
      },
    })

    await tx.storeSettings.create({
      data: {
        storeId: store.id,
        lowStockThreshold: 10,
        taxRate: 5,
        invoicePrefix: 'RE',
        receiptMessage: 'Thank you for shopping at Rajesh Electronics!',
        whatsappNotifications: true,
        emailNotifications: false,
      },
    })

    // Owner
    await tx.user.create({
      data: {
        name: 'Rajesh Gupta',
        email: 'rajesh@rajeshelectronics.com',
        passwordHash,
        phone: '9988776655',
        role: UserRole.OWNER,
        storeId: store.id,
      },
    })

    // Warehouse
    const warehouse = await tx.warehouse.create({
      data: {
        storeId: store.id,
        name: 'Store Warehouse',
        address: { line1: '5, Electronics Market, SP Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560002' },
        isDefault: true,
      },
    })

    // Categories
    const catMobiles = await tx.category.create({
      data: { storeId: store.id, name: 'Mobile Phones', slug: 'mobile-phones', description: 'Smartphones from top brands' },
    })
    const catAcc = await tx.category.create({
      data: { storeId: store.id, name: 'Accessories', slug: 'accessories', description: 'Chargers, cables, earbuds and more' },
    })
    const catLaptops = await tx.category.create({
      data: { storeId: store.id, name: 'Laptops', slug: 'laptops', description: 'Budget to premium laptops' },
    })

    // Products
    const productsData = [
      { name: 'Redmi Note 13 Pro', slug: 'redmi-note-13-pro-re01', sku: 'RE-RN13P-001', categoryId: catMobiles.id, costPrice: 18000, sellingPrice: 22999, mrp: 24999, taxRate: 18, unit: 'piece', description: '6.67" AMOLED display, 200MP camera, 5000mAh battery.', tags: ['smartphone', 'redmi', 'xiaomi'], qty: 25 },
      { name: 'Samsung Galaxy M34', slug: 'samsung-galaxy-m34-re02', sku: 'RE-SGM34-002', categoryId: catMobiles.id, costPrice: 14000, sellingPrice: 17999, mrp: 19999, taxRate: 18, unit: 'piece', description: '6.5" Super AMOLED, 50MP triple camera, 6000mAh battery.', tags: ['smartphone', 'samsung'], qty: 30 },
      { name: 'Realme Narzo 60', slug: 'realme-narzo-60-re03', sku: 'RE-RN60-003', categoryId: catMobiles.id, costPrice: 11000, sellingPrice: 13999, mrp: 15999, taxRate: 18, unit: 'piece', description: 'Slim design, 64MP camera, 33W fast charging.', tags: ['smartphone', 'realme'], qty: 20 },
      { name: '65W Fast Charger', slug: '65w-fast-charger-re04', sku: 'RE-65WC-004', categoryId: catAcc.id, costPrice: 350, sellingPrice: 699, mrp: 899, taxRate: 18, unit: 'piece', description: 'Universal 65W GaN fast charger with Type-C cable.', tags: ['charger', 'fast charging', 'type-c'], qty: 50 },
      { name: 'Bluetooth Earbuds TWS', slug: 'bluetooth-earbuds-tws-re05', sku: 'RE-TWS-005', categoryId: catAcc.id, costPrice: 800, sellingPrice: 1499, mrp: 1999, taxRate: 18, unit: 'piece', description: 'True wireless earbuds with ANC, 30hr battery, IPX5 water resistant.', tags: ['earbuds', 'tws', 'bluetooth', 'anc'], qty: 40 },
      { name: 'Tempered Glass Pack (3pcs)', slug: 'tempered-glass-3pc-re06', sku: 'RE-TG3P-006', categoryId: catAcc.id, costPrice: 80, sellingPrice: 199, mrp: 299, taxRate: 18, unit: 'piece', description: 'Universal 6.1"-6.7" tempered glass screen protector, pack of 3.', tags: ['screen protector', 'tempered glass', 'accessory'], qty: 100 },
      { name: 'Lenovo IdeaPad Slim 3', slug: 'lenovo-ideapad-slim-3-re07', sku: 'RE-LIS3-007', categoryId: catLaptops.id, costPrice: 35000, sellingPrice: 42999, mrp: 46999, taxRate: 18, unit: 'piece', description: 'Intel Core i5, 8GB RAM, 512GB SSD, 15.6" FHD display.', tags: ['laptop', 'lenovo', 'i5'], qty: 8 },
      { name: 'Type-C Data Cable 1.5m', slug: 'type-c-data-cable-re08', sku: 'RE-TCC-008', categoryId: catAcc.id, costPrice: 60, sellingPrice: 149, mrp: 199, taxRate: 18, unit: 'piece', description: 'Braided Type-C USB cable, 3A fast charging, 1.5m length.', tags: ['cable', 'type-c', 'charging'], qty: 150 },
    ]

    const products: { id: string; sellingPrice: number; taxRate: number; name: string; inventoryItemId: string }[] = []

    for (const p of productsData) {
      const { qty, ...productFields } = p
      const product = await tx.product.create({
        data: { storeId: store.id, ...productFields },
      })
      const invItem = await tx.inventoryItem.create({
        data: {
          productId: product.id,
          warehouseId: warehouse.id,
          quantity: qty,
          reorderPoint: 5,
          reorderQuantity: 20,
          lastRestockedAt: new Date(),
        },
      })
      products.push({ id: product.id, sellingPrice: product.sellingPrice, taxRate: product.taxRate, name: product.name, inventoryItemId: invItem.id })
    }

    // Staff
    const staffDefs = [
      { name: 'Vikram Nair', email: 'vikram@rajeshelectronics.com', phone: '9900112233', role: UserRole.MANAGER, employeeId: 'RE-EMP001', designation: 'Store Manager', salary: 30000 },
      { name: 'Preethi Rao', email: 'preethi@rajeshelectronics.com', phone: '9900223344', role: UserRole.CASHIER, employeeId: 'RE-EMP002', designation: 'Cashier', salary: 20000 },
    ]

    const staffMembers: { id: string }[] = []
    for (const s of staffDefs) {
      const user = await tx.user.create({
        data: { name: s.name, email: s.email, passwordHash, phone: s.phone, role: s.role, storeId: store.id },
      })
      const staff = await tx.staffMember.create({
        data: {
          storeId: store.id,
          userId: user.id,
          employeeId: s.employeeId,
          designation: s.designation,
          salary: s.salary,
          joinedAt: new Date('2023-06-01'),
          isActive: true,
        },
      })
      staffMembers.push({ id: staff.id })
    }

    // Customers
    const customersData = [
      { name: 'Suresh Babu', phone: '9600123456', email: 'suresh.babu@gmail.com', address: { line1: '12, Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038' } },
      { name: 'Kiran Kumar', phone: '9611234567', email: null, address: { line1: '45, Koramangala', city: 'Bengaluru', state: 'Karnataka', pincode: '560034' } },
      { name: 'Anita Reddy', phone: '9622345678', email: 'anita.reddy@gmail.com', address: { line1: '8, Jayanagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560011' } },
      { name: 'Mohammed Farhan', phone: '9633456789', email: null, address: { line1: '23, Shivajinagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' } },
      { name: 'Lakshmi Devi', phone: '9644567890', email: 'lakshmi.devi@yahoo.com', address: { line1: '67, BTM Layout', city: 'Bengaluru', state: 'Karnataka', pincode: '560076' } },
    ]

    const customers: { id: string }[] = []
    for (const c of customersData) {
      const customer = await tx.customer.create({
        data: { storeId: store.id, ...c },
      })
      customers.push({ id: customer.id })
    }

    // Orders
    const orderDefs = [
      { custIdx: 0, status: OrderStatus.DELIVERED, source: OrderSource.POS, paymentMethod: 'upi', items: [{ pIdx: 0, qty: 1 }, { pIdx: 3, qty: 1 }], date: new Date('2024-12-05') },
      { custIdx: 1, status: OrderStatus.DELIVERED, source: OrderSource.WHATSAPP, paymentMethod: 'cash', items: [{ pIdx: 1, qty: 1 }], date: new Date('2024-12-10') },
      { custIdx: 2, status: OrderStatus.CONFIRMED, source: OrderSource.POS, paymentMethod: 'card', items: [{ pIdx: 6, qty: 1 }], date: new Date('2024-12-20') },
      { custIdx: 3, status: OrderStatus.DELIVERED, source: OrderSource.POS, paymentMethod: 'upi', items: [{ pIdx: 4, qty: 2 }, { pIdx: 7, qty: 3 }], date: new Date('2025-01-05') },
      { custIdx: 4, status: OrderStatus.PENDING, source: OrderSource.WHATSAPP, paymentMethod: 'upi', items: [{ pIdx: 2, qty: 1 }], date: new Date('2025-01-15') },
      { custIdx: 0, status: OrderStatus.DELIVERED, source: OrderSource.POS, paymentMethod: 'cash', items: [{ pIdx: 5, qty: 5 }], date: new Date('2025-01-20') },
      { custIdx: 1, status: OrderStatus.CONFIRMED, source: OrderSource.WHATSAPP, paymentMethod: 'upi', items: [{ pIdx: 3, qty: 1 }, { pIdx: 7, qty: 2 }], date: new Date('2025-02-01') },
      { custIdx: 2, status: OrderStatus.DELIVERED, source: OrderSource.POS, paymentMethod: 'card', items: [{ pIdx: 0, qty: 1 }], date: new Date('2025-02-10') },
    ]

    const customerSpend: Record<string, { total: number; count: number }> = {}

    for (let i = 0; i < orderDefs.length; i++) {
      const def = orderDefs[i]
      const customerId = customers[def.custIdx].id
      const staffId = staffMembers[i % staffMembers.length].id

      let subtotal = 0
      const orderItemsPayload: {
        productId: string
        productName: string
        quantity: number
        unitPrice: number
        taxRate: number
        taxAmt: number
        discountAmt: number
        total: number
      }[] = []

      for (const item of def.items) {
        const prod = products[item.pIdx]
        const lineSubtotal = prod.sellingPrice * item.qty
        const lineTax = parseFloat(((lineSubtotal * prod.taxRate) / 100).toFixed(2))
        const lineTotal = lineSubtotal + lineTax
        subtotal += lineSubtotal
        orderItemsPayload.push({
          productId: prod.id,
          productName: prod.name,
          quantity: item.qty,
          unitPrice: prod.sellingPrice,
          taxRate: prod.taxRate,
          taxAmt: lineTax,
          discountAmt: 0,
          total: lineTotal,
        })
      }

      const taxAmt = parseFloat(((subtotal * 18) / 100).toFixed(2))
      const total = parseFloat((subtotal + taxAmt).toFixed(2))
      const paymentStatus = def.status === OrderStatus.PENDING ? PaymentStatus.PENDING : PaymentStatus.PAID
      const orderNumber = `RE-${String(2024 + Math.floor(i / 10)).slice(2)}${String(i + 1).padStart(4, '0')}`

      const order = await tx.order.create({
        data: {
          storeId: store.id,
          orderNumber,
          customerId,
          status: def.status,
          paymentStatus,
          paymentMethod: def.paymentMethod,
          subtotal,
          taxAmt,
          discountAmt: 0,
          shippingAmt: 0,
          total,
          source: def.source,
          staffId,
          createdAt: def.date,
          updatedAt: def.date,
          items: { create: orderItemsPayload },
        },
      })

      // StockMovements
      for (const item of def.items) {
        const prod = products[item.pIdx]
        await tx.stockMovement.create({
          data: {
            inventoryItemId: prod.inventoryItemId,
            type: StockMovementType.SALE,
            quantity: -item.qty,
            reference: order.id,
            note: `Sale via order ${orderNumber}`,
            createdAt: def.date,
          },
        })
      }

      if (def.status === OrderStatus.DELIVERED || def.status === OrderStatus.CONFIRMED) {
        if (!customerSpend[customerId]) customerSpend[customerId] = { total: 0, count: 0 }
        customerSpend[customerId].total += total
        customerSpend[customerId].count += 1
      }
    }

    for (const [custId, data] of Object.entries(customerSpend)) {
      await tx.customer.update({
        where: { id: custId },
        data: { totalSpent: parseFloat(data.total.toFixed(2)), orderCount: data.count },
      })
    }

    return store
  })

  console.log(`✅ Store 2 created: ${electronicsStore.name}`)
  console.log('🎉 Seed completed successfully!')
}

main()
  .then(() => {
    console.log('✅ Done.')
  })
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
