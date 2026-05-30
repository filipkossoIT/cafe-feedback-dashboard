import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import * as auth from '../lib/auth'
import { enterDemo as enterDemoSeed } from '../lib/seed'
import type { Cafe, User } from '../types'

interface AuthValue {
  user: User | null
  cafe: Cafe | null
  signup: (email: string, password: string, cafeName: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  enterDemo: () => boolean
}

const Ctx = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => auth.currentUser())
  const [cafe, setCafe] = useState<Cafe | null>(() => auth.currentCafe())
  const refresh = useCallback(() => {
    setUser(auth.currentUser())
    setCafe(auth.currentCafe())
  }, [])
  const signup = useCallback(async (e: string, p: string, n: string) => { await auth.signup(e, p, n); refresh() }, [refresh])
  const login = useCallback(async (e: string, p: string) => { await auth.login(e, p); refresh() }, [refresh])
  const logout = useCallback(() => { auth.logout(); refresh() }, [refresh])
  const enterDemo = useCallback(() => { const ok = enterDemoSeed(); if (ok) refresh(); return ok }, [refresh])
  return <Ctx.Provider value={{ user, cafe, signup, login, logout, enterDemo }}>{children}</Ctx.Provider>
}

export function useAuth(): AuthValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth must be used within AuthProvider')
  return v
}
