# Product Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/product/[slug]` detail page backed by a new MongoDB `Product` model, seed it (and categories) from one script, expose a products API, and make home + see-more read from the DB with clickable product cards.

**Architecture:** A `Product` Mongoose model is the single source of truth. A standalone `pnpm seed` script (re)seeds Category + Product collections from data modules. The detail page is a server component that queries the DB by `slug` directly; home and see-more fetch products on the server and pass them to client components for interactivity. Product cards link to the detail page.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript (strict), Mongoose 9, Zod (existing), Tailwind v4, `tsx` (new, for the seed script).

## Global Constraints

- **Mongoose only** — never the native `mongodb` driver. Mirror the existing `models/Category.ts` model pattern (re-registration guard, `timestamps: { createdAt: true, updatedAt: false }`).
- **`pnpm lint` must report 0 warnings and 0 errors; `pnpm build` must pass.** These are the only validation gates (no unit-test framework exists — verification is build + lint + runtime checks).
- **Use `next/image`**, not `<img>`. Existing image hosts are already in `next.config.ts` `images.remotePatterns`; all product images are local `/products/*` assets.
- **Tailwind tokens:** brand green is `brand` / `brand-dark` / `brand-light`; use existing tokens (`foreground`, `muted-foreground`, `border`, `surface`, `card`).
- **URLs are `slug`-based** (`/product/[slug]`). **The store cart/favourite id is the product `slug`** everywhere.
- **MongoDB must be running** for seed/API/page verification (`pgrep -l mongod`; start per CLAUDE.md if not). The dev server runs at `http://localhost:3000`.
- API responses follow the existing shape: `{ success: boolean, ... , message? }`.

---

### Task 1: Product model

**Files:**
- Create: `models/Product.ts`

**Interfaces:**
- Produces: `Product` (Mongoose model) and `IProduct` interface with fields `_id, name, slug, price, unit?, image, category?, description, tag?, oldPrice?, discount?, rating?, inStock, order, createdAt`.

- [ ] **Step 1: Create the model**

```ts
// models/Product.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface IProduct {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  price: number;
  unit?: string;
  image: string;
  category?: string;
  description: string;
  tag?: string;
  oldPrice?: number;
  discount?: string;
  rating?: number;
  inStock: boolean;
  order: number;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: [true, "Product name is required."], trim: true },
    slug: {
      type: String,
      required: [true, "Product slug is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    price: { type: Number, required: [true, "Product price is required."] },
    unit: { type: String, default: "", trim: true },
    image: { type: String, required: [true, "Product image is required."], trim: true },
    category: { type: String, default: "", trim: true },
    description: {
      type: String,
      required: [true, "Product description is required."],
      trim: true,
    },
    tag: { type: String, default: "", trim: true },
    oldPrice: { type: Number },
    discount: { type: String, default: "", trim: true },
    rating: { type: Number },
    inStock: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Product =
  (models.Product as mongoose.Model<IProduct>) ||
  model<IProduct>("Product", ProductSchema);
```

- [ ] **Step 2: Type-check via build**

Run: `pnpm build`
Expected: PASS (compiles; `/product` route not added yet, that's fine).

- [ ] **Step 3: Commit**

```bash
git add models/Product.ts
git commit -m "feat(products): add Product Mongoose model"
```

---

### Task 2: Product seed data + relative imports for category seed

**Files:**
- Create: `lib/seed/products.ts`
- Modify: `lib/seed/categories.ts:1-2` (change `@/` imports to relative so the file is runnable from the standalone seed script)

**Interfaces:**
- Consumes: `Product`, `IProduct` (Task 1); existing `connectToDatabase`.
- Produces: `defaultProducts` array and `resetAndSeedProducts(): Promise<void>`.

- [ ] **Step 1: Make the category seed importable outside Next (relative imports)**

In `lib/seed/categories.ts`, change the first two lines:

```ts
// before
import { connectToDatabase } from "@/lib/mongodb";
import { Category, ICategory } from "@/models/Category";
// after
import { connectToDatabase } from "../mongodb";
import { Category, ICategory } from "../../models/Category";
```

(Leave the rest of the file unchanged.)

- [ ] **Step 2: Create the product seed data + reset function**

```ts
// lib/seed/products.ts
import { connectToDatabase } from "../mongodb";
import { Product, IProduct } from "../../models/Product";

type SeedProduct = Pick<
  IProduct,
  | "name" | "slug" | "price" | "unit" | "image" | "category"
  | "description" | "tag" | "oldPrice" | "discount" | "rating" | "order"
>;

export const defaultProducts: SeedProduct[] = [
  // --- from the home page ---
  { name: "Bananas", slug: "bananas", price: 250, unit: "/ dozen", image: "/products/bananas.png", category: "Fruits", tag: "Fresh", order: 1, description: "Sweet, ripe bananas picked at peak freshness — a quick, potassium-rich snack." },
  { name: "Bread", slug: "bread", price: 180, unit: "/ 1 pack", image: "/products/white-bread.png", category: "Bakery & Bread", tag: "Best Seller", order: 2, description: "Soft, freshly baked white bread — perfect for sandwiches and breakfast toast." },
  { name: "Milk", slug: "milk", price: 220, unit: "/ 1L", image: "/products/milk.png", category: "Milk and Dairy", tag: "Daily", order: 3, description: "Fresh full-cream milk, rich and creamy for tea, coffee, and cereal." },
  { name: "Flour", slug: "flour", price: 1100, unit: "/ 10 kg", image: "/products/flour.png", category: "Bakery & Bread", tag: "Bakery", order: 4, description: "Fine all-purpose flour milled for everyday rotis, breads, and baking." },
  { name: "Rice", slug: "rice", price: 400, unit: "/ 1 kg", image: "/products/rice.png", category: "Staples", tag: "Seasonal", order: 5, description: "Long-grain rice with a fragrant aroma — fluffy and separate when cooked." },
  { name: "Eggs", slug: "eggs", price: 350, unit: "/ 1 dozen", image: "/products/eggs.png", category: "Milk and Dairy", tag: "Organic", order: 6, description: "Farm-fresh eggs, a dozen of protein-packed goodness for any meal." },
  { name: "Cooking Oil", slug: "cooking-oil", price: 520, unit: "/ 1 kg", image: "/products/oil.png", category: "Oil & Ghee", tag: "Pantry", order: 7, description: "Light, healthy cooking oil suitable for frying, sautéing, and everyday cooking." },
  { name: "Chips", slug: "chips", price: 60, unit: "/ 1 pack", image: "/products/milk.png", category: "Snacks", tag: "Fresh", order: 8, description: "Crispy, lightly salted potato chips — the perfect crunchy snack." },

  // --- from the see-more page (with discount/rating fields) ---
  { name: "Dalda Banaspati Ghee Polybag", slug: "dalda-banaspati-ghee", price: 525, unit: "1 Kg", image: "/products/seemore-1.jpg", category: "Oil & Ghee", oldPrice: 560, discount: "6% OFF", rating: 4.8, order: 9, description: "Pakistan's trusted banaspati ghee for rich, flavourful cooking and frying." },
  { name: "Nestlé MilkPak Cream", slug: "nestle-milkpak-cream", price: 190, unit: "200 ml", image: "/products/seemore-2.jpg", category: "Milk and Dairy", oldPrice: 210, discount: "10% OFF", rating: 4.9, order: 10, description: "Thick, smooth dairy cream to top desserts, curries, and festive dishes." },
  { name: "Tapal Danedar Tea Family Pack", slug: "tapal-danedar-tea", price: 670, unit: "430 g", image: "/products/seemore-3.jpg", category: "Tapal Tea & Coffee", oldPrice: 720, discount: "Rs. 50 Save", rating: 4.7, order: 11, description: "Bold, granular black tea that brews a strong, aromatic cup every time." },
  { name: "National Iodized Salt", slug: "national-iodized-salt", price: 70, unit: "800 g", image: "/products/seemore-4.jpg", category: "Staples", oldPrice: 85, discount: "17% OFF", rating: 4.5, order: 12, description: "Pure iodized table salt for seasoning and everyday cooking essentials." },
  { name: "Dawn Bread Regular", slug: "dawn-bread-regular", price: 240, unit: "Large", image: "/products/seemore-5.jpg", category: "Bakery & Bread", oldPrice: 260, discount: "Rs. 20 Save", rating: 4.6, order: 13, description: "Fresh, fluffy large loaf — soft slices ideal for breakfast and snacks." },
  { name: "Shan Biryani Masala Double Pack", slug: "shan-biryani-masala", price: 160, unit: "100 g", image: "/products/seemore-6.jpg", category: "Masalas & Herbs", oldPrice: 180, discount: "11% OFF", rating: 4.9, order: 14, description: "Authentic biryani spice blend for a perfectly balanced, aromatic biryani." },
];

export async function resetAndSeedProducts(): Promise<void> {
  await connectToDatabase();
  await Product.deleteMany({});
  await Product.insertMany(defaultProducts);
}
```

- [ ] **Step 3: Verify build + lint**

Run: `pnpm lint && pnpm build`
Expected: PASS, 0 warnings.

- [ ] **Step 4: Commit**

```bash
git add lib/seed/products.ts lib/seed/categories.ts
git commit -m "feat(products): add product seed data; make category seed import relative"
```

---

### Task 3: Unified seed script (`pnpm seed`)

**Files:**
- Create: `scripts/seed.ts`
- Modify: `package.json` (add `tsx` devDependency + `seed` script)
- Delete: `app/api/seed/categories/route.ts` (superseded by the script)

**Interfaces:**
- Consumes: `resetAndSeedCategories` (existing), `resetAndSeedProducts` (Task 2).

- [ ] **Step 1: Add `tsx`**

Run: `pnpm add -D tsx`
Expected: adds `tsx` to devDependencies.

- [ ] **Step 2: Add the `seed` script to `package.json`**

In the `"scripts"` block, add:

```json
"seed": "node --env-file=.env --import tsx scripts/seed.ts"
```

(Keep the existing `dev`, `build`, `start`, `lint` scripts.)

- [ ] **Step 3: Create the seed script**

```ts
// scripts/seed.ts
import mongoose from "mongoose";
import { resetAndSeedCategories } from "../lib/seed/categories";
import { resetAndSeedProducts } from "../lib/seed/products";

async function main() {
  await resetAndSeedCategories();
  await resetAndSeedProducts();
  console.log("✓ Seeded categories and products.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
```

- [ ] **Step 4: Delete the superseded categories seed route**

```bash
git rm app/api/seed/categories/route.ts
```

- [ ] **Step 5: Run the seed and verify counts**

Ensure `mongod` is running first (`pgrep -l mongod`).
Run: `pnpm seed`
Expected output: `✓ Seeded categories and products.` (exit 0)

Verify in Mongo:
Run:
```bash
node -e 'const m=require("mongoose");(async()=>{await m.connect("mongodb://127.0.0.1:27017/smart-basket");console.log("products:",await m.connection.db.collection("products").countDocuments(),"categories:",await m.connection.db.collection("categories").countDocuments());await m.disconnect();})();'
```
Expected: `products: 14 categories: 13`

- [ ] **Step 6: Verify build + lint**

Run: `pnpm lint && pnpm build`
Expected: PASS, 0 warnings. (Build no longer includes `/api/seed/categories`.)

- [ ] **Step 7: Commit**

```bash
git add scripts/seed.ts package.json pnpm-lock.yaml
git commit -m "feat(seed): add unified pnpm seed script; remove categories seed route"
```

---

### Task 4: Products API (`GET /api/products`)

**Files:**
- Create: `app/api/products/route.ts`

**Interfaces:**
- Consumes: `connectToDatabase`, `Product`, `IProduct`.
- Produces: `GET /api/products` → `{ success, products }`, optional `?category=` filter. Each product: `{ id (slug), slug, name, price, unit, image, category, description, tag, oldPrice|null, discount, rating|null, inStock }`.

- [ ] **Step 1: Create the route**

```ts
// app/api/products/route.ts
import { connectToDatabase } from "@/lib/mongodb";
import { Product, IProduct } from "@/models/Product";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const category = new URL(request.url).searchParams.get("category");
    const query =
      category && category !== "All" ? { category } : {};
    const docs = await Product.find(query).sort({ order: 1 }).lean<IProduct[]>();
    const products = docs.map((p) => ({
      id: p.slug,
      slug: p.slug,
      name: p.name,
      price: p.price,
      unit: p.unit ?? "",
      image: p.image,
      category: p.category ?? "",
      description: p.description,
      tag: p.tag ?? "",
      oldPrice: p.oldPrice ?? null,
      discount: p.discount ?? "",
      rating: p.rating ?? null,
      inStock: p.inStock,
    }));
    return Response.json({ success: true, products }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    return Response.json({ success: false, message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify build + lint**

Run: `pnpm lint && pnpm build`
Expected: PASS; `/api/products` listed as a dynamic (ƒ) route.

- [ ] **Step 3: Runtime verify (dev server running)**

Run:
```bash
curl -s "http://localhost:3000/api/products" | node -e 'const d=JSON.parse(require("fs").readFileSync(0));console.log("count:",d.products.length,"first:",d.products[0].slug);'
curl -s "http://localhost:3000/api/products?category=Milk%20and%20Dairy" | node -e 'const d=JSON.parse(require("fs").readFileSync(0));console.log("dairy:",d.products.map(p=>p.slug));'
```
Expected: `count: 14 first: bananas`; dairy list includes `milk`, `eggs`, `nestle-milkpak-cream`.

- [ ] **Step 4: Commit**

```bash
git add app/api/products/route.ts
git commit -m "feat(products): add GET /api/products with category filter"
```

---

### Task 5: Detail page + actions

**Files:**
- Create: `app/product/[slug]/page.tsx`
- Create: `app/product/[slug]/product-actions.tsx`

**Interfaces:**
- Consumes: `connectToDatabase`, `Product`, `IProduct`, `useStore`, store `Product` type.
- Produces: route `/product/[slug]`; `ProductActions` client component taking `{ product: Product; inStock: boolean }`.

- [ ] **Step 1: Create the client actions component**

```tsx
// app/product/[slug]/product-actions.tsx
"use client";

import { useState } from "react";
import { Heart, Minus, Plus, ShoppingBasket } from "lucide-react";
import { useStore, type Product } from "@/lib/store";

export default function ProductActions({
  product,
  inStock,
}: {
  product: Product;
  inStock: boolean;
}) {
  const { addToCart, toggleFavourite, isFavourite } = useStore();
  const [qty, setQty] = useState(1);
  const fav = isFavourite(product.id);

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-lg border border-border">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="flex h-10 w-10 items-center justify-center text-foreground hover:text-brand"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-10 text-center text-sm font-medium">{qty}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => setQty((q) => q + 1)}
          className="flex h-10 w-10 items-center justify-center text-foreground hover:text-brand"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        disabled={!inStock}
        onClick={() => addToCart(product, qty)}
        className="flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
      >
        <ShoppingBasket className="h-4 w-4" />
        Add to Cart
      </button>

      <button
        type="button"
        aria-label="Toggle favourite"
        onClick={() => toggleFavourite(product)}
        className={`flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:text-brand ${
          fav ? "text-red-500" : "text-foreground"
        }`}
      >
        <Heart className={`h-4 w-4 ${fav ? "fill-red-500" : ""}`} />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create the detail page (server component)**

```tsx
// app/product/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import { Product, IProduct } from "@/models/Product";
import ProductActions from "./product-actions";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await connectToDatabase();
  const doc = await Product.findOne({ slug }).lean<IProduct>();
  if (!doc) notFound();

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-4xl">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-brand">
            Home
          </Link>{" "}
          / <Link href="/items/see-more" className="hover:text-brand">Products</Link> /{" "}
          <span className="text-foreground">{doc.name}</span>
        </nav>

        <div className="grid gap-8 rounded-2xl border border-border bg-card p-6 sm:p-8 md:grid-cols-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface">
            <Image
              src={doc.image}
              alt={doc.name}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-contain p-6"
            />
          </div>

          <div className="flex flex-col">
            {doc.category && (
              <span className="text-xs font-medium uppercase tracking-wide text-brand">
                {doc.category}
              </span>
            )}
            <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
              {doc.name}
            </h1>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                Rs. {doc.price}
                {doc.unit && (
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {doc.unit}
                  </span>
                )}
              </span>
              {doc.oldPrice ? (
                <span className="text-sm text-muted-foreground line-through">
                  Rs. {doc.oldPrice}
                </span>
              ) : null}
            </div>

            <p
              className={`mt-2 text-sm font-medium ${
                doc.inStock ? "text-brand" : "text-red-500"
              }`}
            >
              {doc.inStock ? "In stock" : "Out of stock"}
            </p>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {doc.description}
            </p>

            <ProductActions
              product={{
                id: doc.slug,
                name: doc.name,
                price: doc.price,
                image: doc.image,
                unit: doc.unit ?? "",
                category: doc.category ?? "",
              }}
              inStock={doc.inStock}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build + lint**

Run: `pnpm lint && pnpm build`
Expected: PASS; `/product/[slug]` listed as dynamic (ƒ).

- [ ] **Step 4: Runtime verify (dev server running, DB seeded)**

Run:
```bash
curl -s -o /dev/null -w "valid: %{http_code}\n" http://localhost:3000/product/bananas
curl -s http://localhost:3000/product/bananas | grep -o "In stock" | head -1
curl -s -o /dev/null -w "missing: %{http_code}\n" http://localhost:3000/product/does-not-exist
```
Expected: `valid: 200`, `In stock`, `missing: 404`.

- [ ] **Step 5: Commit**

```bash
git add app/product/
git commit -m "feat(products): add /product/[slug] detail page"
```

---

### Task 6: Home reads products from DB + clickable cards

**Files:**
- Modify: `app/_components/product-card.tsx` (add `slug`, wrap in `Link`, stop button propagation)
- Modify: `app/page.tsx` (remove static array + `seedCategories`, fetch products from DB)

**Interfaces:**
- Consumes: `Product`, `IProduct`, `connectToDatabase`; `FeaturedProduct` now requires `slug: string`.

- [ ] **Step 1: Update `ProductCard` — add slug + link + stop propagation**

Replace `app/_components/product-card.tsx` entirely:

```tsx
"use client";

import Link from "next/link";
import { useStore, type Product } from "@/lib/store";

export interface FeaturedProduct extends Product {
  slug: string;
  tag?: string;
}

export default function ProductCard({ product }: { product: FeaturedProduct }) {
  const { addToCart, toggleFavourite, isFavourite } = useStore();
  const fav = isFavourite(product.id);

  const storeProduct: Product = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    unit: product.unit,
  };

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-white p-4 transition-shadow hover:shadow-md"
    >
      <div className="relative flex aspect-square w-full items-center justify-center rounded-xl bg-white overflow-hidden">
        {product.tag && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-brand shadow-sm">
            {product.tag}
          </span>
        )}
        <button
          aria-label={`Favourite ${product.name}`}
          onClick={(e) => {
            stop(e);
            toggleFavourite(storeProduct);
          }}
          className={`absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm hover:text-brand ${
            fav ? "text-red-500" : "text-foreground"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill={fav ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="h-20 w-20" src={product.image} alt={product.name} />
      </div>
      <div className="mt-3 flex flex-1 flex-col">
        <h3 className="text-sm font-semibold text-foreground">{product.name}</h3>
        <p className="text-xs text-muted">In stock</p>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-base font-bold text-gray-900">
            Rs.{product.price}
            {product.unit && (
              <span className="ml-1 text-xs font-normal text-muted">{product.unit}</span>
            )}
          </p>
          <button
            onClick={(e) => {
              stop(e);
              addToCart(storeProduct);
            }}
            className="flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Add
          </button>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Update `app/page.tsx` — fetch products from DB**

Change the imports at the top of `app/page.tsx`:

```tsx
// remove:
import { seedCategories } from "@/lib/seed/categories";
// add:
import { connectToDatabase } from "@/lib/mongodb";
import { Product, IProduct } from "@/models/Product";
```
(Keep `import { Category, ICategory } from "@/models/Category";` and the `ProductCard, { type FeaturedProduct }` import.)

Delete the entire static `const products: FeaturedProduct[] = [ ... ];` array (lines ~9-18).

Replace the start of the `Home` function body:

```tsx
// before
export default async function Home() {
  await seedCategories();

  const categoryDocs = await Category.find({})
    .sort({ order: 1 })
    .lean<ICategory[]>();
// after
export default async function Home() {
  await connectToDatabase();

  const categoryDocs = await Category.find({})
    .sort({ order: 1 })
    .lean<ICategory[]>();
  const productDocs = await Product.find({})
    .sort({ order: 1 })
    .limit(8)
    .lean<IProduct[]>();
  const products: FeaturedProduct[] = productDocs.map((p) => ({
    id: p.slug,
    slug: p.slug,
    name: p.name,
    price: p.price,
    unit: p.unit ?? "",
    image: p.image,
    tag: p.tag ?? "",
  }));
```

(The `categories` mapping and the JSX `{products.map((p) => <ProductCard key={p.id} product={p} />)}` stay unchanged.)

- [ ] **Step 3: Verify build + lint**

Run: `pnpm lint && pnpm build`
Expected: PASS, 0 warnings.

- [ ] **Step 4: Runtime verify**

Run:
```bash
curl -s http://localhost:3000/ | grep -o 'href="/product/bananas"' | head -1
```
Expected: `href="/product/bananas"` (home product card links to the detail page).

- [ ] **Step 5: Commit**

```bash
git add app/_components/product-card.tsx app/page.tsx
git commit -m "feat(products): home reads products from DB; product cards link to detail"
```

---

### Task 7: See-more reads products from DB + clickable cards

**Files:**
- Create: `app/items/see-more/featured-list.tsx` (client — filter + cards + interactivity)
- Modify: `app/items/see-more/page.tsx` (becomes a server component that fetches + passes products)

**Interfaces:**
- Consumes: `connectToDatabase`, `Product`, `IProduct`, `useStore`.
- Produces: `FeaturedList` client component taking `{ products: SeeMoreProduct[] }` where `SeeMoreProduct = { id, slug, name, price, oldPrice, discount, rating, image, category, unit }`.

- [ ] **Step 1: Create the client list component**

```tsx
// app/items/see-more/featured-list.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBasket, Heart, ArrowLeft, SlidersHorizontal, Star } from "lucide-react";
import { useStore } from "@/lib/store";

export type SeeMoreProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  oldPrice: number | null;
  discount: string;
  rating: number | null;
  image: string;
  category: string;
  unit: string;
};

export default function FeaturedList({ products }: { products: SeeMoreProduct[] }) {
  const { addToCart, toggleFavourite, isFavourite } = useStore();
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const handleGoBack = () => {
    if (typeof window !== "undefined") window.history.back();
  };

  const toStoreProduct = (p: SeeMoreProduct) => ({
    id: p.slug,
    name: p.name,
    price: p.price,
    image: p.image,
    unit: p.unit,
    category: p.category,
  });

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-100 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-emerald-100 rounded-lg text-emerald-800 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Featured Today</h1>
              <p className="text-xs sm:text-sm text-emerald-700 font-medium mt-0.5">Today&apos;s best prices and fresh deals just for you</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center text-sm font-semibold text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>{filteredProducts.length} Deals Found</span>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none no-scrollbar">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                activeCategory === category
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                  : "bg-white text-gray-600 border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-emerald-100/50 shadow-sm">
            <p className="text-gray-500 font-medium">No items available right now in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="bg-white rounded-2xl border border-emerald-100/40 p-3 sm:p-4 relative flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                {product.discount && (
                  <div className="absolute top-3 left-3 z-10 bg-orange-500 text-white font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-md shadow-sm">
                    {product.discount}
                  </div>
                )}

                <button
                  onClick={(e) => {
                    stop(e);
                    toggleFavourite(toStoreProduct(product));
                  }}
                  className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-xs p-1.5 rounded-full shadow-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isFavourite(product.slug) ? "text-red-500 fill-red-500" : "text-gray-400"
                    }`}
                  />
                </button>

                <div className="w-full aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3 relative flex items-center justify-center">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    {product.rating !== null && (
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-[11px] font-bold text-gray-500">{product.rating}</span>
                      </div>
                    )}

                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2 leading-snug min-h-[40px] sm:min-h-[48px]">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium mt-0.5 mb-2">{product.unit}</p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between gap-1">
                    <div>
                      <p className="text-base sm:text-lg font-black text-emerald-700 leading-tight">
                        Rs. {product.price}
                      </p>
                      {product.oldPrice ? (
                        <p className="text-xs text-gray-400 line-through font-medium">
                          Rs. {product.oldPrice}
                        </p>
                      ) : null}
                    </div>

                    <button
                      onClick={(e) => {
                        stop(e);
                        addToCart(toStoreProduct(product));
                      }}
                      className="p-2 sm:px-3 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-sm shadow-emerald-100 flex items-center justify-center gap-1.5 font-medium text-xs sm:text-sm"
                      title="Add to basket"
                    >
                      <ShoppingBasket className="w-4 h-4" />
                      <span className="hidden sm:inline">Add</span>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `app/items/see-more/page.tsx` with a server component**

```tsx
// app/items/see-more/page.tsx
import { connectToDatabase } from "@/lib/mongodb";
import { Product, IProduct } from "@/models/Product";
import FeaturedList, { type SeeMoreProduct } from "./featured-list";

export const dynamic = "force-dynamic";

export default async function FeaturedTodayPage() {
  await connectToDatabase();
  const docs = await Product.find({}).sort({ order: 1 }).lean<IProduct[]>();
  const products: SeeMoreProduct[] = docs.map((p) => ({
    id: p.slug,
    slug: p.slug,
    name: p.name,
    price: p.price,
    oldPrice: p.oldPrice ?? null,
    discount: p.discount ?? "",
    rating: p.rating ?? null,
    image: p.image,
    category: p.category ?? "",
    unit: p.unit ?? "",
  }));

  return <FeaturedList products={products} />;
}
```

- [ ] **Step 3: Verify build + lint**

Run: `pnpm lint && pnpm build`
Expected: PASS, 0 warnings.

- [ ] **Step 4: Runtime verify**

Run:
```bash
curl -s http://localhost:3000/items/see-more | grep -o 'href="/product/dalda-banaspati-ghee"' | head -1
```
Expected: `href="/product/dalda-banaspati-ghee"` (see-more cards link to detail).

- [ ] **Step 5: Commit**

```bash
git add app/items/see-more/page.tsx app/items/see-more/featured-list.tsx
git commit -m "feat(products): see-more reads products from DB; cards link to detail"
```

---

## Self-Review

**Spec coverage:**
- Product model → Task 1 ✓
- Unified seed file + `pnpm seed` script (both categories + products) → Tasks 2–3 ✓
- Old categories seed route removed → Task 3 ✓
- `GET /api/products` (+ `?category`) → Task 4 ✓
- `/product/[slug]` server component + 404 + client actions → Task 5 ✓
- Cards clickable (home + see-more) with non-navigating action buttons → Tasks 6–7 ✓
- Home + see-more read from DB → Tasks 6–7 ✓
- slug-based URLs, store id = slug → Tasks 4–7 ✓
- Admin panel → out of scope (tech-debt #6) ✓

**Placeholder scan:** No TBD/TODO; every step has full code and concrete verify commands.

**Type consistency:** `IProduct` fields used identically across model (Task 1), seed (Task 2), API (Task 4), detail (Task 5), home (Task 6), see-more (Task 7). Store id = `slug` consistently. `FeaturedProduct` gains `slug` (Task 6) and home supplies it. `SeeMoreProduct` defined in Task 7 and produced by the page in the same task.

**Note on testing:** This project has no unit-test framework (per CLAUDE.md, validation is `pnpm build` + `pnpm lint` + runtime checks). Each task therefore verifies via lint, build, and explicit `curl`/`node` runtime checks rather than TDD unit tests.
