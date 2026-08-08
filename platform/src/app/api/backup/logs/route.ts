import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const logs = await db.backupLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return NextResponse.json(logs)
}
