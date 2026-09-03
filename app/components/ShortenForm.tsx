'use client'

import { useState } from 'react'

type Result = { ok: true; shortUrl: string; slug: string } | { ok: false; error: string } | null

export default function ShortenForm({ siteKey }: { siteKey: string }) {
  const [result, setResult] = useState<Result>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setResult(null)
    setCopied(false)
    const form = event.currentTarget
    const data = new FormData(form)
    try {
      const res = await fetch('/api/shorten', { method: 'POST', body: data })
      const json = await res.json()
      setResult(json)
      if (json.ok) form.reset()
      const turnstile = (window as unknown as { turnstile?: { reset: () => void } }).turnstile
      turnstile?.reset?.()
    } catch {
      setResult({ ok: false, error: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  async function copy(url: string) {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2200)
  }

  return <form id="shorten" className="card shorten hero-card" onSubmit={onSubmit}>
    <label>
      <span>Long URL</span>
      <input name="url" placeholder="https://example.com/very/long/link" required />
    </label>
    <div className="row">
      <label>
        <span>Custom alias</span>
        <input name="slug" placeholder="optional" />
      </label>
      <button className="btn" disabled={loading}>{loading ? 'Creating…' : 'Shorten'}</button>
    </div>
    <div className="cf-turnstile" data-sitekey={siteKey}></div>
    <small>We check new links before saving them to help keep gURL safe.</small>
    {result?.ok && <div className="result-box success">
      <span>Your short link is ready</span>
      <a href={result.shortUrl} target="_blank" rel="noreferrer">{result.shortUrl}</a>
      <button className={`btn secondary copy-btn ${copied ? 'copied' : ''}`} type="button" onClick={() => copy(result.shortUrl)}>{copied ? 'Copied ✓' : 'Copy link'}</button>
    </div>}
    {result && !result.ok && <div className="result-box error"><b>Could not create link</b><span>{result.error}</span></div>}
  </form>
}
