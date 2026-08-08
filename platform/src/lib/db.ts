import { PrismaClient } from '@prisma/client'

let _localClient: PrismaClient | undefined

function getClient(): PrismaClient {
  // Cloudflare Workers environment — D1 adapter per request
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require('@opennextjs/cloudflare')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaD1 } = require('@prisma/adapter-d1')
    const { env } = getCloudflareContext()
    if (env?.DB) {
      return new PrismaClient({ adapter: new PrismaD1(env.DB) })
    }
  } catch {
    // Not in Cloudflare environment — fall through to local
  }

  // Local dev — reuse singleton to avoid "too many clients" warning
  if (!_localClient) {
    _localClient = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  }
  return _localClient
}

// Proxy so all existing `db.user.findMany()` calls work unchanged.
// On Cloudflare each property access fetches a fresh D1-backed client.
// Locally it always returns the same singleton.
export const db = new Proxy({} as PrismaClient, {
  get(_, prop: string | symbol) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
