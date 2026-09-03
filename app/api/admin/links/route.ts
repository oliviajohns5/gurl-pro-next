import { NextResponse } from 'next/server'
import { getPool } from '../../../../lib/db'

export async function GET() {
  const { rows } = await getPool().query('select slug,destination_url,clicks,status,created_at from links order by created_at desc limit 100')
  return NextResponse.json({ links: rows })
}
