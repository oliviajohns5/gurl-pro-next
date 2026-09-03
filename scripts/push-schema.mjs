import fs from 'node:fs'
import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN
if (!url || !authToken) throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required')
const db = createClient({ url, authToken })
const statements = fs.readFileSync('db/schema.sql', 'utf8')
  .split(/;\s*(?:\n|$)/)
  .map(s => s.trim())
  .filter(Boolean)
for (const sql of statements) await db.execute(sql)
const result = await db.execute("select name from sqlite_master where type='table' order by name")
console.log('schema applied:', result.rows.map(r => r.name).join(', '))
