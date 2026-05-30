import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../components/AuthProvider'
import { Topbar } from '../components/Topbar'

export default function Landing() {
  const { enterDemo } = useAuth()
  const navigate = useNavigate()
  const tryDemo = () => {
    if (enterDemo()) navigate('/dashboard')
    else navigate('/signup')
  }
  return (
    <div className="app">
      <Topbar subtitle="Customer feedback, made simple" />
      <main>
        <div className="form-wrap fade-in">
          <div className="form-hero">
            <div className="emoji">☕️</div>
            <h1>Know what your customers really think</h1>
            <p>Collect star ratings and comments with a simple shareable link, and watch the themes on a live dashboard.</p>
          </div>
          <div className="card form-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="btn-primary" onClick={() => navigate('/signup')}>Create your cafe</button>
            <button className="btn-ai" style={{ justifyContent: 'center', margin: 0 }} onClick={tryDemo}>Try the demo</button>
            <div style={{ textAlign: 'center', fontWeight: 600, color: 'var(--ink-soft)', fontSize: 14 }}>
              Already have an account? <Link className="link-btn" to="/login" style={{ display: 'inline' }}>Log in</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
