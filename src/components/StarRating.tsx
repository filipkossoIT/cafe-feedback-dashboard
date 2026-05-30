import { useState } from 'react'
import { Star } from './icons'
import { RATING_WORDS } from '../lib/categories'

export function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  return (
    <div>
      <div className="stars" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            className="star-btn"
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(n)}
          >
            <Star filled={n <= shown} cls="" />
          </button>
        ))}
      </div>
      <div className="rating-caption" style={{ opacity: shown ? 1 : 0 }}>{RATING_WORDS[shown] || ''}</div>
    </div>
  )
}
