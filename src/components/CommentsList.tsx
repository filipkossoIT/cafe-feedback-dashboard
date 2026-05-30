import type { Feedback } from '../types'
import { MiniStar } from './icons'
import { catColor } from '../lib/categories'
import { timeAgo } from '../lib/time'

export function CommentsList({ responses }: { responses: Feedback[] }) {
  const sorted = [...responses].sort((a, b) => b.at - a.at)
  return (
    <div className="card panel">
      <div className="panel-title">
        <span className="ico"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg></span>
        Recent comments
      </div>
      <div className="comments">
        {sorted.map((r) => (
          <div className="cmt" key={r.id} data-testid="comment">
            <div className="cmt-top">
              <span className="cmt-stars">{[1, 2, 3, 4, 5].map((n) => <span key={n} style={{ width: 15, height: 15, display: 'inline-block' }}><MiniStar color={n <= r.rating ? 'var(--gold)' : '#EBE2D8'} /></span>)}</span>
              <span className="badge" style={{ background: `color-mix(in srgb, ${catColor(r.category)} 15%, white)`, color: catColor(r.category) }}>{r.category}</span>
              <span className="cmt-time">{timeAgo(r.at)}</span>
            </div>
            <div className={`cmt-text ${r.comment ? '' : 'empty'}`}>{r.comment || 'No comment left — rating only.'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
