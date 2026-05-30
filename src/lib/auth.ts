import { createUser, findByEmail, findById, setUserCafe } from './repos/users'
import { createCafe, findByOwner } from './repos/cafes'
import { hashPassword, randomSalt, verifyPassword } from './crypto'
import { clearSession, getSession, setSession } from './session'
import type { Cafe, User } from '../types'

export class EmailTakenError extends Error {
  constructor() {
    super('That email is already registered.')
    this.name = 'EmailTakenError'
  }
}
export class InvalidCredentialsError extends Error {
  constructor() {
    super('Wrong email or password.')
    this.name = 'InvalidCredentialsError'
  }
}

export async function signup(email: string, password: string, cafeName: string): Promise<{ user: User; cafe: Cafe }> {
  const e = email.trim().toLowerCase()
  if (findByEmail(e)) throw new EmailTakenError()
  const salt = randomSalt()
  const passwordHash = await hashPassword(password, salt)
  const created = createUser({ email: e, passwordHash, salt, cafeId: '' })
  const cafe = createCafe({ ownerId: created.id, name: cafeName })
  const user = setUserCafe(created.id, cafe.id)
  setSession(user.id)
  return { user, cafe }
}

export async function login(email: string, password: string): Promise<User> {
  const user = findByEmail(email)
  if (!user) throw new InvalidCredentialsError()
  if (!(await verifyPassword(password, user.salt, user.passwordHash))) throw new InvalidCredentialsError()
  setSession(user.id)
  return user
}

export function logout(): void {
  clearSession()
}

export function currentUser(): User | null {
  const s = getSession()
  return s ? findById(s.userId) ?? null : null
}

export function currentCafe(): Cafe | null {
  const u = currentUser()
  return u ? findByOwner(u.id) ?? null : null
}
