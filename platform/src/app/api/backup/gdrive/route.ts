import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { readFileSync, statSync, existsSync } from 'fs'
import { Readable } from 'stream'
import path from 'path'
import { db } from '@/lib/db'

const DB_PATH = path.resolve(process.cwd(), 'prisma/storiq.db')
const FOLDER_NAME = 'Storiq Backups'

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/backup/gdrive/callback`
  )
}

// GET /api/backup/gdrive — start OAuth or trigger backup if token stored
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') // 'auth' | 'run'

  if (action === 'auth') {
    const oauth2 = getOAuth2Client()
    const url = oauth2.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/drive.file'],
    })
    return NextResponse.redirect(url)
  }

  // action === 'run' — use stored refresh token
  const settings = await db.storeSettings.findFirst()
  if (!settings?.gdriveRefreshToken) {
    return NextResponse.json({ error: 'Google Drive not connected. Visit /settings to connect.' }, { status: 400 })
  }

  return runBackup(settings.gdriveRefreshToken)
}

// POST /api/backup/gdrive — trigger backup with provided refresh token
export async function POST(req: NextRequest) {
  const { refreshToken } = await req.json()
  if (!refreshToken) return NextResponse.json({ error: 'refreshToken required' }, { status: 400 })
  return runBackup(refreshToken)
}

async function runBackup(refreshToken: string) {
  if (!existsSync(DB_PATH)) {
    return NextResponse.json({ error: 'Database file not found' }, { status: 404 })
  }

  const oauth2 = getOAuth2Client()
  oauth2.setCredentials({ refresh_token: refreshToken })
  const drive = google.drive({ version: 'v3', auth: oauth2 })

  // Find or create the backup folder
  const folderRes = await drive.files.list({
    q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
  })
  let folderId = folderRes.data.files?.[0]?.id
  if (!folderId) {
    const created = await drive.files.create({
      requestBody: { name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' },
      fields: 'id',
    })
    folderId = created.data.id!
  }

  const buf = readFileSync(DB_PATH)
  const stat = statSync(DB_PATH)
  const filename = `storiq-backup-${new Date().toISOString().slice(0, 10)}.db`

  const uploaded = await drive.files.create({
    requestBody: { name: filename, parents: [folderId] },
    media: { mimeType: 'application/octet-stream', body: Readable.from(buf) },
    fields: 'id,name,size',
  })

  await db.backupLog.create({
    data: {
      type: 'gdrive',
      filename,
      sizeBytes: stat.size,
      status: 'success',
      gdriveId: uploaded.data.id ?? null,
    },
  })

  // Update lastBackupAt in settings
  await db.storeSettings.updateMany({ data: { lastBackupAt: new Date() } })

  return NextResponse.json({ ok: true, filename, gdriveId: uploaded.data.id })
}
