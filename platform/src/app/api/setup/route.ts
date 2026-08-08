import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { getCloudflareContext } from '@opennextjs/cloudflare'

// One-time setup endpoint — disabled once an owner account exists
export async function POST(req: NextRequest) {
  const existing = await db.user.findFirst({ where: { role: 'OWNER' } })
  if (existing) {
    return NextResponse.json({ error: 'Setup already complete. An owner account exists.' }, { status: 400 })
  }

  const { name, email, password, storeName } = await req.json()

  if (!name || !email || !password || !storeName) {
    return NextResponse.json({ error: 'name, email, password, and storeName are required' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const store = await db.store.create({
    data: {
      name: storeName,
      slug: `${slug}-${Math.random().toString(36).slice(2, 6)}`,
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      plan: 'FREE',
      settings: { create: {} },
    },
  })

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'OWNER',
      storeId: store.id,
    },
  })

  return NextResponse.json({
    ok: true,
    message: 'Setup complete! You can now log in.',
    storeId: store.id,
    userId: user.id,
  })
}

export async function GET() {
  // Debug: check CF context before touching db
  let cfDebug: Record<string, unknown> = {}
  try {
    const ctx = getCloudflareContext()
    cfDebug = { hasCtx: true, envKeys: Object.keys(ctx?.env ?? {}), hasDB: !!ctx?.env?.DB }
  } catch (e) {
    cfDebug = { hasCtx: false, ctxError: String(e) }
  }

  try {
    const existing = await db.user.findFirst({ where: { role: 'OWNER' } })
    return NextResponse.json({ setupRequired: !existing, cfDebug })
  } catch (e) {
    return NextResponse.json({ error: String(e), cfDebug }, { status: 500 })
  }
}
