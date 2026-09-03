import { createClient } from '@libsql/client'
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN })
const totals = await db.execute(`select
  count(*) as total_links,
  sum(case when status='active' then 1 else 0 end) as active_links,
  sum(case when status='blocked' then 1 else 0 end) as blocked_links,
  sum(case when status='deleted' then 1 else 0 end) as deleted_links,
  sum(clicks) as total_clicks
  from links`)
const row = totals.rows[0]
for (const key of ['total_links','active_links','blocked_links','deleted_links','total_clicks']) {
  await db.execute({
    sql: `insert into admin_summary(key,value,updated_at) values(?,?,datetime('now'))
          on conflict(key) do update set value=excluded.value, updated_at=datetime('now')`,
    args: [key, Number(row[key] ?? 0)],
  })
}
console.log(JSON.stringify(row))
