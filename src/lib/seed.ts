import { createCafe, findBySlug } from './repos/cafes'
import { addFeedback } from './repos/feedback'
import { createUser, setUserCafe } from './repos/users'
import { setSession } from './session'
import type { Rating } from '../types'

export const DEMO_SLUG = 'the-corner-cup'
const DEMO_EMAIL = 'demo@thecornercup.cafe'

// rating, category, text, hoursAgo  (ported verbatim from the prototype SEED)
const SEED: { r: Rating; c: string; t: string; h: number }[] = [
  { r: 5, c: 'Staff', t: 'Mia at the counter remembered my usual from last week — totally made my morning. So warm and friendly!', h: 2 },
  { r: 5, c: 'Product', t: 'Best flat white in the neighborhood, hands down. The almond croissants are always fresh too.', h: 5 },
  { r: 4, c: 'Atmosphere', t: 'Love the cozy window seats and the playlist. Gets a little loud at peak times though.', h: 9 },
  { r: 2, c: 'Service', t: 'Waited almost 15 minutes for a single latte during the morning rush. Could really use more hands on deck.', h: 22 },
  { r: 3, c: 'Product', t: 'Coffee is solid but a bit pricey for what you get — $6 for a small oat latte adds up fast.', h: 28 },
  { r: 5, c: 'Staff', t: 'The whole team is so welcoming. They know the regulars by name and it shows.', h: 33 },
  { r: 4, c: 'Product', t: 'The banana bread is incredible. Wish there were a few more gluten-free options though.', h: 40 },
  { r: 1, c: 'Service', t: 'My order was wrong twice and nobody apologized. Pretty disappointing visit honestly.', h: 46 },
  { r: 5, c: 'Atmosphere', t: 'Perfect spot to work remotely — fast wifi, plenty of outlets, and lovely natural light.', h: 54 },
  { r: 3, c: 'Other', t: 'Nice place, but card-only payment caught me off guard. Maybe post a sign by the door?', h: 61 },
  { r: 4, c: 'Service', t: 'Quick and friendly most days. A mobile pickup option would be such a great addition.', h: 70 },
  { r: 2, c: 'Product', t: 'The muffin was a touch stale and the prices keep creeping up. Used to be my go-to spot.', h: 78 },
  { r: 5, c: 'Product', t: 'The seasonal lavender latte is a dream. Staff recommended it and they were so right!', h: 90 },
  { r: 4, c: 'Atmosphere', t: 'Charming little cafe. Only wish it were a touch bigger — hard to grab a table on weekends.', h: 102 },
  { r: 3, c: 'Service', t: 'Friendly staff but the weekend wait times are getting pretty long. Worth it for the coffee though.', h: 120 },
]

export function seedDemoCafe(): void {
  try {
    if (findBySlug(DEMO_SLUG)) return // idempotent
    // Demo owner has an unusable password; login is via enterDemo(), not the form.
    const owner = createUser({ email: DEMO_EMAIL, passwordHash: '!', salt: '!', cafeId: '' })
    const cafe = createCafe({ ownerId: owner.id, name: 'The Corner Cup' })
    setUserCafe(owner.id, cafe.id)
    const now = Date.now()
    for (const s of SEED) {
      addFeedback({ cafeId: cafe.id, rating: s.r, category: s.c, comment: s.t, at: now - s.h * 3_600_000 })
    }
  } catch {
    // storage unavailable — skip seeding; the UI surfaces the storage error itself
  }
}

export function enterDemo(): boolean {
  const cafe = findBySlug(DEMO_SLUG)
  if (!cafe) return false
  setSession(cafe.ownerId)
  return true
}
