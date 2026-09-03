import { NextResponse } from 'next/server'
import { getClient } from '../../../../lib/db'

export const preferredRegion = 'iad1'

export async function GET() {
  const result = await getClient().execute(`select
    coalesce(max(case when key='total_links' then value end),0) as total_links,
    coalesce(max(case when key='active_links' then value end),0) as active_links,
    coalesce(max(case when key='blocked_links' then value end),0) as blocked_links,
    coalesce(max(case when key='total_clicks' then value end),0) as total_clicks,
    (select count(*) from reports where status='new') as new_reports
    from admin_summary`)
  return NextResponse.json({ summary: result.rows[0] })
}
