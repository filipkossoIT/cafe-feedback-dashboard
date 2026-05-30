import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword, randomSalt } from '../../src/lib/crypto'

describe('password hashing', () => {
  it('verifies a correct password', async () => {
    const salt = randomSalt()
    const hash = await hashPassword('hunter2', salt)
    expect(await verifyPassword('hunter2', salt, hash)).toBe(true)
  })
  it('rejects a wrong password', async () => {
    const salt = randomSalt()
    const hash = await hashPassword('hunter2', salt)
    expect(await verifyPassword('nope', salt, hash)).toBe(false)
  })
  it('produces different hashes for different salts', async () => {
    const a = await hashPassword('x', randomSalt())
    const b = await hashPassword('x', randomSalt())
    expect(a).not.toBe(b)
  })
})
