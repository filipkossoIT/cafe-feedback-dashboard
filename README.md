# Cafe Feedback

A small multi-cafe customer-feedback SaaS demo. Originally a design prototype, it has been rebuilt from the ground up as a real Vite + React + TypeScript application.

---

## ⚠️ Demo limitations

This project is intentionally scoped as a **front-end-only demo**. Please read these before sharing or deploying it:

- **No backend or database.** All data is stored in the browser's `localStorage`. Nothing is sent to a server or persisted anywhere else.
- **Single-device only.** Feedback submitted in one browser is only visible in that same browser. The "customers submit feedback → owner reviews it" flow is simulated entirely on one device — it is not networked across devices.
- **Mock auth, not real security.** Account creation and password hashing happen entirely in the browser using the Web Crypto API. This is a demonstration, not a secure system. Do not store real personal data.
- **Secure context required.** `crypto.subtle` and `crypto.randomUUID` only work on `localhost` or any HTTPS host. Plain HTTP deployments will not work.

---

## Tech stack

| Layer | Tool |
|---|---|
| Build & dev server | [Vite](https://vitejs.dev/) |
| UI | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Routing | [React Router v6](https://reactrouter.com/) |
| Unit tests | [Vitest](https://vitest.dev/) |
| E2E tests | [Playwright](https://playwright.dev/) |
| CI | [GitHub Actions](https://github.com/features/actions) |

---

## Getting started

```bash
npm install
```

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server at `http://localhost:5173` |
| `npm run build` | Type-check then bundle to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run test:unit` | Run the Vitest unit suite |
| `npm run test:e2e` | Run the Playwright E2E suite |

**First E2E run:** install the browser binary first:
```bash
npx playwright install chromium
```

---

## Routes

| Path | Description |
|---|---|
| `/` | Landing page — includes a "Try the demo" link |
| `/signup` | Create a cafe owner account |
| `/login` | Sign in |
| `/f/:slug` | Public feedback form (shareable with customers) |
| `/dashboard` | Cafe owner dashboard — view and filter feedback (protected) |
| `/settings` | Cafe settings and shareable link (protected) |

A seeded demo cafe, **The Corner Cup**, is available at `/f/the-corner-cup` without signing up.

---

## Project structure

```
src/
  lib/          # Data layer — storage, auth, crypto, repos, seed, session, time, categories
  components/   # Shared UI components (charts, modals, auth guards, icons …)
  routes/       # One file per route (Landing, Signup, Login, FeedbackForm, Dashboard, Settings)
tests/
  unit/         # Vitest tests for lib utilities
  e2e/          # Playwright tests for core user flows
```

---

## Deploying

Run `npm run build` — it produces a static `dist/` folder you can host anywhere.

**Recommended hosts:** Netlify, Vercel, Cloudflare Pages.

**Important — SPA fallback:** the app uses client-side routing, so your host must redirect all unmatched paths back to `index.html`. Without this, reloading a deep link like `/f/the-corner-cup` will return a 404.

- **Netlify:** add a `public/_redirects` file (or `netlify.toml`) containing:
  ```
  /*  /index.html  200
  ```
- **Vercel:** add a `vercel.json` with a rewrite rule:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
- **Cloudflare Pages:** enable the built-in "SPA" option in your Pages project settings, or add a `_redirects` file identical to the Netlify one above.

No environment variables or secrets are needed.
