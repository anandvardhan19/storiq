import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { slugify } from '@/lib/utils'

function isDbError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  return err.constructor.name.includes('Prisma') ||
    err.message.includes('DATABASE_URL') ||
    err.message.includes('connect ECONNREFUSED') ||
    err.message.includes('Environment variable not found')
}

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  storeName: z.string().min(2),
  phone: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)

    const existing = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
    })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(data.password, 12)

    // Create store + owner user in a transaction
    const result = await db.$transaction(async (tx) => {
      const storeSlug = slugify(data.storeName) + '-' + Math.random().toString(36).substring(2, 6)

      const store = await tx.store.create({
        data: {
          name: data.storeName,
          slug: storeSlug,
          settings: { create: {} },
        },
      })

      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase(),
          passwordHash,
          phone: data.phone,
          role: 'OWNER',
          storeId: store.id,
        },
      })

      return { user, store }
    })

    return NextResponse.json({
      message: 'Account created',
      userId: result.user.id,
      storeId: result.store.id,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    console.error(err)
    const msg = isDbError(err)
      ? 'Database not configured. Add DATABASE_URL to .env and run: npm run db:push'
      : 'Internal server error'
    return NextResponse.json({ error: msg }, { status: isDbError(err) ? 503 : 500 })
  }
}
