import AdminDashboard from '../components/AdminDashboard'

export default function Admin() {
  return <main className="shell">
    <nav className="nav"><a className="brand" href="/"><span className="logo">g</span>gURL</a><div className="links"><a href="/">Home</a><a href="/report">Public report form</a></div></nav>
    <section className="admin-header">
      <div><p className="eyebrow">Protected admin area</p><h1>Link moderation</h1><p className="lead">Search links, block policy violations and review abuse reports.</p></div>
    </section>
    <AdminDashboard />
  </main>
}
