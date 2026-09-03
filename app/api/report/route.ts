import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '../../../lib/db'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  await getPool().query('insert into reports(slug,reason,email,message,status,created_at) values($1,$2,$3,$4,$5,now())', [
    String(form.get('slug') || ''), String(form.get('reason') || ''), String(form.get('email') || ''), String(form.get('message') || ''), 'new'
  ])
  return NextResponse.json({ ok: true })
}
