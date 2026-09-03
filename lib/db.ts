import { Pool } from 'pg'

let pool: Pool | undefined

export function getPool() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not configured')
  pool ||= new Pool({ connectionString, max: 5 })
  return pool
}

export async function getLink(slug: string) {
  const { rows } = await getPool().query(
    'select slug, destination_url, status, clicks from links where slug = $1 limit 1',
    [slug]
  )
  return rows[0] as undefined | { slug: string; destination_url: string; status: string; clicks: number }
}

export async function incrementClick(slug: string, meta: { referrer?: string; userAgent?: string; ip?: string }) {
  await getPool().query('select record_click($1,$2,$3,$4)', [slug, meta.referrer ?? '', meta.userAgent ?? '', meta.ip ?? ''])
}
