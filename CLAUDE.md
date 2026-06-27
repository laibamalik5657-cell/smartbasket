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
pnpm seed           # reset & re-seed Category + Product collections (scripts/seed.ts via tsx)
```

`pnpm seed` runs `scripts/seed.ts`, which calls `resetAndSeedCategories()` and `resetAndSeedProducts()` from `lib/seed/`. Run it once after starting Mongo on a fresh DB — the product/category pages render nothing until the collections are seeded.

There is **no test framework** configured — validation is `pnpm build` + `pnpm lint`. `pnpm lint` is expected to report a couple of warnings about native `<img>` vs `next/image` (warnings, not errors).

This repo's ESLint treats `react-hooks/set-state-in-effect` as an **error**, which forbids the common "load from `localStorage` in a `useEffect`" / mounted-flag pattern. That is why `lib/store.tsx` reads `localStorage` through `useSyncExternalStore` instead — follow that pattern for any new client-persisted state.

## Architecture

Next.js **16 App Router** + React 19 + TypeScript (strict), Tailwind CSS **v4** (config via `@theme inline` in `app/globals.css`, no `tailwind.config.js`), shadcn/ui on radix-ui. Path alias `@/*` → repo root.

This is a **grocery e-commerce prototype**. **Cart and favourites persist client-side in `localStorage`** via a shared store at `lib/store.tsx` — a module-level store read through `useSyncExternalStore` and exposed by the `useStore()` hook (keys: `smartbasket:cart`, `:favorites`). Use `useStore()` for that state; **do not** reintroduce per-page `useState`. `StoreProvider` wraps the app in `app/layout.tsx` (it's a passthrough — the store is module-level). **The signed-in user is NOT in the store** (it's the JWT — see the auth section), and **orders are now DB-backed** (no longer in the store — see below).

**Products and categories are DB-backed**, read **server-side**: `app/page.tsx`, `app/items/see-more/page.tsx`, and `app/product/[slug]/page.tsx` are async server components that call `connectToDatabase()` and query the `Product`/`Category` models directly, then pass plain objects to client components (`ProductCard`, `CategorySlider`, `FeaturedList`). They do **not** go through `lib/axios`. The `GET /api/products?category=&q=` route serves client-side needs: category filtering and **search** (the home hero `SearchBox` at `app/_components/search-box.tsx` is a debounced autocomplete that hits `?q=`; `q` is regex-escaped server-side).

**Orders are DB-backed and per-user.** Checkout requires login; `cart` POSTs to `/api/orders`, then `my-orders` and `order-confirmation` read back via the API. Because auth is a localStorage JWT (server components can't read it) **and** this repo bans `set-state-in-effect`, those two pages fetch on the client with **`useAuthGet()` (`lib/use-api.ts`)** — a Suspense helper built on React 19's `use()` (no `useEffect`); wrap callers in `<Suspense>`. Server-side, `getAuthUser` scopes every query to the caller's `userId`, so users only ever see their own orders.

**Client→API calls go through `lib/axios.ts`** (a shared axios instance with `baseURL: "/api"`), imported as `@/lib/axios`. Do **not** use `fetch` for API calls.

**Use Mongoose (decided):** the backend talks to MongoDB through **Mongoose**, not the native `mongodb` driver. Keep it that way — schemas, the `email` unique index, the `globalThis` connection cache, and model re-registration guards are all Mongoose patterns already wired in correctly. Mongoose handles data shape at the DB layer; **Zod** handles request validation in API routes. Only reconsider the native driver if the backend grows enough that the schema layer becomes a burden.

**The DB-backed slice (the only real backend):**

- `lib/mongodb.ts` — `connectToDatabase()` caches the Mongoose connection on `globalThis` to survive hot-reload / serverless reuse. Every server-side DB access goes through it. Reads `MONGODB_URI` from env and throws if unset.
- `models/` — Mongoose models (`User`, `Category`, `Product`, `ContactMessage`, `Order`). Models guard against re-registration on hot reload. `models/Order.ts` also exports `toPlainOrder()`, the doc→JSON mapper the order routes share.
- `schema/index.ts` — Zod schemas shared by **both** client forms and the API routes (imported as `@/schema`): `loginSchema`, `registerSchema`/`signupFormSchema`, `forgotPasswordSchema`, `resetPasswordSchema` (API) / `resetPasswordFormSchema` (client), `updateProfileSchema`, `contactSchema`, `createOrderSchema`.
- `app/api/auth/{login,register,forgot-password,reset-password}/route.ts` — POST handlers. Each Zod-validates, connects via `connectToDatabase()`, and does its own **bcrypt** work (`bcrypt.hash`/`bcrypt.compare`, cost 12 — directly against the `User` model; bcrypt embeds its own salt, so there is no `passwordSalt` column). `login` calls `signToken()` from `lib/auth.ts` on success; `register` creates the user but **issues no token** (no auto-login — signup redirects to `/login`). `bcrypt` is a native module — listed in `next.config.ts` `serverExternalPackages` and `package.json` `pnpm.onlyBuiltDependencies`.
- **Password reset (real email).** `forgot-password` generates a random token, stores its **sha256 hash** + a 1-hour expiry on the `User` (never the raw token), and emails a `/reset-password?token=…` link (base URL from the **`APP_URL`** env — a trusted server-controlled value, never the request `Host` header, to avoid reset-link poisoning; defaults to `http://localhost:3000`) via **`lib/email.ts`** (nodemailer; `serverExternalPackages`). Email is sent only if `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` are set — otherwise the link is **logged to the server console** so the flow is testable without SMTP. `reset-password` hashes the submitted token, finds the user by `{ resetToken, resetTokenExpiry > now }`, sets a new bcrypt hash, and **clears the token** (single-use). `app/reset-password/page.tsx` is the client form (wrapped in `<Suspense>` for `useSearchParams`). Both `forgot-password` responses are intentionally generic to prevent email enumeration.
- `lib/auth.ts` — the **shared server-side JWT helper**: `signToken(user)` (7-day HS256) and `getAuthUser(request)` (reads/verifies the `Bearer` token, returns claims or `null`). `JWT_SECRET` is resolved here once at module load and **throws at startup if unset** (no forgeable fallback). Protected routes use `getAuthUser` — do **not** re-implement Bearer parsing/verification inline.
- `app/api/user/route.ts` — `PATCH` updates the signed-in user's name. Guards with `getAuthUser(request)` (401 if null), then re-issues a fresh token via `signToken` so name claims stay in sync. This is the pattern any future protected route (e.g. orders) should copy.
- `app/api/products/route.ts` — `GET ?category=` returns products (used for client-side category filtering). `app/api/contact/route.ts` — `POST` persists a `ContactMessage`.
- `app/api/orders/route.ts` — `POST` places an order (guarded by `getAuthUser`; **recomputes** subtotal/shipping/total server-side from the validated items — never trusts client money) and `GET` lists the caller's orders. `app/api/orders/[id]/route.ts` — `GET` one order, scoped to `{ _id, userId }` so it 404s on someone else's order.

**Auth = JWT, client side.** The JWT **is** the session — there is no cookie/server session and no demo-account seed. The client stores the token in `localStorage` via three plain helpers in **`lib/utils.ts`** (`saveToken`/`getToken`/`deleteToken`, key `smartbasket:token`) — **not** in the store. Components read the current user **reactively** with **`useAuthUser()` from `lib/use-auth.ts`**, which decodes the token via `lib/decode-jwt.ts` (`userFromToken` — **client-safe decode only, no signature verification**; never trust it for authorization) through `useSyncExternalStore` (so it's hydration-safe and avoids the forbidden `set-state-in-effect`). Login/logout/profile-save call `saveToken`/`deleteToken` then do a **full-page navigation** (`window.location.assign(...)` / `.reload()` — note: assigning `window.location.href` trips the `react-hooks/immutability` lint rule, so use the method form) so every component re-reads the token fresh.

**Frontend:** `app/layout.tsx` is the root layout (Geist fonts, Navbar, Footer). Pages are default-exported functional components. Data-bearing pages (`home`, `items/see-more`, `product/[slug]`) are async **server** components that query Mongo directly; interactive leaves (`cart`, `favourite`, `product-actions`, `category-slider`, `my-orders`, `profile`, auth pages) are `"use client"` and read state via `useStore()` or call API routes through `@/lib/axios`. The category slider (`app/_components/category-slider/index.tsx`) receives categories as props from the home server component — it does not fetch.

## Database — local MongoDB

The app connects to a **local MongoDB** via `MONGODB_URI`. The committed `.env` points at `mongodb://127.0.0.1:27017/smart-basket` (note: `connectToDatabase` accepts any `MONGODB_URI`, so an Atlas URI also works — `AGENTS.md` documents the Atlas path). `.env` also holds **`JWT_SECRET`** (required — the auth routes throw at startup if it's unset; generate one with `openssl rand -base64 48`). Optional **`SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`SMTP_FROM`** enable real password-reset emails; without them the reset link is logged to the server console instead. **`APP_URL`** sets the trusted base URL for reset links (defaults to `http://localhost:3000`) — set it in any deployed environment.

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
- New external image hostnames must be added to `images.remotePatterns` in `next.config.ts` (currently `images.unsplash.com`, `cdn.jsdelivr.net`, `pictures.grocerapps.com`, `qne.com.pk`). Prefer `next/image` over `<img>`.
- Avoid committing large inline `data:image/...;base64` strings — put assets in `public/` or use optimised URLs.
- Local component types (`CartItem`, `Product`, …) are declared inside the file that uses them.
