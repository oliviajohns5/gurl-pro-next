import fs from 'node:fs'
const required = ['app/page.tsx','app/[slug]/route.ts','app/api/shorten/route.ts','db/schema.sql','scripts/import-yourls-url.mjs','scripts/push-schema.mjs','docs/access-needed.md']
for (const f of required) if (!fs.existsSync(f)) throw new Error(`missing ${f}`)
const schema = fs.readFileSync('db/schema.sql','utf8')
for (const term of ['create table if not exists links','create table if not exists daily_clicks','create table if not exists recent_clicks','create table if not exists reports','blocked_domains','blocked_ips']) if (!schema.includes(term)) throw new Error(`schema missing ${term}`)
const pkg = JSON.parse(fs.readFileSync('package.json','utf8'))
if (!pkg.dependencies['@libsql/client']) throw new Error('missing @libsql/client dependency')
if (pkg.dependencies.pg) throw new Error('pg dependency should be removed for free Turso stack')
console.log('gurl Turso migration scaffold verified')
