import fs from 'node:fs'
import zlib from 'node:zlib'
import readline from 'node:readline'
import crypto from 'node:crypto'
import { createClient } from '@libsql/client'

const input = process.argv[2]
if (!input || !process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error('Usage: TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... node scripts/import-yourls-url.mjs yourls_url.tsv.gz')
  process.exit(2)
}
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN })
const rl = readline.createInterface({ input: fs.createReadStream(input).pipe(zlib.createGunzip()) })
let n = 0, header = true
let batch = []
async function flush() {
  if (!batch.length) return
  await db.batch(batch, 'write')
  batch = []
}
for await (const line of rl) {
  if (header) { header = false; continue }
  const [keyword, url, title, timestamp, ip, clicks] = line.split('\t')
  if (!keyword || !url) continue
  const ipHash = ip ? crypto.createHash('sha256').update(ip).digest('hex') : ''
  batch.push({
    sql: `insert into links(slug,destination_url,title,created_at,updated_at,creator_ip_hash,clicks,status)
          values(?,?,?,?,?,?,?,'active')
          on conflict(slug) do update set destination_url=excluded.destination_url,title=excluded.title,clicks=excluded.clicks,updated_at=datetime('now')`,
    args: [keyword, url, title ?? '', timestamp || new Date().toISOString(), new Date().toISOString(), ipHash, Number(clicks || 0)],
  })
  n++
  if (batch.length >= 250) await flush()
  if (n % 5000 === 0) console.log(`imported ${n}`)
}
await flush()
const count = await db.execute('select count(*) as count from links')
console.log(`imported ${n} rows; links table count=${count.rows[0].count}`)
