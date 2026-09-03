import './styles.css'
import Script from 'next/script'

export const metadata = {
  title: 'gURL — Free URL Shortener with stats',
  description: 'Shorten, share, moderate and track URLs with a modern gURL stack.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}<Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" /></body></html>
}
