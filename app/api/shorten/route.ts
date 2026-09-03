import { NextRequest, NextResponse } from 'next/server'
import { customAlphabet } from 'nanoid'
import { normalizeDestination, normalizeSlug } from '../../../lib/validation'
import { getPool } from '../../../lib/db'

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 6)

export async function POST(req: NextRequest) {
  const form = await req.formData()
  try {
    const destination = normalizeDestination(String(form.get('url') || ''))
    const requested = normalizeSlug(String(form.get('slug') || ''))
    const slug = requested || nanoid()
    await getPool().query(
      'insert into links(slug,destination_url,title,status,clicks,created_at) values($1,$2,$3,$4,0,now())',
      [slug, destination, '', 'active']
    )
    return NextResponse.json({ ok: true, shortUrl: new URL('/' + slug, req.url).toString(), slug })
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 })
  }
}
