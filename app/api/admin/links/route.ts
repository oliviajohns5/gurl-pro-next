import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '../../../../lib/db'

export const preferredRegion = 'iad1'
export async function GET() {
  const result = await getClient().execute(
    'select slug,destination_url,clicks,status,created_at from links order by created_at desc limit 100'
  )
  return NextResponse.json({ links: result.rows })
}

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const slug = String(form.get('slug') || '')
  const status = String(form.get('status') || '')
  if (!slug || !['active','blocked','deleted'].includes(status)) {
    return NextResponse.json({ ok: false, error: 'Invalid moderation request' }, { status: 400 })
  }
  const db = getClient()
  const before = await db.execute({ sql: 'select status from links where slug = ? limit 1', args: [slug] })
  const oldStatus = String(before.rows[0]?.status || '')
  await db.execute({
    sql: 'update links set status = ?, updated_at = datetime(\'now\') where slug = ?',
    args: [status, slug],
  })
  if (oldStatus && oldStatus !== status) {
    await db.batch([
      { sql: `insert into admin_summary(key,value,updated_at) values(?,0,datetime('now')) on conflict(key) do nothing`, args: [`${oldStatus}_links`] },
      { sql: `insert into admin_summary(key,value,updated_at) values(?,0,datetime('now')) on conflict(key) do nothing`, args: [`${status}_links`] },
      { sql: `update admin_summary set value = max(value - 1, 0), updated_at = datetime('now') where key = ?`, args: [`${oldStatus}_links`] },
      { sql: `update admin_summary set value = value + 1, updated_at = datetime('now') where key = ?`, args: [`${status}_links`] },
    ], 'write')
  }
  return NextResponse.redirect(new URL('/admin', req.url), 303)
}
