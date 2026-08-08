import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export const runtime = 'edge'

export async function GET() {
  try {
    const ctx = getCloudflareContext()
    const envKeys = Object.keys(ctx.env ?? {})
    return NextResponse.json({
      hasContext: true,
      envKeys,
      hasDB: 'DB' in (ctx.env ?? {}),
      dbType: ctx.env?.DB ? typeof ctx.env.DB : 'missing',
    })
  } catch (e) {
    return NextResponse.json({ hasContext: false, error: String(e) })
  }
}
