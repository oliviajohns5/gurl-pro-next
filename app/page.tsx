import ShortenForm from './components/ShortenForm'

export default function Home() {
  return <main className="shell">
    <nav className="nav">
      <div className="brand"><span className="logo">g</span><span>gURL</span></div>
      <div className="links"><a href="/about">About</a><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="/report">Report abuse</a><a href="/admin">Admin</a></div>
      <details className="mobile-menu">
        <summary>Menu</summary>
        <div className="mobile-links">
          <a href="/about">About</a>
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
          <a href="/report">Report abuse</a>
          <a href="/admin">Admin</a>
        </div>
      </details>
    </nav>

    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Fast, simple, privacy-aware URL shortener</p>
        <h1>Shorten long links in seconds.</h1>
        <p className="lead">Create clean, memorable short links for messages, campaigns and social posts — with spam protection and abuse reporting built in.</p>
        <div className="hero-actions">
          <a className="btn linkbtn" href="#shorten">Create a short link</a>
          <a className="btn secondary linkbtn" href="/report">Report a bad link</a>
        </div>
        <ul className="trust-list">
          <li>Custom aliases when you need a readable link</li>
          <li>Protected by Cloudflare Turnstile</li>
          <li>Moderated to remove spam, phishing and policy violations</li>
        </ul>
      </div>

      <ShortenForm siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || process.env.TURNSTILE_SITE_KEY || ''} />
    </section>

    <section className="featuregrid" aria-label="gURL features">
      <div className="feature"><b>Clean short links</b><p>Turn messy URLs into compact links that are easy to share anywhere.</p></div>
      <div className="feature"><b>Built-in safety</b><p>Captcha, blocked domains and abuse reports help protect visitors.</p></div>
      <div className="feature"><b>Useful counters</b><p>Simple click totals help understand whether a link is still active.</p></div>
    </section>
  </main>
}
