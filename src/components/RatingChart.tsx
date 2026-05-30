import type { Feedback } from '../types'

const RATING_VAR: Record<number, string> = { 5: 'var(--r5)', 4: 'var(--r4)', 3: 'var(--r3)', 2: 'var(--r2)', 1: 'var(--r1)' }

export function RatingChart({ responses }: { responses: Feedback[] }) {
  const counts = [5, 4, 3, 2, 1].map((n) => ({ n, c: responses.filter((r) => r.rating === n).length }))
  const max = Math.max(1, ...counts.map((x) => x.c))
  return (
    <div className="card panel">
      <div className="panel-title">
        <span className="ico"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg></span>
        Ratings distribution
      </div>
      <div className="bars">
        {counts.map(({ n, c }) => (
          <div className="bar-row" key={n}>
            <span className="bar-label">{n}<svg viewBox="0 0 24 24"><path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 18.56l-5.9 3.11 1.13-6.57L2.45 9.44l6.6-.96L12 2.5z" /></svg></span>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${(c / max) * 100}%`, background: RATING_VAR[n] }} /></div>
            <span className="bar-count">{c}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
