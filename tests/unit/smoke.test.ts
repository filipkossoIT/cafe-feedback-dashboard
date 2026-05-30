import { describe, it, expect } from 'vitest'

describe('test runner', () => {
  it('runs and has localStorage (jsdom) + web crypto', () => {
    expect(typeof localStorage).toBe('object')
    expect(typeof crypto.randomUUID).toBe('function')
    expect(typeof crypto.subtle).toBe('object')
  })
})
