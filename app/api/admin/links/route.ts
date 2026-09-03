import { NextResponse } from 'next/server'
import { getClient } from '../../../../lib/db'

export async function GET() {
  const result = await getClient().execute(
    'select slug,destination_url,clicks,status,created_at from links order by created_at desc limit 100'
  )
  return NextResponse.json({ links: result.rows })
}
