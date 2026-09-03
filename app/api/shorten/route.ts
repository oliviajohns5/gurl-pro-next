import { NextRequest, NextResponse } from 'next/server'
import { customAlphabet } from 'nanoid'
import { normalizeDestination, normalizeSlug } from '../../../lib/validation'
import { getClient } from '../../../lib/db'
import { verifyTurnstile } from '../../../lib/turnstile'
import { assertDestinationAllowed, assertRateLimit } from '../../../lib/safety'

export const preferredRegion = 'iad1'
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 6)

export async function POST(req: NextRequest) {
  const form = await req.formData()
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || ''
    await assertRateLimit(ip)
    const captcha = await verifyTurnstile(String(form.get('cf-turnstile-response') || ''), ip)
    if (!captcha.ok) throw new Error('Captcha verification failed')
    const destination = normalizeDestination(String(form.get('url') || ''))
    await assertDestinationAllowed(destination)
    const requested = normalizeSlug(String(form.get('slug') || ''))
    let slug = requested || nanoid()
    let inserted = false
    for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
      try {
        await getClient().batch([
          { sql: 'insert into links(slug,destination_url,title,status,clicks,created_at,updated_at) values(?,?,?,?,0,datetime(\'now\'),datetime(\'now\'))', args: [slug, destination, '', 'active'] },
          { sql: `insert into admin_summary(key,value,updated_at) values('total_links',1,datetime('now')) on conflict(key) do update set value=value+1, updated_at=datetime('now')`, args: [] },
          { sql: `insert into admin_summary(key,value,updated_at) values('active_links',1,datetime('now')) on conflict(key) do update set value=value+1, updated_at=datetime('now')`, args: [] },
        ], 'write')
        inserted = true
      } catch (error) {
        if (requested) throw new Error('This custom alias is already taken')
        slug = nanoid()
      }
    }
    if (!inserted) throw new Error('Could not generate a unique short link')
    return NextResponse.json({ ok: true, shortUrl: new URL('/' + slug, req.url).toString(), slug })
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 })
  }
}
