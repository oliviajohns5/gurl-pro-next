import { NextRequest, NextResponse } from 'next/server'
import { getLink, incrementClick } from '../../lib/db'
import { isReservedSlug } from '../../lib/reserved'

export const preferredRegion = 'iad1'
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (isReservedSlug(slug)) return NextResponse.next()
  const link = await getLink(slug)
  if (!link || link.status !== 'active') return NextResponse.redirect(new URL('/', req.url), 302)
  let destination: URL
  try {
    destination = new URL(link.destination_url)
  } catch {
    console.error('Invalid stored destination URL', { slug })
    return NextResponse.redirect(new URL('/', req.url), 302)
  }
  await incrementClick(slug, {
    referrer: req.headers.get('referer') ?? undefined,
    userAgent: req.headers.get('user-agent') ?? undefined,
    ip: req.headers.get('x-forwarded-for')?.split(',')[0]
  })
  return NextResponse.redirect(destination, 302)
}
