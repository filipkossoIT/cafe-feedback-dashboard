# Cafe Feedback SaaS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Claude design-tool prototype into a proper, buildable, front-end-only multi-cafe feedback SaaS demo.

**Architecture:** A Vite + React + TypeScript single-page app. All state lives in `localStorage` behind a small, unit-tested data layer (`storage` → repositories → `auth`/`seed`), with React Router providing real routes for a public per-cafe feedback form and a protected owner dashboard. No backend, database, or secrets. Mock (demo-grade) auth.

**Tech Stack:** Vite, React 18, TypeScript, React Router v6, Vitest (unit), Playwright (E2E), GitHub Actions (CI). Package manager: npm.

**Spec:** `docs/superpowers/specs/2026-05-30-cafe-feedback-saas-design.md`

**Source prototype (port FROM, then delete):** `index.html`, `main.jsx`, `tweaks-panel.jsx` at repo root. The executor can read these directly for verbatim CSS / SVG paths rather than re-typing them.

---

## Conventions for the whole plan

- **TDD applies to the data layer** (`src/lib/**`): write the failing Vitest test, see it fail, implement, see it pass, commit. Pure logic — fast and worth testing thoroughly.
- **The UI layer** (`src/components`, `src/routes`) is covered by **Playwright E2E** at the end (Task 16), not unit tests — this is the deliberate split from the spec (§13). UI tasks build the component, then are verified manually via `npm run dev` and finally by E2E.
- **Commit after every task** (and after each green test cycle in data-layer tasks). Commit messages: `feat:` / `test:` / `chore:` / `docs:`.
- **Current branch:** `feat/cafe-feedback-saas` (already created; the spec is already committed here). Do **not** push to `origin` unless the user asks.
- Run unit tests with `npm run test:unit`, a single file with `npm run test:unit -- tests/unit/<file>`.

## File structure (target)

```
cafe-dashboard/
  index.html                       # Vite entry (replaces prototype)
  package.json  tsconfig.json  vite.config.ts  playwright.config.ts
  .gitignore                       # extend existing
  .github/workflows/ci.yml
  README.md
  src/
    main.tsx                       # entry: seed + mount router
    App.tsx                        # routes
    types.ts                       # User, Cafe, Feedback, Session, Rating
    styles/global.css              # prototype CSS, verbatim
    lib/
      storage.ts                   # localStorage wrapper (guarded, corrupt-tolerant)
      categories.ts                # CATEGORIES, CAT_COLOR, catColor(), RATING_WORDS
      time.ts                      # timeAgo()
      crypto.ts                    # PBKDF2 hash/verify, randomSalt
      session.ts                   # get/set/clear session
      auth.ts                      # signup, login, logout, currentUser, currentCafe
      seed.ts                      # seedDemoCafe(), enterDemo()
      repos/
        users.ts                   # createUser, findByEmail, findById, setUserCafe
        cafes.ts                   # createCafe, findBySlug, findByOwner, slugify, uniqueSlug
        feedback.ts                # addFeedback, listByCafe
    components/
      icons.tsx                    # Star, MiniStar + shared SVGs
      AuthProvider.tsx             # auth context + useAuth()
      RequireAuth.tsx              # route guard
      StarRating.tsx
      StatCards.tsx  RatingChart.tsx  CommentsList.tsx
      Topbar.tsx                   # brand header (shared)
    routes/
      Landing.tsx  Signup.tsx  Login.tsx
      FeedbackForm.tsx  Dashboard.tsx  Settings.tsx  NotFound.tsx
  tests/
    unit/                          # Vitest *.test.ts
    e2e/                           # Playwright *.spec.ts
```

---

## Task 1: Scaffold build tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles/global.css`
- Modify: `.gitignore`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "cafe-feedback-saas",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint": "tsc --noEmit",
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2"
  },
  "devDependencies": {
    "@playwright/test": "^1.47.2",
    "@types/node": "^22.5.0",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^25.0.0",
    "typescript": "^5.5.4",
    "vite": "^5.4.3",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals", "node"]
  },
  "include": ["src", "tests"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts", "playwright.config.ts"]
}
```

- [ ] **Step 4: Create `vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts'],
  },
})
```

- [ ] **Step 5: Replace `index.html`** with the Vite entry (keep the Google Fonts `<link>` tags from the prototype's `index.html` head; drop the inline `<style>` and the CDN/Babel `<script>` tags):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cafe Customer Feedback</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,400&family=Quicksand:wght@400;500;600;700&family=Fredoka:wght@400;500;600;700&display=swap" rel="stylesheet" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

- [ ] **Step 6: Create `src/styles/global.css`** — copy the entire contents of the `<style>...</style>` block from the prototype `index.html` (lines 11–227) verbatim into this file. No changes.

- [ ] **Step 7: Create a minimal `src/App.tsx`** (placeholder, expanded in Task 11):

```tsx
export default function App() {
  return <div className="app"><main><h1>Cafe Feedback</h1></main></div>
}
```

- [ ] **Step 8: Create `src/main.tsx`** (seed call added in Task 9; router added in Task 11):

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 9: Extend `.gitignore`** — append these lines (the existing file already covers `node_modules/`, `dist/`, editor, OS, logs):

```
# Test artifacts
playwright-report/
test-results/
blob-report/
playwright/.cache/
coverage/

# Env
.env
.env.local
.env.*.local
```

- [ ] **Step 10: Install and verify the build**

Run: `npm install`
Then: `npm run build`
Expected: install succeeds; build emits `dist/` with no TypeScript errors.

- [ ] **Step 11: Verify dev server**

Run: `npm run dev`
Expected: server starts (default `http://localhost:5173`), page shows "Cafe Feedback" with the cafe background color. Stop the server.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TypeScript build"
```

---

## Task 2: Vitest smoke test + types

**Files:**
- Create: `src/types.ts`, `tests/unit/smoke.test.ts`

- [ ] **Step 1: Create `src/types.ts`**

```ts
export type Rating = 1 | 2 | 3 | 4 | 5

export interface User {
  id: string
  email: string
  passwordHash: string
  salt: string
  cafeId: string
  createdAt: number
}

export interface Cafe {
  id: string
  ownerId: string
  name: string
  slug: string
  createdAt: number
}

export interface Feedback {
  id: string
  cafeId: string
  rating: Rating
  category: string
  comment: string
  at: number
}

export type Session = { userId: string } | null
```

- [ ] **Step 2: Write a smoke test** at `tests/unit/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest'

describe('test runner', () => {
  it('runs and has localStorage (jsdom) + web crypto', () => {
    expect(typeof localStorage).toBe('object')
    expect(typeof crypto.randomUUID).toBe('function')
    expect(typeof crypto.subtle).toBe('object')
  })
})
```

- [ ] **Step 3: Run it**

Run: `npm run test:unit`
Expected: 1 passing test. If `crypto.subtle` is undefined, the Node version is too old — require Node ≥ 20.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test: add vitest smoke test and core types"
```

---

## Task 3: storage wrapper (TDD)

**Files:**
- Create: `src/lib/storage.ts`
- Test: `tests/unit/storage.test.ts`

- [ ] **Step 1: Write failing tests** `tests/unit/storage.test.ts`:

```ts
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
```

- [ ] **Step 2: Run to verify failure** — `npm run test:unit -- tests/unit/storage.test.ts` → FAIL (module not found).

- [ ] **Step 3: Implement `src/lib/storage.ts`**

```ts
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
```

- [ ] **Step 4: Run to verify pass** — `npm run test:unit -- tests/unit/storage.test.ts` → PASS.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: add guarded localStorage wrapper"`

---

## Task 4: categories + time helpers (TDD)

**Files:**
- Create: `src/lib/categories.ts`, `src/lib/time.ts`
- Test: `tests/unit/categories.test.ts`, `tests/unit/time.test.ts`

- [ ] **Step 1: Write failing tests** `tests/unit/time.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { timeAgo } from '../../src/lib/time'

const NOW = 1_000_000_000_000

describe('timeAgo', () => {
  it('just now', () => expect(timeAgo(NOW - 10_000, NOW)).toBe('just now'))
  it('minutes', () => expect(timeAgo(NOW - 5 * 60_000, NOW)).toBe('5m ago'))
  it('hours', () => expect(timeAgo(NOW - 3 * 3_600_000, NOW)).toBe('3h ago'))
  it('days', () => expect(timeAgo(NOW - 2 * 86_400_000, NOW)).toBe('2d ago'))
})
```

And `tests/unit/categories.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { CATEGORIES, catColor } from '../../src/lib/categories'

describe('categories', () => {
  it('has the five known categories', () => {
    expect(CATEGORIES).toEqual(['Service', 'Product', 'Staff', 'Atmosphere', 'Other'])
  })
  it('returns a color for a known category', () => {
    expect(catColor('Staff')).toBe('#2BB3A3')
  })
  it('falls back to neutral for an unknown category', () => {
    expect(catColor('Nonsense')).toBe('#8A8079')
  })
})
```

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Implement `src/lib/time.ts`**

```ts
export function timeAgo(ts: number, now: number = Date.now()): string {
  const m = Math.round((now - ts) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  return `${d}d ago`
}
```

- [ ] **Step 4: Implement `src/lib/categories.ts`**

```ts
export const CATEGORIES = ['Service', 'Product', 'Staff', 'Atmosphere', 'Other'] as const
export type Category = (typeof CATEGORIES)[number]

const NEUTRAL = '#8A8079'

export const CAT_COLOR: Record<string, string> = {
  Service: '#FF8A3D',
  Product: '#FB6B4B',
  Staff: '#2BB3A3',
  Atmosphere: '#7A5AE0',
  Other: '#8A8079',
}

export const catColor = (c: string): string => CAT_COLOR[c] ?? NEUTRAL

export const RATING_WORDS = ['', 'Not great', 'Could be better', 'It was okay', 'Really good!', 'Loved it!']
```

- [ ] **Step 5: Run to verify pass.**

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: add categories and timeAgo helpers"`

---

## Task 5: password hashing (TDD)

**Files:**
- Create: `src/lib/crypto.ts`
- Test: `tests/unit/crypto.test.ts`

- [ ] **Step 1: Write failing tests** `tests/unit/crypto.test.ts`:

```ts
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
```

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Implement `src/lib/crypto.ts`**

```ts
function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function randomSalt(): string {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return toHex(arr.buffer)
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100_000, hash: 'SHA-256' },
    key,
    256,
  )
  return toHex(bits)
}

export async function verifyPassword(password: string, salt: string, expectedHash: string): Promise<boolean> {
  return (await hashPassword(password, salt)) === expectedHash
}
```

- [ ] **Step 4: Run to verify pass.**

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: add PBKDF2 password hashing"`

---

## Task 6: users + cafes + feedback repos (TDD)

**Files:**
- Create: `src/lib/repos/users.ts`, `src/lib/repos/cafes.ts`, `src/lib/repos/feedback.ts`
- Test: `tests/unit/repos.test.ts`

- [ ] **Step 1: Write failing tests** `tests/unit/repos.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { createUser, findByEmail, findById, setUserCafe } from '../../src/lib/repos/users'
import { createCafe, findBySlug, findByOwner, slugify, uniqueSlug } from '../../src/lib/repos/cafes'
import { addFeedback, listByCafe } from '../../src/lib/repos/feedback'

beforeEach(() => localStorage.clear())

const baseUser = { email: 'a@b.com', passwordHash: 'h', salt: 's', cafeId: '' }

describe('users repo', () => {
  it('creates and finds by email (case-insensitive) and id', () => {
    const u = createUser({ ...baseUser, email: 'A@B.com' })
    expect(findByEmail('a@b.com')?.id).toBe(u.id)
    expect(findById(u.id)?.email).toBe('a@b.com')
  })
  it('sets the user cafe', () => {
    const u = createUser(baseUser)
    expect(setUserCafe(u.id, 'cafe-1').cafeId).toBe('cafe-1')
    expect(findById(u.id)?.cafeId).toBe('cafe-1')
  })
})

describe('cafes repo', () => {
  it('slugifies names', () => {
    expect(slugify('The Corner Cup!')).toBe('the-corner-cup')
    expect(slugify('   ')).toBe('cafe')
  })
  it('generates unique slugs on collision', () => {
    createCafe({ ownerId: 'o1', name: 'Brew' })
    expect(uniqueSlug('Brew')).toBe('brew-2')
  })
  it('creates and finds by slug and owner', () => {
    const c = createCafe({ ownerId: 'o1', name: 'Brew' })
    expect(findBySlug('brew')?.id).toBe(c.id)
    expect(findByOwner('o1')?.id).toBe(c.id)
  })
})

describe('feedback repo', () => {
  it('adds and lists by cafe, newest first', () => {
    addFeedback({ cafeId: 'c1', rating: 5, category: 'Staff', comment: 'old', at: 100 })
    addFeedback({ cafeId: 'c1', rating: 4, category: 'Product', comment: 'new', at: 200 })
    addFeedback({ cafeId: 'c2', rating: 1, category: 'Service', comment: 'other', at: 150 })
    const list = listByCafe('c1')
    expect(list.map((f) => f.comment)).toEqual(['new', 'old'])
  })
})
```

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Implement `src/lib/repos/users.ts`**

```ts
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
```

- [ ] **Step 4: Implement `src/lib/repos/cafes.ts`**

```ts
import { readCollection, writeCollection } from '../storage'
import type { Cafe } from '../../types'

const NAME = 'cafes'
const all = (): Cafe[] => readCollection<Cafe>(NAME)

export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'cafe'
  )
}

export function uniqueSlug(name: string): string {
  const base = slugify(name)
  const taken = new Set(all().map((c) => c.slug))
  if (!taken.has(base)) return base
  let i = 2
  while (taken.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}

export function findBySlug(slug: string): Cafe | undefined {
  return all().find((c) => c.slug === slug)
}

export function findByOwner(ownerId: string): Cafe | undefined {
  return all().find((c) => c.ownerId === ownerId)
}

export function createCafe(input: { ownerId: string; name: string }): Cafe {
  const cafe: Cafe = {
    id: crypto.randomUUID(),
    ownerId: input.ownerId,
    name: input.name.trim(),
    slug: uniqueSlug(input.name),
    createdAt: Date.now(),
  }
  writeCollection(NAME, [...all(), cafe])
  return cafe
}
```

- [ ] **Step 5: Implement `src/lib/repos/feedback.ts`**

```ts
import { readCollection, writeCollection } from '../storage'
import type { Feedback } from '../../types'

const NAME = 'feedback'
const all = (): Feedback[] => readCollection<Feedback>(NAME)

export function listByCafe(cafeId: string): Feedback[] {
  return all()
    .filter((f) => f.cafeId === cafeId)
    .sort((a, b) => b.at - a.at)
}

export function addFeedback(input: Omit<Feedback, 'id'>): Feedback {
  const fb: Feedback = { ...input, id: crypto.randomUUID() }
  writeCollection(NAME, [...all(), fb])
  return fb
}
```

- [ ] **Step 6: Run to verify pass.**

- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: add users, cafes, and feedback repositories"`

---

## Task 7: session + auth service (TDD)

**Files:**
- Create: `src/lib/session.ts`, `src/lib/auth.ts`
- Test: `tests/unit/auth.test.ts`

- [ ] **Step 1: Write failing tests** `tests/unit/auth.test.ts`:

```ts
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
```

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Implement `src/lib/session.ts`**

```ts
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
```

- [ ] **Step 4: Implement `src/lib/auth.ts`**

```ts
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
```

- [ ] **Step 5: Run to verify pass.**

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: add session and mock auth service"`

---

## Task 8: demo seed (TDD)

**Files:**
- Create: `src/lib/seed.ts`
- Test: `tests/unit/seed.test.ts`

- [ ] **Step 1: Write failing tests** `tests/unit/seed.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { seedDemoCafe, enterDemo, DEMO_SLUG } from '../../src/lib/seed'
import { findBySlug } from '../../src/lib/repos/cafes'
import { listByCafe } from '../../src/lib/repos/feedback'
import { currentUser } from '../../src/lib/auth'

beforeEach(() => localStorage.clear())

describe('seed', () => {
  it('creates the demo cafe with 15 feedback rows', () => {
    seedDemoCafe()
    const cafe = findBySlug(DEMO_SLUG)
    expect(cafe).toBeTruthy()
    expect(listByCafe(cafe!.id)).toHaveLength(15)
  })
  it('is idempotent', () => {
    seedDemoCafe()
    seedDemoCafe()
    const cafe = findBySlug(DEMO_SLUG)!
    expect(listByCafe(cafe.id)).toHaveLength(15)
  })
  it('enterDemo logs in as the demo owner', () => {
    seedDemoCafe()
    expect(enterDemo()).toBe(true)
    expect(currentUser()).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Implement `src/lib/seed.ts`** — copy the 15 rows from the prototype `main.jsx` SEED array (lines 24–38): each `{ r, c, t, at: hoursAgo(h) }` becomes `{ r, c, t, h }` here (store the hours offset, recompute `at` from "now" at seed time).

```ts
import { createCafe, findBySlug } from './repos/cafes'
import { addFeedback } from './repos/feedback'
import { createUser, setUserCafe } from './repos/users'
import { setSession } from './session'
import type { Rating } from '../types'

export const DEMO_SLUG = 'the-corner-cup'
const DEMO_EMAIL = 'demo@thecornercup.cafe'

// rating, category, text, hoursAgo  (ported verbatim from main.jsx SEED)
const SEED: { r: Rating; c: string; t: string; h: number }[] = [
  { r: 5, c: 'Staff', t: 'Mia at the counter remembered my usual from last week — totally made my morning. So warm and friendly!', h: 2 },
  { r: 5, c: 'Product', t: 'Best flat white in the neighborhood, hands down. The almond croissants are always fresh too.', h: 5 },
  { r: 4, c: 'Atmosphere', t: 'Love the cozy window seats and the playlist. Gets a little loud at peak times though.', h: 9 },
  { r: 2, c: 'Service', t: 'Waited almost 15 minutes for a single latte during the morning rush. Could really use more hands on deck.', h: 22 },
  { r: 3, c: 'Product', t: 'Coffee is solid but a bit pricey for what you get — $6 for a small oat latte adds up fast.', h: 28 },
  { r: 5, c: 'Staff', t: 'The whole team is so welcoming. They know the regulars by name and it shows.', h: 33 },
  { r: 4, c: 'Product', t: 'The banana bread is incredible. Wish there were a few more gluten-free options though.', h: 40 },
  { r: 1, c: 'Service', t: 'My order was wrong twice and nobody apologized. Pretty disappointing visit honestly.', h: 46 },
  { r: 5, c: 'Atmosphere', t: 'Perfect spot to work remotely — fast wifi, plenty of outlets, and lovely natural light.', h: 54 },
  { r: 3, c: 'Other', t: 'Nice place, but card-only payment caught me off guard. Maybe post a sign by the door?', h: 61 },
  { r: 4, c: 'Service', t: 'Quick and friendly most days. A mobile pickup option would be such a great addition.', h: 70 },
  { r: 2, c: 'Product', t: 'The muffin was a touch stale and the prices keep creeping up. Used to be my go-to spot.', h: 78 },
  { r: 5, c: 'Product', t: 'The seasonal lavender latte is a dream. Staff recommended it and they were so right!', h: 90 },
  { r: 4, c: 'Atmosphere', t: 'Charming little cafe. Only wish it were a touch bigger — hard to grab a table on weekends.', h: 102 },
  { r: 3, c: 'Service', t: 'Friendly staff but the weekend wait times are getting pretty long. Worth it for the coffee though.', h: 120 },
]

export function seedDemoCafe(): void {
  try {
    if (findBySlug(DEMO_SLUG)) return // idempotent
    // Demo owner has an unusable password; login is via enterDemo(), not the form.
    const owner = createUser({ email: DEMO_EMAIL, passwordHash: '!', salt: '!', cafeId: '' })
    const cafe = createCafe({ ownerId: owner.id, name: 'The Corner Cup' })
    setUserCafe(owner.id, cafe.id)
    const now = Date.now()
    for (const s of SEED) {
      addFeedback({ cafeId: cafe.id, rating: s.r, category: s.c, comment: s.t, at: now - s.h * 3_600_000 })
    }
  } catch {
    // storage unavailable — skip seeding; the UI surfaces the storage error itself
  }
}

export function enterDemo(): boolean {
  const cafe = findBySlug(DEMO_SLUG)
  if (!cafe) return false
  setSession(cafe.ownerId)
  return true
}
```

- [ ] **Step 4: Run to verify pass.**

- [ ] **Step 5: Wire seeding into `src/main.tsx`** — add `import { seedDemoCafe } from './lib/seed'` and call `seedDemoCafe()` before `ReactDOM.createRoot(...)`.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: seed The Corner Cup demo cafe"`

---

## Task 9: icons + StarRating + auth context + route guard + error boundary

**Files:**
- Create: `src/components/icons.tsx`, `src/components/StarRating.tsx`, `src/components/AuthProvider.tsx`, `src/components/RequireAuth.tsx`, `src/components/Topbar.tsx`, `src/components/ErrorBoundary.tsx`

> No unit tests here (UI — covered by E2E in Task 16). Verify by `npm run build` (type-check) at the end.

- [ ] **Step 1: Create `src/components/icons.tsx`** — port the `Star` and `MiniStar` components from `main.jsx` (lines 4–13) to TSX with typed props. Also export small inline-SVG helpers used by the dashboard panels (chart icon, comment icon, sparkle/AI is dropped). Copy the SVG `<path>` data verbatim from `main.jsx`.

```tsx
export const Star = ({ filled, cls = '' }: { filled: boolean; cls?: string }) => (
  <svg viewBox="0 0 24 24" className={cls}>
    <path className={filled ? 'star-fill' : 'star-empty'} d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 18.56l-5.9 3.11 1.13-6.57L2.45 9.44l6.6-.96L12 2.5z" />
  </svg>
)

export const MiniStar = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" style={{ width: '100%', height: '100%' }}>
    <path fill={color} d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 18.56l-5.9 3.11 1.13-6.57L2.45 9.44l6.6-.96L12 2.5z" />
  </svg>
)
```

- [ ] **Step 2: Create `src/components/StarRating.tsx`** — port `StarRating` from `main.jsx` (lines 52–68) to TSX, importing `Star` from `./icons` and `RATING_WORDS` from `../lib/categories`. Props: `{ value: number; onChange: (n: number) => void }`.

- [ ] **Step 3: Create `src/components/AuthProvider.tsx`**

```tsx
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
```

- [ ] **Step 4: Create `src/components/RequireAuth.tsx`**

```tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import type { ReactNode } from 'react'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  return user ? <>{children}</> : <Navigate to="/login" replace />
}
```

- [ ] **Step 5: Create `src/components/Topbar.tsx`** — a shared header adapted from the prototype `.topbar` markup (`main.jsx` lines 319–339), minus the form/dashboard tabs. Props: `{ subtitle?: string; right?: ReactNode }`. Renders the `☕` logo, "Cafe Customer Feedback" brand, and an optional right slot (used for nav links / logout).

- [ ] **Step 6: Create `src/components/ErrorBoundary.tsx`** — satisfies spec §12 (friendly storage-unavailable page instead of a blank crash). `storage.ts` throws `StorageUnavailableError`, which can surface during render from `AuthProvider`'s lazy `useState(() => auth.currentUser())` initializer and from `findBySlug` / `listByCafe` in the routes. A class error boundary above `<App>` catches it.

```tsx
import { Component, type ReactNode } from 'react'
import { StorageUnavailableError } from '../lib/storage'

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    const { error } = this.state
    if (!error) return this.props.children
    const isStorage = error instanceof StorageUnavailableError
    return (
      <div className="app">
        <main>
          <div className="form-wrap">
            <div className="card form-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 44, lineHeight: 1 }}>{isStorage ? '🔒' : '⚠️'}</div>
              <h1 style={{ marginTop: 12 }}>
                {isStorage ? 'Your browser is blocking storage' : 'Something went wrong'}
              </h1>
              <p style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>
                {isStorage
                  ? 'This demo keeps everything in your browser. Turn off private/incognito mode (or free up space) and reload.'
                  : 'Please reload the page to try again.'}
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }
}
```

- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: add icons, StarRating, auth context, route guard, topbar, error boundary"`

---

## Task 10: public feedback form route

**Files:**
- Create: `src/routes/FeedbackForm.tsx`, `src/routes/NotFound.tsx`

- [ ] **Step 1: Create `src/routes/NotFound.tsx`** — a friendly full-page message inside `.app`/`main`, with a heading and a link back to `/`. Accept an optional `title`/`message` prop so it can render both generic 404 and "Cafe not found".

- [ ] **Step 2: Create `src/routes/FeedbackForm.tsx`** — port `FormView` (`main.jsx` lines 71–128) to TSX with this wiring:
  - Read `slug` via `useParams()`; look up the cafe with `findBySlug(slug)`. If not found, render `<NotFound title="Cafe not found" message="Double-check the link from the cafe." />`.
  - Render the cafe name in the hero (`How was your visit?` stays; add a line "at {cafe.name}").
  - On submit, call `addFeedback({ cafeId: cafe.id, rating, category: category || 'Other', comment: comment.trim(), at: Date.now() })`, then show the existing thank-you state. "Leave another response" resets the form.
  - Keep the existing validation (`disabled={!rating}`) and `StarRating`, category `<select>` (from `CATEGORIES`), and textarea (`maxLength={600}`).

- [ ] **Step 3: Wire the route** — added in Task 13's router, but verify locally now once the router exists. For this task, verify it type-checks: `npm run build`. Expected: PASS.

- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat: add public per-cafe feedback form route"`

---

## Task 11: dashboard route + panels

**Files:**
- Create: `src/components/StatCards.tsx`, `src/components/RatingChart.tsx`, `src/components/CommentsList.tsx`, `src/routes/Dashboard.tsx`

- [ ] **Step 1: Port `StatCards`** from `main.jsx` (lines 133–157) to `src/components/StatCards.tsx`. Props `{ responses: Feedback[] }`. Unchanged logic.

- [ ] **Step 2: Port `RatingChart`** from `main.jsx` (lines 159–179). Props `{ responses: Feedback[] }`. Copy the bar-chart markup and the `RATING_VAR` map verbatim.

- [ ] **Step 3: Port `CommentsList`** from `main.jsx` (lines 245–267). Use `catColor()` from `../lib/categories` for the badge color (replaces the raw `CAT_COLOR[r.category]` lookup so unknown categories don't break). Use `timeAgo()` from `../lib/time`.

- [ ] **Step 4: Create `src/routes/Dashboard.tsx`**:
  - `const { cafe } = useAuth()`; if `!cafe` render nothing (the guard already redirects, but guard against the edge).
  - `const responses = listByCafe(cafe.id)`.
  - Render `<Topbar subtitle="Internal view" right={<nav>…Settings / Logout…</nav>} />`, the `.dash-head`, then `<StatCards>`, `<RatingChart>`, `<CommentsList>` — **omitting `AISection` entirely**.
  - Show the cafe name in the dash-head subtitle and the shareable form link `/f/{cafe.slug}`.

- [ ] **Step 5: Verify type-check** — `npm run build` → PASS.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: add dashboard route with stats, chart, comments"`

---

## Task 12: landing, signup, login, settings routes

**Files:**
- Create: `src/routes/Landing.tsx`, `src/routes/Signup.tsx`, `src/routes/Login.tsx`, `src/routes/Settings.tsx`

- [ ] **Step 1: `Landing.tsx`** — a simple hero (reuse `.form-hero` styles) with the brand, a short tagline, and three actions: "Create your cafe" → `/signup`, "Log in" → `/login`, and "Try the demo" → calls `useAuth().enterDemo()` then `navigate('/dashboard')`. If `enterDemo()` returns false, fall back to navigating to `/signup`.

- [ ] **Step 2: `Signup.tsx`** — a centered `.form-card` with email, password, and cafe-name inputs and a submit button (reuse `.field`, `.btn-primary`). On submit call `useAuth().signup(...)`; on `EmailTakenError` show an inline `.ai-error`-style message; on success `navigate('/dashboard')`. Include the demo-security disclaimer line in small print: "Demo only — accounts live in your browser and aren't secure."

- [ ] **Step 3: `Login.tsx`** — email + password; on submit `useAuth().login(...)`; on `InvalidCredentialsError` show inline error; on success `navigate('/dashboard')`. Link to `/signup`.

- [ ] **Step 4: `Settings.tsx`** — show cafe name (read-only), the copyable public form URL (`{window.location.origin}/f/{cafe.slug}`) with a "Copy link" button, and a "Log out" button that calls `useAuth().logout()` then `navigate('/')`.

- [ ] **Step 5: Verify type-check** — `npm run build` → PASS.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: add landing, signup, login, settings routes"`

---

## Task 13: wire the router

**Files:**
- Modify: `src/App.tsx`, `src/main.tsx`

- [ ] **Step 1: Replace `src/App.tsx`** with the full router:

```tsx
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './components/AuthProvider'
import { RequireAuth } from './components/RequireAuth'
import Landing from './routes/Landing'
import Signup from './routes/Signup'
import Login from './routes/Login'
import FeedbackForm from './routes/FeedbackForm'
import Dashboard from './routes/Dashboard'
import Settings from './routes/Settings'
import NotFound from './routes/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/f/:slug" element={<FeedbackForm />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}
```

- [ ] **Step 2: Wrap with `ErrorBoundary` + `BrowserRouter` in `src/main.tsx`** — import `{ BrowserRouter } from 'react-router-dom'` and `{ ErrorBoundary } from './components/ErrorBoundary'`, then render `<ErrorBoundary><BrowserRouter><App /></BrowserRouter></ErrorBoundary>`. The boundary must be **outside** `BrowserRouter` so it catches a storage throw from `AuthProvider`'s initializer. (Each route `export default`s its component — adjust the named-vs-default imports above to match how you defined them.)

- [ ] **Step 3: Manual smoke test** — `npm run dev`, then click through: `/` → Try the demo → dashboard shows 15 comments; `/f/the-corner-cup` submit a review → thank-you; refresh `/dashboard` → new review present; sign up a new cafe; log out; visit `/dashboard` → redirected to `/login`. Fix anything broken.

- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat: wire up React Router and providers"`

---

## Task 14: delete the prototype files

**Files:**
- Delete: `main.jsx`, `tweaks-panel.jsx`

- [ ] **Step 1: Confirm nothing imports them** — grep the `src/` tree for `tweaks`, `useTweaks`, `window.claude`, `EDITMODE`. Expected: no matches.
- [ ] **Step 2: Delete** `main.jsx` and `tweaks-panel.jsx` (the prototype `index.html` was already overwritten in Task 1).
- [ ] **Step 3: Verify** — `npm run build` → PASS.
- [ ] **Step 4: Commit** — `git add -A && git commit -m "chore: remove Claude design prototype files"`

---

## Task 15: Playwright setup

**Files:**
- Create: `playwright.config.ts`

- [ ] **Step 1: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['html'], ['list']] : 'list',
  use: { baseURL: 'http://localhost:4173', trace: 'on-first-retry' },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
```

- [ ] **Step 2: Install browsers** — `npx playwright install --with-deps chromium`. Expected: chromium downloaded.

- [ ] **Step 3: Commit** — `git add -A && git commit -m "chore: add Playwright config"`

---

## Task 16: E2E tests (the UI test suite)

**Files:**
- Create: `tests/e2e/feedback.spec.ts`

> Add `data-testid` attributes to the components as needed so selectors are stable (e.g. `data-testid="stat-total"` on the total-responses stat, `data-testid="comment"` on each comment card). Keep them minimal.

- [ ] **Step 1: Write the E2E spec** covering spec §13's six scenarios:

```ts
import { test, expect } from '@playwright/test'

const uniqueEmail = (i: number) => `owner${i}-${Date.now()}@example.com`

test('signup → submit feedback → dashboard reflects it → logout guard', async ({ page }) => {
  const email = uniqueEmail(1)

  // Sign up a new cafe
  await page.goto('/signup')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill('pw123456')
  await page.getByLabel(/cafe name/i).fill('Test Beans')
  await page.getByRole('button', { name: /create/i }).click()
  await expect(page).toHaveURL(/\/dashboard/)

  // New cafe starts with no comments
  await expect(page.getByText(/feedback dashboard/i)).toBeVisible()

  // Submit feedback on the public form
  await page.goto('/f/test-beans')
  await page.getByRole('button', { name: /4 stars/i }).click()
  await page.getByRole('combobox').selectOption('Product')
  await page.getByRole('textbox').fill('Lovely oat latte from a Playwright test.')
  await page.getByRole('button', { name: /send feedback/i }).click()
  await expect(page.getByText(/thanks so much/i)).toBeVisible()

  // Dashboard reflects it
  await page.goto('/dashboard')
  await expect(page.getByText('Lovely oat latte from a Playwright test.')).toBeVisible()

  // Logout → protected route redirects
  // (open Settings → Log out, or clear via UI logout control)
  await page.goto('/settings')
  await page.getByRole('button', { name: /log ?out/i }).click()
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)

  // Scenario 5: log back in → the earlier feedback is still there (localStorage persisted)
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill('pw123456')
  await page.getByRole('button', { name: /log ?in/i }).click()
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByText('Lovely oat latte from a Playwright test.')).toBeVisible()
})

test('unknown cafe slug shows not-found', async ({ page }) => {
  await page.goto('/f/does-not-exist')
  await expect(page.getByText(/cafe not found/i)).toBeVisible()
})

test('try the demo shows the seeded cafe dashboard', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /try the demo/i }).click()
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByText(/best flat white/i)).toBeVisible()
})
```

- [ ] **Step 2: Run the E2E suite** — `npm run test:e2e`. Expected: all green. Adjust selectors / add `aria-label`s / `data-testid`s in the components until stable. (The star buttons already have `aria-label="{n} stars"` from the prototype — keep that.)

- [ ] **Step 3: Commit** — `git add -A && git commit -m "test: add Playwright E2E suite for core flows"`

---

## Task 17: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI
on:
  push:
    branches: ['**']
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - name: Unit tests
        run: npm run test:unit
      - name: Build
        run: npm run build
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      - name: E2E tests
        run: npm run test:e2e
      - name: Upload Playwright report
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

- [ ] **Step 2: Validate locally** — run the same sequence the CI runs: `npm ci && npm run test:unit && npm run build && npm run test:e2e`. Expected: all green. (`package-lock.json` must be committed for `npm ci` — it was created by Task 1's `npm install`.)

- [ ] **Step 3: Commit** — `git add -A && git commit -m "ci: add GitHub Actions pipeline (unit + build + e2e)"`

---

## Task 18: README + final verification

**Files:**
- Create/Modify: `README.md`

- [ ] **Step 1: Write `README.md`** covering: what the app is (a front-end-only multi-cafe feedback SaaS **demo**); the **explicit limitations** (single-device, mock/demo-grade auth — not for real data); `npm install` / `npm run dev` / `npm run build` / `npm run test:unit` / `npm run test:e2e`; the routes (`/`, `/signup`, `/login`, `/f/:slug`, `/dashboard`, `/settings`); and deployment notes (static host + **SPA fallback** rewrite to `/index.html`, e.g. Netlify `_redirects` `/* /index.html 200` or Vercel/Cloudflare equivalent).

- [ ] **Step 2: Full verification** (use superpowers:verification-before-completion):

Run, in order, and confirm each passes:
```bash
npm run test:unit
npm run build
npm run test:e2e
```
Expected: unit suite green; build emits `dist/`; E2E green. Paste the summary lines as evidence.

- [ ] **Step 3: Commit** — `git add -A && git commit -m "docs: add README with run, test, and deploy instructions"`

---

## Done criteria

- `npm run test:unit`, `npm run build`, and `npm run test:e2e` all pass locally and in CI.
- The prototype files (`main.jsx`, `tweaks-panel.jsx`) are gone; no `window.claude` / tweaks references remain.
- A fresh visitor can: try the demo, sign up a cafe, share `/f/:slug`, collect feedback, and view a protected dashboard — all on one device.
- No backend, database, secrets, or environment variables anywhere.
