import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../components/AuthProvider'
import { Topbar } from '../components/Topbar'
import { InvalidCredentialsError } from '../lib/auth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof InvalidCredentialsError ? err.message : 'Could not log in. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div className="app">
      <Topbar subtitle="Log in" />
      <main>
        <div className="form-wrap fade-in">
          <div className="form-hero">
            <div className="emoji">☕️</div>
            <h1>Welcome back</h1>
            <p>Log in to your cafe dashboard.</p>
          </div>
          <form className="card form-card" onSubmit={submit}>
            <div className="field">
              <label className="field-label" htmlFor="email">Email</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="password">Password</label>
              <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <div className="ai-error" style={{ marginBottom: 16 }}>{error}</div>}
            <button className="btn-primary" type="submit" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
            <div style={{ textAlign: 'center', marginTop: 14, fontWeight: 600, fontSize: 14 }}>
              <Link className="link-btn" to="/signup" style={{ display: 'inline' }}>New here? Create your cafe</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
