import type { Feedback } from '../types'
import { MiniStar } from './icons'

export function StatCards({ responses }: { responses: Feedback[] }) {
  const total = responses.length
  const avg = total ? responses.reduce((s, r) => s + r.rating, 0) / total : 0
  const positive = total ? Math.round((responses.filter((r) => r.rating >= 4).length / total) * 100) : 0
  return (
    <div className="stat-grid">
      <div className="card stat">
        <div className="k">Total responses</div>
        <div className="v" data-testid="stat-total">{total}</div>
      </div>
      <div className="card stat">
        <div className="k">Average rating</div>
        <div className="v">{avg.toFixed(1)}
          <span className="ministars">
            {[1, 2, 3, 4, 5].map((n) => <MiniStar key={n} color={n <= Math.round(avg) ? 'var(--gold)' : '#EBE2D8'} />)}
          </span>
        </div>
      </div>
      <div className="card stat">
        <div className="k">Positive (4★+)</div>
        <div className="v">{positive}<small>%</small></div>
      </div>
    </div>
  )
}
