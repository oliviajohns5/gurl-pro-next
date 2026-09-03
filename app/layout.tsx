import './styles.css'

export const metadata = {
  title: 'gURL — Free URL Shortener with stats',
  description: 'Shorten, share, moderate and track URLs with a modern gURL stack.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
