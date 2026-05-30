import { readObject, writeObject } from './storage'

export function getSession(): { userId: string } | null {
  return readObject<{ userId: string }>('session')
}
export function setSession(userId: string): void {
  writeObject('session', { userId })
}
export function clearSession(): void {
  writeObject('session', null)
}
