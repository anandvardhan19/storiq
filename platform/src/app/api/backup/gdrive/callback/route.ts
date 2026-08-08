import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@googleapis/drive'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'No code' }, { status: 400 })

  const oauth2 = new auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/backup/gdrive/callback`
  )

  const { tokens } = await oauth2.getToken(code)
  const refreshToken = tokens.refresh_token
  if (!refreshToken) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings?backup=error&reason=no_refresh_token`)
  }

  // Store the refresh token in StoreSettings (upsert first record)
  const existing = await db.storeSettings.findFirst()
  if (existing) {
    await db.storeSettings.update({ where: { id: existing.id }, data: { gdriveRefreshToken: refreshToken } })
  } else {
    // Need a storeId — find any store or skip
    const store = await db.store.findFirst()
    if (store) {
      await db.storeSettings.create({ data: { storeId: store.id, gdriveRefreshToken: refreshToken } })
    }
  }

  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings?backup=gdrive_connected`)
}
