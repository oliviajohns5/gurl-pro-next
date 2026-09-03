import { getClient } from '../../lib/db'

export const dynamic = 'force-dynamic'

type LinkRow = { slug: string; destination_url: string; clicks: number; status: string; created_at: string }

export default async function Admin() {
  const db = getClient()
  const [counts, links] = await Promise.all([
    db.execute(`select
      count(*) as total_links,
      sum(case when status='active' then 1 else 0 end) as active_links,
      sum(clicks) as total_clicks,
      (select count(*) from reports where status='new') as new_reports
      from links`),
    db.execute('select slug,destination_url,clicks,status,created_at from links order by created_at desc limit 50'),
  ])
  const stats = counts.rows[0]
  return <main className="shell">
    <nav className="nav"><a className="brand" href="/"><span className="logo">g</span>gURL</a><div className="links"><a href="/">Home</a><a href="/report">Reports</a></div></nav>
    <section className="admin-header">
      <div><p className="eyebrow">Protected admin area</p><h1>Link moderation</h1><p className="lead">Review recent links, watch activity and remove anything that breaks the rules.</p></div>
    </section>
    <section className="metricgrid">
      <div className="metric"><b>{Number(stats.total_links).toLocaleString()}</b><span>Total links</span></div>
      <div className="metric"><b>{Number(stats.active_links).toLocaleString()}</b><span>Active</span></div>
      <div className="metric"><b>{Number(stats.total_clicks).toLocaleString()}</b><span>Total clicks</span></div>
      <div className="metric"><b>{Number(stats.new_reports).toLocaleString()}</b><span>New reports</span></div>
    </section>
    <div className="card">
      <h2>Recent links</h2>
      <div className="admin-list">
        <div className="admin-row"><b>Slug</b><b>Destination</b><b>Clicks</b><b>Status</b><b>Action</b></div>
        {(links.rows as unknown as LinkRow[]).map(link => <div className="admin-row" key={link.slug}>
          <a href={`/${link.slug}`} target="_blank">/{link.slug}</a>
          <span className="admin-url">{link.destination_url}</span>
          <span>{Number(link.clicks).toLocaleString()}</span>
          <span className="pill">{link.status}</span>
          <form className="mini-form" action="/api/admin/links" method="post"><input type="hidden" name="slug" value={link.slug}/><input type="hidden" name="status" value="blocked"/><button className="btn danger">Block</button></form>
        </div>)}
      </div>
    </div>
  </main>
}
