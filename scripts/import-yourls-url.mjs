import fs from 'node:fs'
import zlib from 'node:zlib'
import readline from 'node:readline'
import pg from 'pg'

const input = process.argv[2]
if (!input || !process.env.DATABASE_URL) {
  console.error('Usage: DATABASE_URL=postgres://... node scripts/import-yourls-url.mjs yourls_url.tsv.gz')
  process.exit(2)
}
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 4 })
const rl = readline.createInterface({ input: fs.createReadStream(input).pipe(zlib.createGunzip()) })
let n = 0
let header = true
for await (const line of rl) {
  if (header) { header = false; continue }
  const [keyword, url, title, timestamp, ip, clicks] = line.split('\t')
  if (!keyword || !url) continue
  await pool.query(
    `insert into links(slug,destination_url,title,created_at,creator_ip_hash,clicks,status)
     values($1,$2,$3,$4,md5($5),$6,'active')
     on conflict(slug) do update set destination_url=excluded.destination_url,title=excluded.title,clicks=excluded.clicks`,
    [keyword, url, title ?? '', timestamp, ip ?? '', Number(clicks || 0)]
  )
  n++
  if (n % 1000 === 0) process.stdout.write(`imported ${n}\r`)
}
await pool.end()
console.log(`\nimported ${n} links`)
