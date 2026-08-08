import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

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
  const existing = await db.user.findFirst({ where: { role: 'OWNER' } })
  return NextResponse.json({ setupRequired: !existing })
}
