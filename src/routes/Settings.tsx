import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthProvider'
import { Topbar } from '../components/Topbar'

export default function Settings() {
  const { cafe, logout } = useAuth()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  if (!cafe) return null
  const formUrl = `${window.location.origin}/f/${cafe.slug}`
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(formUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable — ignore */
    }
  }
  const doLogout = () => {
    logout()
    navigate('/')
  }
  return (
    <div className="app">
      <Topbar subtitle="Settings" right={<div className="tabs"><Link className="tab" to="/dashboard">Dashboard</Link></div>} />
      <main>
        <div className="form-wrap fade-in">
          <div className="card form-card">
            <div className="field">
              <label className="field-label">Cafe name</label>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{cafe.name}</div>
            </div>
            <div className="field">
              <label className="field-label">Your feedback link</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" readOnly value={formUrl} style={{ flex: 1 }} />
                <button type="button" className="btn-ai" style={{ margin: 0 }} onClick={copy}>{copied ? 'Copied!' : 'Copy link'}</button>
              </div>
            </div>
            <button className="btn-primary" onClick={doLogout}>Log out</button>
          </div>
        </div>
      </main>
    </div>
  )
}
