import { getClient } from '../../lib/db'

export const dynamic = 'force-dynamic'

type LinkRow = { slug: string; destination_url: string; clicks: number; status: string; created_at: string }
type ReportRow = { id: number; slug: string; reason: string; email: string; message: string; status: string; created_at: string }

function valueOf(input: string | string[] | undefined) {
  return Array.isArray(input) ? input[0] : input || ''
}

export default async function Admin({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const q = valueOf(params.q).trim()
  const status = valueOf(params.status) || 'active'
  const db = getClient()
  const where: string[] = []
  const args: (string | number)[] = []
  if (status !== 'all') { where.push('status = ?'); args.push(status) }
  if (q) { where.push('(slug like ? or destination_url like ?)'); args.push(`%${q}%`, `%${q}%`) }
  const whereSql = where.length ? `where ${where.join(' and ')}` : ''
  const [counts, links, reports] = await Promise.all([
    db.execute(`select
      count(*) as total_links,
      sum(case when status='active' then 1 else 0 end) as active_links,
      sum(case when status='blocked' then 1 else 0 end) as blocked_links,
      sum(clicks) as total_clicks,
      (select count(*) from reports where status='new') as new_reports
      from links`),
    db.execute({ sql: `select slug,destination_url,clicks,status,created_at from links ${whereSql} order by created_at desc limit 75`, args }),
    db.execute("select id,slug,reason,email,message,status,created_at from reports where status='new' order by created_at desc limit 20"),
  ])
  const stats = counts.rows[0]
  return <main className="shell">
    <nav className="nav"><a className="brand" href="/"><span className="logo">g</span>gURL</a><div className="links"><a href="/">Home</a><a href="/report">Public report form</a></div></nav>
    <section className="admin-header">
      <div><p className="eyebrow">Protected admin area</p><h1>Link moderation</h1><p className="lead">Search links, block policy violations and review abuse reports.</p></div>
    </section>
    <section className="metricgrid">
      <div className="metric"><b>{Number(stats.total_links).toLocaleString()}</b><span>Total links</span></div>
      <div className="metric"><b>{Number(stats.active_links).toLocaleString()}</b><span>Active</span></div>
      <div className="metric"><b>{Number(stats.blocked_links).toLocaleString()}</b><span>Blocked</span></div>
      <div className="metric"><b>{Number(stats.total_clicks).toLocaleString()}</b><span>Total clicks</span></div>
    </section>
    <div className="card admin-tools">
      <h2>Find a link</h2>
      <form className="filterbar" action="/admin">
        <input name="q" defaultValue={q} placeholder="Search slug or destination URL" />
        <select name="status" defaultValue={status}>
          <option value="active">Active</option><option value="blocked">Blocked</option><option value="deleted">Deleted</option><option value="all">All</option>
        </select>
        <button className="btn">Search</button>
      </form>
    </div>
    <div className="card">
      <h2>{q ? 'Search results' : 'Recent links'}</h2>
      <div className="admin-list">
        <div className="admin-row"><b>Slug</b><b>Destination</b><b>Clicks</b><b>Status</b><b>Actions</b></div>
        {(links.rows as unknown as LinkRow[]).map(link => <div className="admin-row" key={link.slug}>
          <a href={`/${link.slug}`} target="_blank">/{link.slug}</a>
          <span className="admin-url">{link.destination_url}</span>
          <span>{Number(link.clicks).toLocaleString()}</span>
          <span className={`pill ${link.status}`}>{link.status}</span>
          <div className="action-row">
            {link.status !== 'blocked' && <ModerateButton slug={link.slug} status="blocked" label="Block" tone="danger" />}
            {link.status !== 'active' && <ModerateButton slug={link.slug} status="active" label="Unblock" />}
            {link.status !== 'deleted' && <ModerateButton slug={link.slug} status="deleted" label="Delete" tone="danger" />}
          </div>
        </div>)}
      </div>
    </div>
    <div className="card">
      <h2>New abuse reports <span className="muted-count">{Number(stats.new_reports).toLocaleString()}</span></h2>
      <div className="report-list">
        {(reports.rows as unknown as ReportRow[]).length === 0 && <p className="lead">No new reports.</p>}
        {(reports.rows as unknown as ReportRow[]).map(report => <div className="report-row" key={report.id}>
          <div><b>/{report.slug}</b><p>{report.reason || report.message || 'No details provided'}</p><small>{report.email || 'anonymous'} · {report.created_at}</small></div>
          <div className="action-row"><ModerateButton slug={report.slug} status="blocked" label="Block link" tone="danger" /><ReportButton id={report.id} /></div>
        </div>)}
      </div>
    </div>
  </main>
}

function ModerateButton({ slug, status, label, tone }: { slug: string; status: string; label: string; tone?: 'danger' }) {
  return <form className="mini-form" action="/api/admin/links" method="post"><input type="hidden" name="slug" value={slug}/><input type="hidden" name="status" value={status}/><button className={`btn small ${tone || ''}`}>{label}</button></form>
}

function ReportButton({ id }: { id: number }) {
  return <form className="mini-form" action="/api/admin/reports" method="post"><input type="hidden" name="id" value={id}/><input type="hidden" name="status" value="reviewed"/><button className="btn small secondary">Mark reviewed</button></form>
}
