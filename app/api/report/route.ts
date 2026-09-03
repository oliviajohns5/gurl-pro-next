import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '../../../lib/db'

export const preferredRegion = 'iad1'
export async function POST(req: NextRequest) {
  const form = await req.formData()
  await getClient().execute({
    sql: 'insert into reports(slug,reason,email,message,status,created_at) values(?,?,?,?,?,datetime(\'now\'))',
    args: [String(form.get('slug') || ''), String(form.get('reason') || ''), String(form.get('email') || ''), String(form.get('message') || ''), 'new'],
  })
  return NextResponse.json({ ok: true })
}
