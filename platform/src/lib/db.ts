import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import { getCloudflareContext } from '@opennextjs/cloudflare'

let _localClient: PrismaClient | undefined

function getClient(): PrismaClient {
  // Cloudflare Workers — D1 adapter per request
  try {
    const { env } = getCloudflareContext()
    if (env?.DB) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return new PrismaClient({ adapter: new PrismaD1(env.DB as any) })
    }
  } catch {
    // Not in Cloudflare context — fall through to local dev
  }

  // Local dev — singleton with WASM engine + DATABASE_URL
  if (!_localClient) {
    _localClient = new PrismaClient()
  }
  return _localClient
}

export const db = new Proxy({} as PrismaClient, {
  get(_, prop: string | symbol) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
