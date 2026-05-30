import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../components/AuthProvider'
import { Topbar } from '../components/Topbar'
import { EmailTakenError } from '../lib/auth'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cafeName, setCafeName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signup(email, password, cafeName)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof EmailTakenError ? err.message : 'Could not sign up. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div className="app">
      <Topbar subtitle="Create your cafe" />
      <main>
        <div className="form-wrap fade-in">
          <div className="form-hero">
            <div className="emoji">☕️</div>
            <h1>Create your cafe</h1>
            <p>Set up your feedback page in seconds.</p>
          </div>
          <form className="card form-card" onSubmit={submit}>
            <div className="field">
              <label className="field-label" htmlFor="email">Email</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="password">Password</label>
              <input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="cafeName">Cafe name</label>
              <input id="cafeName" type="text" required value={cafeName} onChange={(e) => setCafeName(e.target.value)} />
            </div>
            {error && <div className="ai-error" style={{ marginBottom: 16 }}>{error}</div>}
            <button className="btn-primary" type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create cafe'}</button>
            <div style={{ textAlign: 'center', marginTop: 14, fontWeight: 600, color: 'var(--ink-soft)', fontSize: 13 }}>
              Demo only — accounts live in your browser and aren't secure.
            </div>
            <div style={{ textAlign: 'center', marginTop: 6, fontWeight: 600, fontSize: 14 }}>
              <Link className="link-btn" to="/login" style={{ display: 'inline' }}>Already have an account? Log in</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
