'use client'

import { useEffect, useMemo, useState } from 'react'

type Summary = { total_links: number; active_links: number; blocked_links: number; total_clicks: number; new_reports: number }
type LinkRow = { slug: string; destination_url: string; clicks: number; status: string; created_at: string }
type ReportRow = { id: number; slug: string; reason: string; email: string; message: string; status: string; created_at: string }

const emptySummary: Summary = { total_links: 0, active_links: 0, blocked_links: 0, total_clicks: 0, new_reports: 0 }

export default function AdminDashboard() {
  const [summary, setSummary] = useState<Summary>(emptySummary)
  const [links, setLinks] = useState<LinkRow[]>([])
  const [reports, setReports] = useState<ReportRow[]>([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('active')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('Loading moderation data…')

  const query = useMemo(() => new URLSearchParams({ q, status }), [q, status])

  async function load() {
    setLoading(true)
    setMessage('Loading moderation data…')
    try {
      const [summaryRes, linksRes, reportsRes] = await Promise.all([
        fetch('/api/admin/summary', { cache: 'no-store' }),
        fetch('/api/admin/links?' + query.toString(), { cache: 'no-store' }),
        fetch('/api/admin/reports', { cache: 'no-store' }),
      ])
      const [summaryJson, linksJson, reportsJson] = await Promise.all([summaryRes.json(), linksRes.json(), reportsRes.json()])
      setSummary(summaryJson.summary || emptySummary)
      setLinks(linksJson.links || [])
      setReports(reportsJson.reports || [])
      setMessage('')
    } catch {
      setMessage('Could not load admin data. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function moderate(slug: string, nextStatus: string) {
    setMessage('Saving moderation change…')
    const data = new FormData()
    data.set('slug', slug)
    data.set('status', nextStatus)
    const res = await fetch('/api/admin/links', { method: 'POST', body: data })
    if (!res.ok) setMessage('Could not save moderation change.')
    await load()
  }

  async function reviewReport(id: number) {
    setMessage('Updating report…')
    const data = new FormData()
    data.set('id', String(id))
    data.set('status', 'reviewed')
    const res = await fetch('/api/admin/reports', { method: 'POST', body: data })
    if (!res.ok) setMessage('Could not update report.')
    await load()
  }

  return <>
    <section className="metricgrid">
      <Metric label="Total links" value={summary.total_links} loading={loading} />
      <Metric label="Active" value={summary.active_links} loading={loading} />
      <Metric label="Blocked" value={summary.blocked_links} loading={loading} />
      <Metric label="Total clicks" value={summary.total_clicks} loading={loading} />
    </section>
    <div className="card admin-tools">
      <h2>Find a link</h2>
      <form className="filterbar" onSubmit={(event) => { event.preventDefault(); load() }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search slug or destination URL" />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">Active</option><option value="blocked">Blocked</option><option value="deleted">Deleted</option><option value="all">All</option>
        </select>
        <button className="btn">Search</button>
      </form>
      {message && <p className="admin-message">{message}</p>}
    </div>
    <div className="card">
      <h2>{q ? 'Search results' : 'Recent links'}</h2>
      <div className="admin-list">
        <div className="admin-row"><b>Slug</b><b>Destination</b><b>Clicks</b><b>Status</b><b>Actions</b></div>
        {links.map(link => <div className="admin-row" key={link.slug}>
          <a href={`/${link.slug}`} target="_blank">/{link.slug}</a>
          <span className="admin-url">{link.destination_url}</span>
          <span>{Number(link.clicks).toLocaleString()}</span>
          <span className={`pill ${link.status}`}>{link.status}</span>
          <div className="action-row">
            {link.status !== 'blocked' && <button className="btn small danger" onClick={() => moderate(link.slug, 'blocked')}>Block</button>}
            {link.status !== 'active' && <button className="btn small" onClick={() => moderate(link.slug, 'active')}>Unblock</button>}
            {link.status !== 'deleted' && <button className="btn small danger" onClick={() => moderate(link.slug, 'deleted')}>Delete</button>}
          </div>
        </div>)}
        {!loading && links.length === 0 && <p className="lead">No links found.</p>}
      </div>
    </div>
    <div className="card">
      <h2>New abuse reports <span className="muted-count">{summary.new_reports.toLocaleString()}</span></h2>
      <div className="report-list">
        {!loading && reports.length === 0 && <p className="lead">No new reports.</p>}
        {reports.map(report => <div className="report-row" key={report.id}>
          <div><b>/{report.slug}</b><p>{report.reason || report.message || 'No details provided'}</p><small>{report.email || 'anonymous'} · {report.created_at}</small></div>
          <div className="action-row"><button className="btn small danger" onClick={() => moderate(report.slug, 'blocked')}>Block link</button><button className="btn small secondary" onClick={() => reviewReport(report.id)}>Mark reviewed</button></div>
        </div>)}
      </div>
    </div>
  </>
}

function Metric({ label, value, loading }: { label: string; value: number; loading: boolean }) {
  return <div className="metric"><b>{loading ? '…' : Number(value).toLocaleString()}</b><span>{label}</span></div>
}
