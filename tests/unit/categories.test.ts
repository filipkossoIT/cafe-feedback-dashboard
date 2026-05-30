import { describe, expect, it } from 'vitest'
import { CATEGORIES, catColor } from '../../src/lib/categories'

describe('categories', () => {
  it('has the five known categories', () => {
    expect(CATEGORIES).toEqual(['Service', 'Product', 'Staff', 'Atmosphere', 'Other'])
  })
  it('returns a color for a known category', () => {
    expect(catColor('Staff')).toBe('#2BB3A3')
  })
  it('falls back to neutral for an unknown category', () => {
    expect(catColor('Nonsense')).toBe('#8A8079')
  })
})
