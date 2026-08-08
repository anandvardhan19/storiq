import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync } from 'fs'
import path from 'path'

const DB_PATH = path.resolve(process.cwd(), 'prisma/storiq.db')

export async function POST(req: NextRequest) {
  try {
    const buf = await req.arrayBuffer()
    if (buf.byteLength < 100) {
      return NextResponse.json({ error: 'Invalid backup file' }, { status: 400 })
    }
    // SQLite magic bytes: 53 51 4C 69 74 65 20 66 6F 72 6D 61 74 20 33 00
    const magic = new Uint8Array(buf.slice(0, 16))
    const expected = [83, 81, 76, 105, 116, 101, 32, 102, 111, 114, 109, 97, 116, 32, 51, 0]
    const valid = expected.every((b, i) => magic[i] === b)
    if (!valid) {
      return NextResponse.json({ error: 'Not a valid SQLite database file' }, { status: 400 })
    }
    writeFileSync(DB_PATH, Buffer.from(buf))
    return NextResponse.json({ ok: true, message: 'Database restored. Please restart the server.' })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
