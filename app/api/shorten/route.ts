import { NextRequest, NextResponse } from 'next/server'
import { customAlphabet } from 'nanoid'
import { normalizeDestination, normalizeSlug } from '../../../lib/validation'
import { getClient } from '../../../lib/db'
import { verifyTurnstile } from '../../../lib/turnstile'

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 6)

export async function POST(req: NextRequest) {
  const form = await req.formData()
  try {
    const captcha = await verifyTurnstile(String(form.get('cf-turnstile-response') || ''), req.headers.get('x-forwarded-for')?.split(',')[0])
    if (!captcha.ok) throw new Error('Captcha verification failed')
    const destination = normalizeDestination(String(form.get('url') || ''))
    const requested = normalizeSlug(String(form.get('slug') || ''))
    const slug = requested || nanoid()
    await getClient().execute({
      sql: 'insert into links(slug,destination_url,title,status,clicks,created_at,updated_at) values(?,?,?,?,0,datetime(\'now\'),datetime(\'now\'))',
      args: [slug, destination, '', 'active'],
    })
    return NextResponse.json({ ok: true, shortUrl: new URL('/' + slug, req.url).toString(), slug })
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 })
  }
}
