import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '../../../../lib/db'

export const preferredRegion = 'iad1'

export async function GET() {
  const result = await getClient().execute("select id,slug,reason,email,message,status,created_at from reports where status='new' order by created_at desc limit 20")
  return NextResponse.json({ reports: result.rows })
}

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const id = Number(form.get('id') || 0)
  const status = String(form.get('status') || '')
  if (!id || !['new','reviewed','closed'].includes(status)) {
    return NextResponse.json({ ok: false, error: 'Invalid report update' }, { status: 400 })
  }
  await getClient().execute({ sql: 'update reports set status = ? where id = ?', args: [status, id] })
  return NextResponse.json({ ok: true })
}
