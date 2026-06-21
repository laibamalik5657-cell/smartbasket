# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> A detailed companion guide lives in **`AGENTS.md`** (route map, conventions, gotchas, security notes). Read it for anything not covered here.

## Commands

Package manager is **pnpm**. Run from the project root.

```bash
pnpm install        # required on a fresh checkout (lockfile is source of truth)
pnpm dev            # dev server on http://localhost:3000
pnpm build          # production build (prerenders marketing pages; auth/seed routes are dynamic)
pnpm start          # production server (after build)
pnpm lint           # ESLint (eslint-config-next: core-web-vitals + typescript)
```

There is **no test framework** configured — validation is `pnpm build` + `pnpm lint`. `pnpm lint` is expected to report a couple of warnings about native `<img>` vs `next/image` (warnings, not errors).

This repo's ESLint treats `react-hooks/set-state-in-effect` as an **error**, which forbids the common "load from `localStorage` in a `useEffect`" / mounted-flag pattern. That is why `lib/store.tsx` reads `localStorage` through `useSyncExternalStore` instead — follow that pattern for any new client-persisted state.

## Architecture

Next.js **16 App Router** + React 19 + TypeScript (strict), Tailwind CSS **v4** (config via `@theme inline` in `app/globals.css`, no `tailwind.config.js`), shadcn/ui on radix-ui. Path alias `@/*` → repo root.

This is a **frontend grocery e-commerce prototype**. Product data is hard-coded. **Cart, favourites, and placed orders persist client-side in `localStorage`** via a shared store at `lib/store.tsx` — a module-level store read through `useSyncExternalStore` and exposed by the `useStore()` hook. Use `useStore()` for cart/favourites/orders state; **do not** reintroduce per-page `useState`. `StoreProvider` wraps the app in `app/layout.tsx` (it's a passthrough — the store is module-level). Only auth and categories touch the **database**; orders never reach a backend.

**Client→API calls go through `lib/axios.ts`** (a shared axios instance with `baseURL: "/api"`), imported as `@/lib/axios`. Do **not** use `fetch` for API calls.

**Use Mongoose (decided):** the backend talks to MongoDB through **Mongoose**, not the native `mongodb` driver. Keep it that way — schemas, the `email` unique index, the `globalThis` connection cache, and model re-registration guards are all Mongoose patterns already wired in correctly. Mongoose handles data shape at the DB layer; **Zod** handles request validation in API routes. Only reconsider the native driver if the backend grows enough that the schema layer becomes a burden.

**The DB-backed slice (the only real backend):**

- `lib/mongodb.ts` — `connectToDatabase()` caches the Mongoose connection on `globalThis` to survive hot-reload / serverless reuse. Every server-side DB access goes through it. Reads `MONGODB_URI` from env and throws if unset.
- `models/` — Mongoose models (`User`, `Category`). Models guard against re-registration on hot reload.
- `schema/index.ts` — Zod schemas shared by **both** client forms and the API routes (imported as `@/schema`).
- `app/api/auth/{login,register,forgot-password}/route.ts` — POST handlers. Each is **self-contained**: it Zod-validates, connects via `connectToDatabase()`, and does its own auth work (**bcrypt** hashing — `bcrypt.hash`/`bcrypt.compare`, cost 12 — directly against the `User` model; bcrypt embeds its own salt, so there is no `passwordSalt` column). There is **no shared `lib/auth.ts`**. `login` also seeds the demo account (`demo@smartbasket.com` / `password123`). **No sessions/JWT/cookies** exist yet; auth is demo-only. `bcrypt` is a native module — listed in `next.config.ts` `serverExternalPackages` and `package.json` `pnpm.onlyBuiltDependencies`.
- `app/api/seed/categories/route.ts` — POST drops & re-seeds the Category collection from `lib/seed/categories.ts`.

**Frontend:** `app/layout.tsx` is the root layout (Geist fonts, Navbar, Footer). Pages are default-exported functional components; interactive ones (`cart`, `favourite`, home category slider, auth pages) use `"use client"`. The category slider lives at `app/_components/category-slider/index.tsx` and fetches categories from the DB.

## Database — local MongoDB

The app connects to a **local MongoDB** via `MONGODB_URI`. The committed `.env` points at `mongodb://127.0.0.1:27017/smart-basket` (note: `connectToDatabase` accepts any `MONGODB_URI`, so an Atlas URI also works — `AGENTS.md` documents the Atlas path).

### Troubleshooting: anything wrong with the DB

When the database errors out (connection refused, timeouts, queries hanging, app can't reach Mongo), **first check that MongoDB is running**:

```bash
pgrep -l mongod
lsof -nP -iTCP:27017 -sTCP:LISTEN
```

If it is not running, start it:

```bash
mongod --dbpath /opt/homebrew/var/mongodb \
       --logpath /opt/homebrew/var/log/mongodb/mongo.log \
       --bind_ip 127.0.0.1 --port 27017
```

Run it in a background terminal (append `&`) or a separate window — it stays in
the foreground. Then re-run the check above to confirm it's listening on 27017.

Notes:

- MongoDB is a **manual install** (`~/.local/mongodb/8.3.4`), symlinked to
  `/opt/homebrew/bin/mongod` — it is **not** a Homebrew formula, so
  `brew services start mongodb-community` does **not** work here.
- `--fork` is **not supported on macOS**; run it in the background instead.
- Not a managed service, so it does **not** auto-start on reboot — re-run the command.
- Data dir: `/opt/homebrew/var/mongodb` · Log: `/opt/homebrew/var/log/mongodb/mongo.log`

## Conventions worth knowing

- **Tailwind v4**: design tokens are CSS variables in `app/globals.css` mapped via `@theme inline` (`brand`, `brand-dark`, `surface`, etc.); brand colour is green `#16a34a`. There is no JS Tailwind config.
- New external image hostnames must be added to `images.remotePatterns` in `next.config.ts` (currently `images.unsplash.com`). Prefer `next/image` over `<img>`.
- Avoid committing large inline `data:image/...;base64` strings — put assets in `public/` or use optimised URLs.
- Local component types (`CartItem`, `Product`, …) are declared inside the file that uses them.
