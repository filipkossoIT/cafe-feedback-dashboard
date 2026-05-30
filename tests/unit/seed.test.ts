import { beforeEach, describe, expect, it } from 'vitest'
import { seedDemoCafe, enterDemo, DEMO_SLUG } from '../../src/lib/seed'
import { findBySlug } from '../../src/lib/repos/cafes'
import { listByCafe } from '../../src/lib/repos/feedback'
import { currentUser } from '../../src/lib/auth'

beforeEach(() => localStorage.clear())

describe('seed', () => {
  it('creates the demo cafe with 15 feedback rows', () => {
    seedDemoCafe()
    const cafe = findBySlug(DEMO_SLUG)
    expect(cafe).toBeTruthy()
    expect(listByCafe(cafe!.id)).toHaveLength(15)
  })
  it('is idempotent', () => {
    seedDemoCafe()
    seedDemoCafe()
    const cafe = findBySlug(DEMO_SLUG)!
    expect(listByCafe(cafe.id)).toHaveLength(15)
  })
  it('enterDemo logs in as the demo owner', () => {
    seedDemoCafe()
    expect(enterDemo()).toBe(true)
    expect(currentUser()).toBeTruthy()
  })
})
