import { createClient, type Client } from '@libsql/client'

let client: Client | undefined

async function sha256(value: string) {
  const input = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', input)
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function getClient() {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN
  if (!url) throw new Error('TURSO_DATABASE_URL is not configured')
  if (!authToken) throw new Error('TURSO_AUTH_TOKEN is not configured')
  client ||= createClient({ url, authToken })
  return client
}

export async function getLink(slug: string) {
  const result = await getClient().execute({
    sql: 'select slug, destination_url, status, clicks from links where slug = ? limit 1',
    args: [slug],
  })
  const row = result.rows[0]
  if (!row) return undefined
  return {
    slug: String(row.slug),
    destination_url: String(row.destination_url),
    status: String(row.status),
    clicks: Number(row.clicks ?? 0),
  }
}

export async function incrementClick(slug: string, meta: { referrer?: string; userAgent?: string; ip?: string }) {
  const today = new Date().toISOString().slice(0, 10)
  const db = getClient()
  await db.batch([
    { sql: 'update links set clicks = clicks + 1, updated_at = datetime(\'now\') where slug = ?', args: [slug] },
    {
      sql: `insert into daily_clicks(slug, day, clicks) values(?, ?, 1)
            on conflict(slug, day) do update set clicks = clicks + 1`,
      args: [slug, today],
    },
    {
      sql: `insert into recent_clicks(slug, clicked_at, referrer, user_agent, ip_hash)
            values(?, datetime('now'), substr(?,1,500), substr(?,1,500), ?)`,
      args: [slug, meta.referrer ?? '', meta.userAgent ?? '', await sha256(meta.ip ?? '')],
    },
  ], 'write')
}
