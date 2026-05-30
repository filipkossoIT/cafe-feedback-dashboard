import { Link } from 'react-router-dom'

export default function NotFound({
  title = 'Page not found',
  message = "That page doesn't exist.",
}: { title?: string; message?: string }) {
  return (
    <div className="app">
      <main>
        <div className="form-wrap fade-in">
          <div className="card form-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 44, lineHeight: 1 }}>🤔</div>
            <h1 style={{ marginTop: 12 }}>{title}</h1>
            <p style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>{message}</p>
            <Link className="link-btn" to="/">← Back to home</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
