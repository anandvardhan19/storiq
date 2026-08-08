import { NextRequest, NextResponse } from 'next/server'
import { auth, drive } from '@googleapis/drive'
import { db } from '@/lib/db'

const FOLDER_NAME = 'Storiq Backups'

function getOAuth2Client() {
  return new auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/backup/gdrive/callback`
  )
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  if (action === 'auth') {
    const oauth2 = getOAuth2Client()
    const url = oauth2.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/drive.file'],
    })
    return NextResponse.redirect(url)
  }

  const settings = await db.storeSettings.findFirst()
  if (!settings?.gdriveRefreshToken) {
    return NextResponse.json({ error: 'Google Drive not connected. Visit /settings to connect.' }, { status: 400 })
  }
  return runBackup(settings.gdriveRefreshToken)
}

export async function POST(req: NextRequest) {
  const { refreshToken } = await req.json()
  if (!refreshToken) return NextResponse.json({ error: 'refreshToken required' }, { status: 400 })
  return runBackup(refreshToken)
}

async function runBackup(refreshToken: string) {
  const [stores, users, products, categories, customers, orders, orderItems,
    staff, attendance, suppliers, warehouses, inventory, payments,
    fulfillments, discounts, reviews] = await Promise.all([
    db.store.findMany(), db.user.findMany({ select: { id: true, email: true, name: true, role: true, storeId: true, createdAt: true } }),
    db.product.findMany(), db.category.findMany(), db.customer.findMany(),
    db.order.findMany(), db.orderItem.findMany(), db.staffMember.findMany(),
    db.attendance.findMany(), db.supplier.findMany(), db.warehouse.findMany(),
    db.inventoryItem.findMany(), db.payment.findMany(), db.fulfillment.findMany(),
    db.discount.findMany(), db.review.findMany(),
  ])

  const body = JSON.stringify({ version: '1.0', exportedAt: new Date().toISOString(), app: 'Storiq',
    data: { stores, users, products, categories, customers, orders, orderItems, staff, attendance,
      suppliers, warehouses, inventory, payments, fulfillments, discounts, reviews } }, null, 2)

  const filename = `storiq-backup-${new Date().toISOString().slice(0, 10)}.json`

  const oauth2 = getOAuth2Client()
  oauth2.setCredentials({ refresh_token: refreshToken })
  const driveClient = drive({ version: 'v3', auth: oauth2 })

  const folderRes = await driveClient.files.list({
    q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
  })
  let folderId = folderRes.data.files?.[0]?.id
  if (!folderId) {
    const created = await driveClient.files.create({
      requestBody: { name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' },
      fields: 'id',
    })
    folderId = created.data.id!
  }

  const uploaded = await driveClient.files.create({
    requestBody: { name: filename, parents: [folderId] },
    media: { mimeType: 'application/json', body },
    fields: 'id,name',
  })

  await db.backupLog.create({
    data: { type: 'gdrive', filename, sizeBytes: Buffer.byteLength(body), status: 'success', gdriveId: uploaded.data.id ?? null },
  })
  await db.storeSettings.updateMany({ data: { lastBackupAt: new Date() } })

  return NextResponse.json({ ok: true, filename, gdriveId: uploaded.data.id })
}
