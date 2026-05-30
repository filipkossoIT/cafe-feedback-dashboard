import { readObject, writeObject } from './storage'
import type { Session } from '../types'

export function getSession(): Session {
  return readObject<{ userId: string }>('session')
}
export function setSession(userId: string): void {
  writeObject('session', { userId })
}
export function clearSession(): void {
  writeObject('session', null)
}
