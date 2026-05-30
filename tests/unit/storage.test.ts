import { beforeEach, describe, expect, it } from 'vitest'
import { readCollection, writeCollection, readObject, writeObject } from '../../src/lib/storage'

beforeEach(() => localStorage.clear())

describe('storage', () => {
  it('returns [] for a missing collection', () => {
    expect(readCollection('users')).toEqual([])
  })
  it('round-trips a collection', () => {
    writeCollection('users', [{ id: '1' }])
    expect(readCollection('users')).toEqual([{ id: '1' }])
  })
  it('treats corrupt collection JSON as empty', () => {
    localStorage.setItem('cafefeedback:v1:users', '{not json')
    expect(readCollection('users')).toEqual([])
  })
  it('treats a non-array collection value as empty', () => {
    localStorage.setItem('cafefeedback:v1:users', '{"a":1}')
    expect(readCollection('users')).toEqual([])
  })
  it('round-trips an object and removes on null', () => {
    writeObject('session', { userId: 'x' })
    expect(readObject('session')).toEqual({ userId: 'x' })
    writeObject('session', null)
    expect(readObject('session')).toBeNull()
  })
})
