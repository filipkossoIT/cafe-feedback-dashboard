import { beforeEach, describe, expect, it } from 'vitest'
import { signup, login, logout, currentUser, currentCafe, EmailTakenError, InvalidCredentialsError } from '../../src/lib/auth'

beforeEach(() => localStorage.clear())

describe('auth', () => {
  it('signs up: creates user + cafe, links them, sets session', async () => {
    const { user, cafe } = await signup('owner@cafe.com', 'pw123456', 'My Cafe')
    expect(user.cafeId).toBe(cafe.id)
    expect(cafe.ownerId).toBe(user.id)
    expect(cafe.slug).toBe('my-cafe')
    expect(currentUser()?.id).toBe(user.id)
    expect(currentCafe()?.id).toBe(cafe.id)
  })
  it('rejects a duplicate email', async () => {
    await signup('owner@cafe.com', 'pw123456', 'My Cafe')
    await expect(signup('owner@cafe.com', 'pw', 'Other')).rejects.toBeInstanceOf(EmailTakenError)
  })
  it('logs in with correct credentials', async () => {
    await signup('owner@cafe.com', 'pw123456', 'My Cafe')
    logout()
    expect(currentUser()).toBeNull()
    const u = await login('owner@cafe.com', 'pw123456')
    expect(currentUser()?.id).toBe(u.id)
  })
  it('rejects wrong password and unknown email', async () => {
    await signup('owner@cafe.com', 'pw123456', 'My Cafe')
    await expect(login('owner@cafe.com', 'wrong')).rejects.toBeInstanceOf(InvalidCredentialsError)
    await expect(login('nobody@cafe.com', 'pw')).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})
