import { getClient } from './db'

export function hostnameFromUrl(url: string) {
  return new URL(url).hostname.toLowerCase().replace(/^www\./, '')
}

export async function assertDestinationAllowed(url: string) {
  const host = hostnameFromUrl(url)
  const parts = host.split('.')
  const candidates = parts.map((_, i) => parts.slice(i).join('.'))
  const placeholders = candidates.map(() => '?').join(',')
  const result = await getClient().execute({
    sql: `select domain from blocked_domains where domain in (${placeholders}) limit 1`,
    args: candidates,
  })
  if (result.rows[0]) throw new Error('This destination domain is blocked')
}

export async function assertRateLimit(ip: string) {
  const bucket = new Date().toISOString().slice(0, 13)
  const key = `${ip || 'unknown'}:${bucket}`
  const db = getClient()
  await db.execute({
    sql: `insert into rate_limits(key, hits, updated_at) values(?, 1, datetime('now'))
          on conflict(key) do update set hits = hits + 1, updated_at = datetime('now')`,
    args: [key],
  })
  const result = await db.execute({ sql: 'select hits from rate_limits where key = ?', args: [key] })
  const hits = Number(result.rows[0]?.hits ?? 0)
  if (hits > 30) throw new Error('Too many links created from this connection. Please try again later.')
}
