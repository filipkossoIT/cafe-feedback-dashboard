import { readCollection, writeCollection } from '../storage'
import type { User } from '../../types'

const NAME = 'users'
const all = (): User[] => readCollection<User>(NAME)

export function findByEmail(email: string): User | undefined {
  const e = email.trim().toLowerCase()
  return all().find((u) => u.email === e)
}

export function findById(id: string): User | undefined {
  return all().find((u) => u.id === id)
}

export function createUser(input: Omit<User, 'id' | 'createdAt'>): User {
  const user: User = {
    ...input,
    email: input.email.trim().toLowerCase(),
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  }
  writeCollection(NAME, [...all(), user])
  return user
}

export function setUserCafe(userId: string, cafeId: string): User {
  const users = all()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx === -1) throw new Error('user not found')
  users[idx] = { ...users[idx], cafeId }
  writeCollection(NAME, users)
  return users[idx]
}
