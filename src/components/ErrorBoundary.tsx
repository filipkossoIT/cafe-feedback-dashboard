import { Component, type ReactNode } from 'react'
import { StorageUnavailableError } from '../lib/storage'

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    const { error } = this.state
    if (!error) return this.props.children
    const isStorage = error instanceof StorageUnavailableError
    return (
      <div className="app">
        <main>
          <div className="form-wrap">
            <div className="card form-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 44, lineHeight: 1 }}>{isStorage ? '🔒' : '⚠️'}</div>
              <h1 style={{ marginTop: 12 }}>
                {isStorage ? 'Your browser is blocking storage' : 'Something went wrong'}
              </h1>
              <p style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>
                {isStorage
                  ? 'This demo keeps everything in your browser. Turn off private/incognito mode (or free up space) and reload.'
                  : 'Please reload the page to try again.'}
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }
}
