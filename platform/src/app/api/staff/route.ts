import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { getSessionOrUnauth, paginate } from '@/lib/api'

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  role: z.enum(['MANAGER', 'CASHIER', 'WAREHOUSE_STAFF', 'VIEWER']).default('CASHIER'),
  employeeId: z.string().optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  salary: z.number().optional(),
  joinedAt: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  const sp = req.nextUrl.searchParams
  const { skip, take } = paginate(sp)

  const storeId = session!.user.storeId!

  const [staff, total] = await Promise.all([
    db.staffMember.findMany({
      where: { storeId },
      skip,
      take,
      orderBy: { user: { name: 'asc' } },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, role: true, avatar: true } },
      },
    }),
    db.staffMember.count({ where: { storeId } }),
  ])

  return NextResponse.json({ staff, total })
}

export async function POST(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  const requesterRole = session!.user.role
  if (requesterRole !== 'OWNER' && requesterRole !== 'MANAGER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const data = createSchema.parse(body)
    const storeId = session!.user.storeId!

    const existing = await db.user.findUnique({ where: { email: data.email.toLowerCase() } })
    if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })

    const passwordHash = await bcrypt.hash(data.password, 12)

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase(),
          passwordHash,
          phone: data.phone,
          role: data.role,
          storeId,
        },
      })

      const member = await tx.staffMember.create({
        data: {
          storeId,
          userId: user.id,
          employeeId: data.employeeId,
          designation: data.designation,
          department: data.department,
          salary: data.salary,
          joinedAt: data.joinedAt ? new Date(data.joinedAt) : undefined,
        },
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
      })

      return member
    })

    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
