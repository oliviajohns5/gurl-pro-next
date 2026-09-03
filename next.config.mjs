/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/yourls-api.php', destination: '/api/shorten', permanent: true },
      { source: '/pages/about.php', destination: '/about', permanent: true },
      { source: '/pages/terms.php', destination: '/terms', permanent: true },
      { source: '/pages/privacy.php', destination: '/privacy', permanent: true },
      { source: '/pages/report.php', destination: '/report', permanent: true },
      { source: '/pages/contact.php', destination: '/contact', permanent: true },
    ]
  },
}
export default nextConfig
