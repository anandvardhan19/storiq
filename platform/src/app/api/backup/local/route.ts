import { NextResponse } from 'next/server'
import { readFileSync, statSync, existsSync } from 'fs'
import path from 'path'
import { db } from '@/lib/db'

const DB_PATH = path.resolve(process.cwd(), 'prisma/storiq.db')

export async function GET() {
  if (!existsSync(DB_PATH)) {
    return NextResponse.json({ error: 'Database file not found' }, { status: 404 })
  }

  const stat = statSync(DB_PATH)
  const buf = readFileSync(DB_PATH)
  const filename = `storiq-backup-${new Date().toISOString().slice(0, 10)}.db`

  await db.backupLog.create({
    data: { type: 'local', filename, sizeBytes: stat.size, status: 'success' },
  })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(stat.size),
    },
  })
}
