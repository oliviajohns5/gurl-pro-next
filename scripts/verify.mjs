import fs from 'node:fs'
const required = ['app/page.tsx','app/[slug]/route.ts','app/api/shorten/route.ts','db/schema.sql','scripts/import-yourls-url.mjs','docs/access-needed.md']
for (const f of required) if (!fs.existsSync(f)) throw new Error(`missing ${f}`)
const schema = fs.readFileSync('db/schema.sql','utf8')
for (const term of ['create table if not exists links','create table if not exists click_events','create table if not exists reports','record_click']) if (!schema.includes(term)) throw new Error(`schema missing ${term}`)
console.log('gurl migration scaffold verified')
