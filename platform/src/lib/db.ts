import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import { getCloudflareContext } from '@opennextjs/cloudflare'

let _localClient: PrismaClient | undefined

function getClient(): PrismaClient {
  // Cloudflare Workers environment — use D1 adapter per request
  let cfError: unknown
  try {
    const { env } = getCloudflareContext()
    if (env?.DB) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return new PrismaClient({ adapter: new PrismaD1(env.DB as any) })
    } else {
      console.log('[db] getCloudflareContext succeeded but env.DB is missing. envKeys:', Object.keys(env ?? {}))
    }
  } catch (e) {
    cfError = e
  }

  // If we had a context error, log it (only on Cloudflare — local dev won't have context)
  if (cfError && typeof globalThis !== 'undefined' && (globalThis as any)[Symbol.for('__cloudflare-context__')]) {
    console.error('[db] Cloudflare context available but getClient failed:', cfError)
  }

  // Local dev — reuse singleton (native library engine via DATABASE_URL)
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
