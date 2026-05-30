const PREFIX = 'cafefeedback:v1:'

export class StorageUnavailableError extends Error {
  constructor() {
    super('Browser storage is unavailable (private mode or quota exceeded).')
    this.name = 'StorageUnavailableError'
  }
}

function ls(): Storage {
  try {
    const probe = '__cafefeedback_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return window.localStorage
  } catch {
    throw new StorageUnavailableError()
  }
}

export function readCollection<T>(name: string): T[] {
  const raw = ls().getItem(PREFIX + name)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

export function writeCollection<T>(name: string, items: T[]): void {
  ls().setItem(PREFIX + name, JSON.stringify(items))
}

export function readObject<T>(name: string): T | null {
  const raw = ls().getItem(PREFIX + name)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeObject<T>(name: string, value: T | null): void {
  if (value === null) ls().removeItem(PREFIX + name)
  else ls().setItem(PREFIX + name, JSON.stringify(value))
}
