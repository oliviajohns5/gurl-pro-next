import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '../../../../lib/db'

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
  await getClient().execute({
    sql: 'update links set status = ?, updated_at = datetime(\'now\') where slug = ?',
    args: [status, slug],
  })
  return NextResponse.redirect(new URL('/admin', req.url), 303)
}
