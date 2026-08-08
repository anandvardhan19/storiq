import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import fsp from 'fs/promises'

// unenv (bundled inside OpenNext for edge compat) stubs fs/promises.readdir as
// "not implemented" — Prisma's libssl detection only ignores ENOENT, so it crashes.
// Patch the shared module object so Prisma sees ENOENT instead.
const _origReaddir = fsp.readdir as unknown as (...args: unknown[]) => Promise<unknown>
;(fsp as unknown as Record<string, unknown>).readdir = async function patchedReaddir(
  path: unknown,
  ...rest: unknown[]
) {
  try {
    return await _origReaddir(path, ...rest)
  } catch (err: unknown) {
    const msg = (err as Error).message ?? ''
    if (msg.includes('not implemented') || msg.includes('ENOSYS')) {
      const e = Object.assign(
        new Error(`ENOENT: no such file or directory, scandir '${path}'`),
        { code: 'ENOENT' }
      )
      throw e
    }
    throw err
  }
}

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
