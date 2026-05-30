import { beforeEach, describe, expect, it } from 'vitest'
import { createUser, findByEmail, findById, setUserCafe } from '../../src/lib/repos/users'
import { createCafe, findBySlug, findByOwner, slugify, uniqueSlug } from '../../src/lib/repos/cafes'
import { addFeedback, listByCafe } from '../../src/lib/repos/feedback'

beforeEach(() => localStorage.clear())

const baseUser = { email: 'a@b.com', passwordHash: 'h', salt: 's', cafeId: '' }

describe('users repo', () => {
  it('creates and finds by email (case-insensitive) and id', () => {
    const u = createUser({ ...baseUser, email: 'A@B.com' })
    expect(findByEmail('a@b.com')?.id).toBe(u.id)
    expect(findById(u.id)?.email).toBe('a@b.com')
  })
  it('sets the user cafe', () => {
    const u = createUser(baseUser)
    expect(setUserCafe(u.id, 'cafe-1').cafeId).toBe('cafe-1')
    expect(findById(u.id)?.cafeId).toBe('cafe-1')
  })
})

describe('cafes repo', () => {
  it('slugifies names', () => {
    expect(slugify('The Corner Cup!')).toBe('the-corner-cup')
    expect(slugify('   ')).toBe('cafe')
  })
  it('generates unique slugs on collision', () => {
    createCafe({ ownerId: 'o1', name: 'Brew' })
    expect(uniqueSlug('Brew')).toBe('brew-2')
  })
  it('creates and finds by slug and owner', () => {
    const c = createCafe({ ownerId: 'o1', name: 'Brew' })
    expect(findBySlug('brew')?.id).toBe(c.id)
    expect(findByOwner('o1')?.id).toBe(c.id)
  })
})

describe('feedback repo', () => {
  it('adds and lists by cafe, newest first', () => {
    addFeedback({ cafeId: 'c1', rating: 5, category: 'Staff', comment: 'old', at: 100 })
    addFeedback({ cafeId: 'c1', rating: 4, category: 'Product', comment: 'new', at: 200 })
    addFeedback({ cafeId: 'c2', rating: 1, category: 'Service', comment: 'other', at: 150 })
    const list = listByCafe('c1')
    expect(list.map((f) => f.comment)).toEqual(['new', 'old'])
  })
})
