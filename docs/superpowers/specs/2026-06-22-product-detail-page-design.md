# Product detail page — Design

**Date:** 2026-06-22
**Status:** Approved (pending spec review)

## Goal

Add a product detail page at `/product/[slug]`. To support it, introduce a DB-backed
`Product` model as the single source of truth for products, seed it (and categories) from one
unified seed script, expose a products API, make the existing product cards link through to
the detail page, and refactor the home and see-more pages to read products from the DB instead
of their hard-coded arrays.

## Decisions from brainstorming

- **Data source:** DB-backed `Product` Mongoose model (not a static catalog). The public site
  reads products from MongoDB.
- **Page content:** Core layout — image, name, price, unit, description, in-stock status,
  quantity selector, Add to Cart, Favourite toggle, and a breadcrumb/back link. No related
  products, ratings, or reviews.
- **URLs:** `slug`-based (`/product/[slug]`), matching the `Category` model's `slug` pattern.
- **Refactor scope:** Full — home and see-more both move off their hard-coded arrays to the DB.
- **Seeding:** One main seed file/script (not per-collection seed API routes), runnable via
  `pnpm seed`, that seeds **both** categories and products.

## Out of scope (tracked elsewhere)

- **Admin panel** (admin creates/edits products & categories in the DB). A large future epic,
  logged in `tech-debt.md` item #6. Not part of this work. For now products/categories are
  populated by the seed script.

## Data model — `models/Product.ts`

Mirrors `models/Category.ts` (re-registration guard, `createdAt`-only timestamps).

```ts
interface IProduct {
  _id: ObjectId;
  name: string;          // required, trim
  slug: string;          // required, unique, lowercase, trim — drives the URL
  price: number;         // required
  unit?: string;         // e.g. "/ dozen", "/ 1L"
  image: string;         // required — existing /products/*.png|jpg asset path
  category?: string;     // free-text category label (matches Category.name where applicable)
  description: string;   // required — authored in the seed
  tag?: string;          // e.g. "Fresh", "Best Seller" (optional badge)
  inStock: boolean;      // default true
  order: number;         // default 0 — listing order
  createdAt: Date;
}
```

## Seed — unified data + script

- **Data modules:** keep `lib/seed/categories.ts` (existing category data); add
  `lib/seed/products.ts` exporting the product catalog. The catalog unifies **both** existing
  arrays (~14 products: the 8 from `app/page.tsx` + the 6 from `app/items/see-more/page.tsx`),
  each given a unique `slug`, a `category`, and a **written `description`** (current data has
  none). Images reuse the existing `/products/*` assets. Home items keep their `tag`.
- **Main seed script:** `scripts/seed.ts` — loads env, connects to Mongo via `MONGODB_URI`,
  and re-seeds the `Category` and `Product` collections (drop + insert) from the two data
  modules. Runnable via a new `"seed"` script in `package.json` (e.g. `pnpm seed`). Tooling
  (likely `tsx` + Node `--env-file=.env`, with relative imports so it runs outside Next) is
  finalized in the implementation plan.
- The existing `app/api/seed/categories/route.ts` is **superseded** by the script and removed
  (categories are now seeded by `pnpm seed`).

## API — `app/api/products/route.ts`

- `GET /api/products` → all products (sorted by `order`), with an optional `?category=`
  filter. Used by the listing pages (home, see-more).
- The **detail page reads the DB directly** as a server component (`connectToDatabase()` +
  `Product.findOne({ slug })`) — no extra HTTP hop. A dedicated `GET /api/products/[slug]`
  is not required.

## Detail page — `app/product/[slug]/page.tsx`

- **Server component.** Resolves `params.slug`, connects to the DB, fetches the product. If
  none, calls `notFound()` (renders the App Router 404).
- **Core layout:** product image (left/top) · name · `Rs.{price} {unit}` · in-stock status ·
  description · breadcrumb/back link. Uses `next/image`.
- **Interactivity** lives in a client child `app/product/[slug]/product-actions.tsx`
  (`"use client"`, `useStore()`): a quantity selector (− / value / +), **Add to Cart** (adds
  the chosen quantity), and a **Favourite** toggle. Receives the plain product as props.

## Linking — make product cards clickable

- **Home `app/_components/product-card.tsx`:** wrap the image + title in a `Link` to
  `/product/[slug]`. The Add and Favourite buttons call `e.stopPropagation()` /
  `e.preventDefault()` so they act in place without navigating. (Requires the card to know the
  product's `slug` — added to the product shape it receives.)
- **See-more cards:** same treatment — image/title link to the detail page; action buttons
  don't navigate.

## Refactor — home & see-more read from the DB

- **`app/page.tsx`** (already a server component fetching categories) also fetches products and
  passes them to `ProductCard`.
- **`app/items/see-more/page.tsx`** becomes a server shell that fetches products and passes
  them to a client child holding the existing category-filter + add-to-cart/favourite
  interactivity. This keeps the data-fetch on the server and avoids the
  `react-hooks/set-state-in-effect` lint error (no `useEffect` + `setState` fetch pattern).

## Error handling & edge cases

- Detail page: unknown slug → `notFound()` (404).
- `GET /api/products`: DB/connection errors → 500 with a JSON error body.
- Empty product list: listing pages render their existing empty/normal states.
- Seed script: fails loudly (non-zero exit) on connection error; idempotent (drop + re-insert).

## Verification

- `pnpm lint` (0 warnings) + `pnpm build` pass.
- `pnpm seed` populates categories + products; confirm counts in Mongo.
- `GET /api/products` returns the catalog; `?category=` filters.
- `/product/<valid-slug>` renders core layout; `/product/<bad-slug>` → 404.
- Home + see-more render from the DB and link to the correct detail pages; Add to Cart /
  Favourite still work without navigating.

## Files touched

- `models/Product.ts` (new)
- `lib/seed/products.ts` (new), `lib/seed/categories.ts` (kept)
- `scripts/seed.ts` (new) + `package.json` (`seed` script, maybe `tsx` devDep)
- `app/api/products/route.ts` (new)
- `app/api/seed/categories/route.ts` (removed — superseded by the script)
- `app/product/[slug]/page.tsx` (new), `app/product/[slug]/product-actions.tsx` (new)
- `app/_components/product-card.tsx` (link + slug)
- `app/page.tsx` (fetch products from DB)
- `app/items/see-more/page.tsx` (server shell + client child for fetch + interactivity)
- `tech-debt.md` (admin epic logged — done)
