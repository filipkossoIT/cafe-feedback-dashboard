import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { StarRating } from '../components/StarRating'
import { Topbar } from '../components/Topbar'
import NotFound from './NotFound'
import { findBySlug } from '../lib/repos/cafes'
import { addFeedback } from '../lib/repos/feedback'
import { CATEGORIES } from '../lib/categories'
import type { Rating } from '../types'

export default function FeedbackForm() {
  const { slug = '' } = useParams()
  const cafe = findBySlug(slug)
  const [rating, setRating] = useState(0)
  const [category, setCategory] = useState('')
  const [comment, setComment] = useState('')
  const [done, setDone] = useState(false)

  if (!cafe) {
    return <NotFound title="Cafe not found" message="Double-check the link from the cafe." />
  }

  const submit = () => {
    if (!rating) return
    addFeedback({
      cafeId: cafe.id,
      rating: rating as Rating,
      category: category || 'Other',
      comment: comment.trim(),
      at: Date.now(),
    })
    setDone(true)
  }
  const reset = () => {
    setRating(0)
    setCategory('')
    setComment('')
    setDone(false)
  }

  return (
    <div className="app">
      <Topbar subtitle="Share your experience" />
      <main>
        {done ? (
          <div className="form-wrap fade-in">
            <div className="card thanks">
              <div className="check">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h2>Thanks so much! 🎉</h2>
              <p>Your feedback just landed with the team at {cafe.name}. It genuinely helps make every visit better.</p>
              <button className="link-btn" onClick={reset}>Leave another response →</button>
            </div>
          </div>
        ) : (
          <div className="form-wrap fade-in">
            <div className="form-hero">
              <div className="emoji">☕️</div>
              <h1>How was your visit?</h1>
              <p>at {cafe.name} — it only takes a few seconds, and they read every one.</p>
            </div>
            <div className="card form-card">
              <div className="field">
                <label className="field-label">Your rating</label>
                <StarRating value={rating} onChange={setRating} />
              </div>
              <div className="field">
                <label className="field-label">What's it about?</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="" disabled>Choose a category…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">Tell us more <span className="opt">optional</span></label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What did you love? What could we do better?" maxLength={600} />
              </div>
              <button className="btn-primary" disabled={!rating} onClick={submit}>
                {rating ? 'Send feedback' : 'Pick a rating to continue'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
