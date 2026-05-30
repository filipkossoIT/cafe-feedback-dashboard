import { describe, expect, it } from 'vitest'
import { timeAgo } from '../../src/lib/time'

const NOW = 1_000_000_000_000

describe('timeAgo', () => {
  it('just now', () => expect(timeAgo(NOW - 10_000, NOW)).toBe('just now'))
  it('minutes', () => expect(timeAgo(NOW - 5 * 60_000, NOW)).toBe('5m ago'))
  it('hours', () => expect(timeAgo(NOW - 3 * 3_600_000, NOW)).toBe('3h ago'))
  it('days', () => expect(timeAgo(NOW - 2 * 86_400_000, NOW)).toBe('2d ago'))
})
