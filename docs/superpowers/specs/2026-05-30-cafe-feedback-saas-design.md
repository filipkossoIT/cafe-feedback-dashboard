# Cafe Feedback SaaS — Design Spec

- **Date:** 2026-05-30
- **Status:** Approved for planning
- **Author:** Filip (with Claude)

## 1. Context

We were handed a **Claude design-tool prototype** (an "artifact"), not a buildable
application:

- `index.html` loads React 18, ReactDOM, and Babel from a CDN and compiles JSX *in the
  browser at runtime*. Fine for a mockup; not how a real app ships.
- `main.jsx` is a single-screen app with a **feedback form** and an **internal dashboard**
  (stats, ratings distribution, AI summary, recent comments), switched via in-page tabs.
  All data is a hardcoded `SEED` array held in memory — nothing persists.
- The dashboard's AI summary calls `window.claude.complete(...)`, an API that only exists
  inside the Claude design host.
- `tweaks-panel.jsx` + the `EDITMODE` block are **design-tool chrome** — a live theme
  editor that talks to a host window via `postMessage`. Not application code.

This spec turns that prototype into a **proper, buildable, multi-cafe feedback SaaS** —
deliberately scoped as a **front-end-only demo**.

## 2. Goals

- A real build (framework + tooling) replacing CDN + in-browser Babel.
- A **multi-cafe SaaS** shape: owners sign up, each gets their own feedback form and a
  private dashboard scoped to their cafe.
- Reuse the existing visual design and components essentially unchanged.
- Automated tests (Playwright UI/E2E + Vitest unit) and a CI pipeline that runs them.
- Deployable to any static host with zero servers, databases, or secrets.

## 3. Non-goals (explicit)

- **No backend, no server, no database.** All state lives in the browser's `localStorage`.
- **No real security.** Auth is mock/demo-grade (see §8). Not for production data.
- **No AI summary.** The `window.claude.complete` feature is removed.
- **No theming UI** in v1. The tweaks panel is removed (see §18 for the future path).
- **No cross-device data.** A consequence of localStorage; see §17.

## 4. Key decisions (resolved during brainstorming)

| Decision | Choice |
|---|---|
| Intent | Demo / prototype (optimize for "looks and behaves real") |
| Scope | Multi-cafe SaaS (per-cafe form + dashboard) |
| AI summary | Dropped |
| Auth | Full sign-up + login, **mock** (client-side, demo-grade) |
| Persistence | `localStorage` only (no backend DB) |
| Language | TypeScript |
| Theming | Dropped for v1 |
| Demo seed | Seed one demo cafe ("The Corner Cup") with the 15 sample comments |
| UI tests | Playwright |
| Unit tests | Vitest |
| CI | GitHub Actions |
| Hosting | Static deploy (Netlify / Vercel / Cloudflare Pages) |

## 5. Tech stack

- **Vite + React 18 + TypeScript** — fast, zero-config SPA build.
- **React Router** — real routes for landing, auth, public form, and dashboard.
- **Existing CSS, unchanged** — moved into one global stylesheet. No Tailwind, no rewrite.
- **Vitest** — unit tests (jsdom environment for `localStorage`).
- **Playwright** — end-to-end / UI tests.
- **GitHub Actions** — CI.
- **npm** — package manager.

Rejected: Next.js (its server/API value is wasted with no backend); Create-React-App
(deprecated).

## 6. Data model

All records live in `localStorage` under a single namespace prefix `cafefeedback:v1:`.

```ts
type User     = { id: string; email: string; passwordHash: string; salt: string; cafeId: string; createdAt: number };
type Cafe     = { id: string; ownerId: string; name: string; slug: string; createdAt: number };
type Feedback = { id: string; cafeId: string; rating: 1|2|3|4|5; category: string; comment: string; at: number };
type Session  = { userId: string } | null;
```

Storage keys: `cafefeedback:v1:users`, `:cafes`, `:feedback`, `:session`. Collections are
JSON arrays; session is a single object. IDs are generated with `crypto.randomUUID()` —
including **seeded** feedback rows (the prototype's numeric `id`s like `1000 - i` are *not*
ported verbatim; seed inserts go through the normal `feedback.add` path and get UUIDs).

**Categories.** The fixed category list and their badge colors (the prototype's
`CATEGORIES` array and `CAT_COLOR` map) move into a shared `src/lib/categories.ts`.
`category` is stored as a `string` but the form constrains it to that list, and
`CommentsList` falls back to a neutral color for any unrecognized value so a stray category
can never break the `CAT_COLOR[...]` lookup.

## 7. Data layer (the swappable core)

Small modules with narrow, well-defined interfaces so the storage mechanism is isolated
and the whole layer is unit-testable. Each repository depends only on the `storage`
wrapper, never on React.

- **`lib/storage.ts`** — typed get/set/remove over `localStorage` + an availability guard
  (throws a typed error if storage is blocked, e.g. private mode / quota). Also tolerant of
  **corrupt data**: an unparseable collection value is treated as empty rather than crashing
  the app (the demo is something people will poke at and hand-edit).
- **`lib/repos/users.ts`** — `create`, `findByEmail`, `findById`.
- **`lib/repos/cafes.ts`** — `create`, `findBySlug`, `findByOwner`; owns **slug generation**
  (lowercase, non-alphanumeric → `-`, collapse/trim, append `-2`/`-3`… on collision).
- **`lib/repos/feedback.ts`** — `add`, `listByCafe` (sorted newest-first).
- **`lib/auth.ts`** — `signup`, `login`, `logout`, `currentUser`; orchestrates users repo +
  session + password hashing.
- **`lib/session.ts`** — `get`, `set`, `clear` current user id.
- **`lib/seed.ts`** — idempotently seeds the demo cafe on first run.

**Design rule:** because every repo goes through `storage.ts` and exposes plain functions,
swapping localStorage for a real API later (e.g. Supabase) is a change to this layer only —
components and routes are untouched.

## 8. Auth (mock / demo-grade)

- Passwords are hashed client-side with **Web Crypto PBKDF2** (SHA-256, per-user random
  salt) — so no plaintext is stored. The hash + salt are persisted on the `User` record.
- `signup(email, password, cafeName)`: reject if email already exists; create user; create
  the cafe (with a unique slug); set the session; return the new user + cafe.
- `login(email, password)`: look up by email; re-derive the hash with the stored salt;
  compare; set session on match, else a typed `InvalidCredentials` error.
- `logout()`: clear the session.
- Protected routes read `currentUser()`; if absent, redirect to `/login`.

**Security disclaimer (must surface in the README and a small note in the UI):** this is a
front-end demo. All "accounts" and hashing live in the visitor's browser; there is no
server validating anything. It is **not** secure and must not hold real personal data.

## 9. Routing & pages

The prototype's single screen + tab toggle is split into real routes.

**Public:**
- `/` — landing: short hero, "Create your cafe" / "Log in", and a "Try the demo" button
  that opens the seeded cafe's dashboard.
- `/signup` — email + password + cafe name → creates cafe, logs in, → `/dashboard`.
- `/login` — email + password → `/dashboard`.
- `/f/:slug` — **public feedback form** for one cafe (the shareable / QR link). Looks up the
  cafe by slug; unknown slug → a friendly "Cafe not found" page.

**Protected (owner; redirect to `/login` if no session):**
- `/dashboard` — the existing stats + ratings chart + recent comments, scoped to the
  owner's cafe. (AI summary section removed.)
- `/settings` — cafe name (read-only in v1 — the `cafes` repo intentionally exposes no
  `update`), the shareable form link (copyable), logout.

## 10. Component inventory

**Keep & port (from `main.jsx`):** `StarRating`, the feedback form view, `StatCards`,
`RatingChart`, `CommentsList`, all SVG icons, and the full CSS.

**Remove:**
- `tweaks-panel.jsx` entirely, the `EDITMODE` block, `useTweaks`, and the host
  `postMessage` protocol.
- The CDN `<script>` tags for React / ReactDOM / Babel.
- `AISection` and the `window.claude.complete` call.

## 11. Seed / demo data

On first load (`lib/seed.ts`, idempotent), create a demo cafe **"The Corner Cup"**
(slug `the-corner-cup`) and insert the prototype's 15 sample feedback rows against it, with
their relative timestamps recomputed from "now". The landing's "Try the demo" button links
to that cafe's dashboard so a fresh visitor immediately sees a populated dashboard and a
working public form at `/f/the-corner-cup`.

## 12. Error handling & edge cases

- Sign-up with an existing email → inline error.
- Login with wrong credentials → inline error.
- Form validation: rating required (already enforced); category defaults to "Other";
  comment optional, capped at 600 chars (already enforced).
- `localStorage` unavailable (private mode / quota) → a clear, friendly full-page message
  rather than a crash.
- Unknown cafe slug at `/f/:slug` → "Cafe not found" page.
- Visiting a protected route while logged out → redirect to `/login`.

## 13. Testing strategy

**Vitest (unit, fast):** the data layer — slug generation + collision handling, password
hash/verify round-trip, each repo's CRUD, `auth.signup`/`login` happy + error paths, seed
idempotency.

**Playwright (E2E / UI):**
1. Sign up → land on dashboard → empty-ish state renders.
2. Open `/f/:slug` for the new cafe → submit a rating + comment → see the thank-you state.
3. Back on `/dashboard` → the new feedback appears in stats, chart, and the comment list.
4. Logout → visiting `/dashboard` redirects to `/login`.
5. Log back in → dashboard data still present (localStorage persisted).
6. Unknown slug `/f/does-not-exist` → "Cafe not found".

Test isolation is free: each Playwright browser context starts with empty `localStorage`.

## 14. CI pipeline (GitHub Actions)

`.github/workflows/ci.yml`, triggered on `push` and `pull_request`:

1. Checkout, set up Node (LTS), cache npm.
2. `npm ci`.
3. `npm run test:unit` (Vitest, `--run`).
4. `npm run build` (Vite → `dist/`).
5. Cache + install Playwright browsers (`npx playwright install --with-deps`).
6. `npm run test:e2e` (Playwright runs against the built preview server).
7. On failure, upload the Playwright HTML report as an artifact.

## 15. Project structure

```
cafe-dashboard/
  index.html                  # Vite entry (no CDN scripts)
  package.json
  tsconfig.json
  vite.config.ts
  playwright.config.ts
  .gitignore
  .github/workflows/ci.yml
  docs/superpowers/specs/2026-05-30-cafe-feedback-saas-design.md
  src/
    main.tsx
    App.tsx                   # router + providers
    routes/
      Landing.tsx  Signup.tsx  Login.tsx
      FeedbackForm.tsx  Dashboard.tsx  Settings.tsx  NotFound.tsx
    components/
      StarRating.tsx  StatCards.tsx  RatingChart.tsx  CommentsList.tsx
      RequireAuth.tsx  Topbar.tsx  icons.tsx
    lib/
      storage.ts  session.ts  auth.ts  seed.ts
      repos/ users.ts  cafes.ts  feedback.ts
    styles/global.css         # the prototype's CSS
    types.ts
  tests/
    unit/      *.test.ts       # Vitest
    e2e/       *.spec.ts       # Playwright
```

## 16. Deployment

`npm run build` → static `dist/`. Deploy to Netlify / Vercel / Cloudflare Pages. The only
host requirement is an **SPA fallback** (rewrite all unmatched paths to `/index.html`) so
deep links like `/f/the-corner-cup` work on refresh. No env vars, no secrets.

## 17. Known limitations (by design)

- **Single-device.** Feedback submitted on one device/browser is stored there; it is not
  visible on another device or to the owner elsewhere. The shared "customers submit → owner
  reviews" SaaS promise is *simulated on one device*, not truly networked.
- **Mock auth.** See §8 — not real security.

These are accepted trade-offs of the front-end-only demo. The upgrade path is §18.

## 18. Out of scope / future

- **Real backend** (the data layer in §7 is the seam): swap localStorage repos for Supabase
  or a custom API to get real accounts + cross-device persistence with minimal UI change.
- **Per-cafe theming**: the removed tweaks concept can return as a real branding feature
  (brand color/fonts saved per cafe, applied to that cafe's form).
- **AI summary**: re-add once a backend exists to call the Anthropic API server-side.

## 19. First implementation step

Initialize git (no repo exists yet) with a Node/Vite `.gitignore`, then scaffold the Vite +
React + TS project and port the CSS/components before wiring routes and the data layer.
