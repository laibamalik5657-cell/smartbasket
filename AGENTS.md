# SmartBasket — Agent Guide

This document is written for AI coding agents who need to understand, build, and modify the SmartBasket project. SmartBasket is a **frontend-only grocery e-commerce web application** built with Next.js and React.

## Project Overview

- **Name:** `smartbasket`
- **Version:** `0.1.0`
- **Type:** Next.js web application using the App Router
- **Domain:** Online grocery store focused on fresh produce, pantry staples, dairy, bakery, and household items (content references Pakistani Rupee pricing and local brands).
- **Scope:** This is a frontend prototype. Product, cart, and favourite data are hard-coded or kept in React component state. Auth (login/register/forgot-password) uses a Mongoose-backed User collection in MongoDB, but sessions/JWTS/cookies and checkout integration are still demo-only.

## Technology Stack

- **Framework:** [Next.js](https://nextjs.org) `16.2.4` with the App Router
- **UI Library:** [React](https://react.dev) `19.2.4` and `react-dom` `19.2.4`
- **Language:** [TypeScript](https://www.typescriptlang.org) `^5`
- **Styling:** [Tailwind CSS](https://tailwindcss.com) `^4` with the new `@theme inline` / `@import "tailwindcss"` configuration
- **PostCSS Plugin:** `@tailwindcss/postcss`
- **Icons:** [lucide-react](https://lucide.dev) `^1.17.0` and inline SVGs
- **Carousel:** [swiper](https://swiperjs.com) `^12.2.0` (declared but currently unused)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com) with `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`
- **Forms & Validation:** [react-hook-form](https://react-hook-form.com) `^7.79.0`, [@hookform/resolvers](https://github.com/react-hook-form/resolvers) `^5.4.0`, [Zod](https://zod.dev) `^4.4.3`
- **Database:** [MongoDB](https://www.mongodb.com) with [Mongoose](https://mongoosejs.com) `^9.7.0`
- **Font:** `Geist` and `Geist_Mono` loaded via `next/font/google`
- **Package Manager:** [pnpm](https://pnpm.io)
- **Linter:** ESLint `^9` with `eslint-config-next` (core-web-vitals + typescript presets)

## Project Structure

```text
/Users/macbook/Projects/six-sense/basket/smartbasket
├── app/                    # Next.js App Router pages and global styles
│   ├── about/page.tsx
│   ├── api/auth/           # Auth API routes (in-memory, prototype only)
│   │   ├── login/route.ts
│   │   ├── register/route.ts
│   │   └── forgot-password/route.ts
│   ├── cart/page.tsx
│   ├── contact/page.tsx
│   ├── favourite/page.tsx
│   ├── forgot-password/page.tsx
│   ├── items/see-more/page.tsx
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── ShopByCategory/page.tsx
│   ├── globals.css
│   ├── layout.tsx          # Root layout: fonts, metadata, Navbar, Footer
│   └── page.tsx            # Home / landing page
├── components/             # Shared React components
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   └── ui/                 # shadcn/ui components
│       ├── button.tsx
│       ├── checkbox.tsx
│       ├── form.tsx
│       ├── input.tsx
│       └── label.tsx
├── lib/                    # Shared server-side utilities, models, and validation
│   ├── auth.ts             # Password helpers and user service backed by MongoDB
│   ├── mongodb.ts          # Cached Mongoose connection helper
│   ├── utils.ts            # Tailwind class merging
│   ├── models/
│   │   └── User.ts         # Mongoose User model
│   └── validations/
│       └── auth.ts         # Zod schemas for auth forms and API routes
├── public/                 # Static assets
│   ├── dashboard/          # Dashboard-style product icons
│   ├── product/            # Single product images
│   └── products/           # Product grid images
├── types/                  # TypeScript declarations
│   └── next-shims.d.ts
├── .claude/                # Claude IDE local settings
├── next.config.ts          # Next.js configuration
├── eslint.config.mjs       # ESLint flat config
├── postcss.config.mjs      # Tailwind v4 PostCSS plugin
├── tsconfig.json           # TypeScript compiler options
├── pnpm-workspace.yaml     # pnpm workspace settings
└── package.json
```

### Route Map

| Route | File | Notes |
|-------|------|-------|
| `/` | `app/page.tsx` | Home: hero, category slider, featured products, value props, coupon CTA |
| `/about` | `app/about/page.tsx` | Marketing about page |
| `/contact` | `app/contact/page.tsx` | Contact form + FAQ (presentational) |
| `/cart` | `app/cart/page.tsx` | Shopping cart with local state |
| `/favourite` | `app/favourite/page.tsx` | Favourites/wishlist with local state |
| `/items/see-more` | `app/items/see-more/page.tsx` | Product grid with category filter |
| `/ShopByCategory` | `app/ShopByCategory/page.tsx` | Standalone category slider page |
| `/login` | `app/login/page.tsx` | Sign-in page (shadcn Form + react-hook-form + Zod, calls `/api/auth/login`) |
| `/signup` | `app/signup/page.tsx` | Sign-up page (shadcn Form + react-hook-form + Zod, calls `/api/auth/register`) |
| `/forgot-password` | `app/forgot-password/page.tsx` | Forgot-password page (shadcn Form + react-hook-form + Zod, calls `/api/auth/forgot-password`) |
| `/api/auth/login` | `app/api/auth/login/route.ts` | POST: validates with Zod, queries MongoDB, returns user or 401 |
| `/api/auth/register` | `app/api/auth/register/route.ts` | POST: validates with Zod, creates User document or returns 409 |
| `/api/auth/forgot-password` | `app/api/auth/forgot-password/route.ts` | POST: validates with Zod, returns generic success message |

## Build and Development Commands

All commands should be run from the project root.

```bash
# Install dependencies (required before first build)
pnpm install

# Start the development server on http://localhost:3000
pnpm dev

# Create an optimised production build
pnpm build

# Start the production server (after building)
pnpm start

# Run ESLint
pnpm lint
```

### Important Build Notes

- `pnpm build` prerenders the marketing pages statically. Auth API routes are dynamic because they connect to MongoDB at runtime.
- `next.config.ts` does **not** set `output: 'export'`, so `pnpm start` will run a Next.js production server rather than serving a fully static export.
- The project declares `lucide-react`, `swiper`, and `mongoose` in `package.json`/`pnpm-lock.yaml`. On a fresh clone you must run `pnpm install` before building; otherwise the build will fail with missing module errors.
- A running MongoDB instance and a valid `MONGODB_URI` environment variable are required for the auth routes to work.

## MongoDB Setup

Auth data is stored in MongoDB via Mongoose.

1. Create a MongoDB database (local, Docker, or Atlas).
2. Add a `.env.local` file at the project root:

   ```env
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/smartbasket?retryWrites=true&w=majority
   ```

3. Run `pnpm dev`. The auth API routes connect on first request and seed a demo user (`demo@smartbasket.com` / `password123`) if one does not exist.

## Code Style and Conventions

### Component Style

- Pages and components are written as **default-exported functional components**.
- Interactive pages (cart, favourites, home slider, product grid) use `"use client"` at the top of the file.
- Presentational pages (`about`, `contact`) are server components by default. Interactive auth pages (`login`, `signup`, `forgot-password`) are client components that call the auth API routes.
- Components use a mix of inline SVGs and `lucide-react` icons.

### Styling Conventions

- Tailwind CSS utility classes are used almost everywhere.
- Design tokens are defined as CSS variables in `app/globals.css` and mapped in `@theme inline`:
  - `background`, `foreground`, `brand`, `brand-dark`, `brand-light`, `muted`, `surface`, `border`
- The primary brand colour is green (`#16a34a`).
- Some pages use one-off colour values (e.g., `emerald-600`, `gray-800`) alongside the design tokens.

### TypeScript Conventions

- `tsconfig.json` enables `strict: true` and `isolatedModules: true`.
- Path alias `@/*` maps to `./*`.
- Local component types are declared inside the files that use them (e.g., `CartItem`, `Product`).
- `types/next-shims.d.ts` declares wildcard module types for page files.

### Asset Handling

- Local images live under `public/`.
- Many product/category images are loaded from external URLs (Unsplash, grocerapps, etc.).
- `next.config.ts` whitelists `images.unsplash.com` for `next/image`.
- Some pages use `<img>` instead of Next.js `<Image />`. ESLint warns about this.
- A few files contain large inline `data:image/jpeg;base64,…` strings, which significantly increases file size.

## Testing Instructions

- **There is no test framework configured in this project.**
- There are no unit tests, integration tests, E2E tests, or test scripts.
- Validation is currently done by running `pnpm build` and `pnpm lint`.
- If you add tests, place them alongside the code or in a `__tests__` directory and wire them into `package.json` scripts (e.g., `test`, `test:e2e`).

## Lint and Quality Status

As of the latest exploration, `pnpm lint` reports:

- **0 errors**.
- **3 warnings** about using native `<img>` instead of `next/image` for performance.

The unescaped apostrophe in `app/ShopByCategory/page.tsx` has been fixed.

## Deployment Process

- The project follows the standard Next.js deployment model.
- The README recommends deploying to [Vercel](https://vercel.com).
- There is no CI/CD pipeline, Docker file, or platform-specific deployment configuration committed in the repo.
- Because the app is frontend-only and statically prerendered, it can also be deployed to any static host if `output: 'export'` is added to `next.config.ts`.

## Security Considerations

- **Prototype authentication only:** `/api/auth/*` routes persist users in MongoDB using salted SHA-256 password hashes. There are still no real sessions, JWTs, cookies, or email delivery; treat auth as a demo.
- **Database backend:** User data is stored in MongoDB via Mongoose. A unique index on `email` prevents duplicate accounts.
- **External images:** The app loads images from third-party domains. A Content Security Policy should be added before production use.
- **Input validation:** Login and signup forms are validated with Zod on both client and API route. Contact form validation is still presentational.
- **Environment variables:** The app reads `MONGODB_URI` from the environment. Create `.env.local` at the project root and keep it out of version control.

## Common Gotchas for Agents

1. **Always run `pnpm install` first** on a fresh checkout; the lockfile is the source of truth.
2. **Auth requires MongoDB.** Set `MONGODB_URI` in `.env.local` or auth routes will throw at runtime. Cart and favourites are still purely local `useState`.
3. **Watch for lint errors** caused by unescaped characters (`'`, `"`, `>`) in JSX text.
4. **Prefer `next/image`** over `<img>` for new images, and update `next.config.ts` `images.remotePatterns` if new external hostnames are introduced.
5. **Keep files small:** Avoid adding large base64 strings to source files; place images in `public/` or use external optimised URLs.
6. **App Router conventions:** Use `page.tsx` for routes, `layout.tsx` for shared layouts, and `loading.tsx`/`error.tsx` only if you add them.
