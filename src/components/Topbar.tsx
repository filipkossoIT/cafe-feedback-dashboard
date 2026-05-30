import type { ReactNode } from 'react'

export function Topbar({ subtitle, right }: { subtitle?: string; right?: ReactNode }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <div className="logo">☕</div>
          <div>
            <div className="brand-name">Cafe Customer Feedback</div>
            {subtitle && <div className="brand-sub">{subtitle}</div>}
          </div>
        </div>
        {right}
      </div>
    </header>
  )
}
