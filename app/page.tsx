export default function Home() {
  return <main className="shell">
    <nav className="nav"><div className="brand"><span className="logo">g</span>gURL</div><div className="links"><a href="/about">About</a><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="/report">Report</a><a href="/admin">Admin</a></div></nav>
    <section className="hero">
      <div><p className="notice">Migration prototype: production domain is not switched.</p><h1>Short links with moderation and stats.</h1><p className="lead">A modern Vercel-ready replacement for the current YOURLS install: captcha, blacklists, admin cleanup, click counters and preserved old slugs.</p></div>
      <form className="card shorten" action="/api/shorten" method="post">
        <input name="url" placeholder="Paste a long URL" />
        <div className="row"><input name="slug" placeholder="Custom alias, optional" /><button className="btn">Shorten</button></div>
        <small>Captcha/Turnstile will be enabled when production keys are configured.</small>
      </form>
    </section>
    <section className="statgrid"><div className="stat"><b>137,974</b>existing short links</div><div className="stat"><b>4.6M</b>legacy click log rows</div><div className="stat"><b>836 MB</b>current MariaDB database</div></section>
  </main>
}
