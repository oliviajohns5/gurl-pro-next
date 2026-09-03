import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.startsWith('/api/admin')) return NextResponse.next()
  const user = process.env.ADMIN_USERNAME || 'admin'
  const pass = process.env.ADMIN_PASSWORD
  if (!pass) return new NextResponse('Admin password is not configured', { status: 503 })
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Basic ')) {
    const [u, p] = atob(auth.slice(6)).split(':')
    if (u === user && p === pass) return NextResponse.next()
  }
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="gURL admin"' },
  })
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] }
