# Admin & Rider Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a role-based admin panel (view all orders, assign riders) and a rider portal (see assigned orders, mark delivered) to SmartBasket.

**Architecture:** Roles ride on the existing stateless JWT (`user | admin | rider`). New `/api/admin/*` and `/api/rider/*` routes enforce authorization server-side via `requireAdmin`/`requireRider` guards; client pages are `"use client"` leaves that fetch through the existing `useAuthGet()` Suspense helper and mutate via the shared axios instance with a Bearer header. Order lifecycle `pending → assigned → delivered (+ cancelled)` is enforced server-side.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript (strict), Mongoose, Zod, bcrypt, JWT (jsonwebtoken), Tailwind v4, shadcn/ui, axios. Package manager: pnpm.

## Global Constraints

- Package manager is **pnpm**; run everything from repo root.
- **No test framework** — validation is `pnpm lint` + `pnpm build` + manual checks. Do NOT add a test runner.
- **No `fetch` for API calls from the client** — use `@/lib/axios` (`apiClient`, baseURL `/api`).
- **Do NOT read `localStorage` in `useEffect`** (ESLint `react-hooks/set-state-in-effect` is an error). Reads go through `useSyncExternalStore` helpers (`useAuthUser`) or the Suspense helper (`useAuthGet`). `localStorage` writes/reads in event handlers are fine.
- Auth is a **localStorage JWT** read via `useAuthUser()`; mutations after success do a **full-page navigation/reload** (`window.location.assign(...)` / `.reload()` — method form, never assign to `.href`) so components re-read the token/data.
- Client-side role checks are **UX only**; the API routes are the real authorization boundary.
- bcrypt cost is **12** (`SALT_ROUNDS`), matching `register`.
- Mongoose for the DB layer; Zod for request validation. Models guard re-registration on hot reload.
- Role type literal used everywhere: `"user" | "admin" | "rider"`.

---

### Task 1: Roles through the auth layer

**Files:**
- Modify: `models/User.ts` (add `role`)
- Modify: `lib/store.tsx` (add `role` to the `User` interface)
- Modify: `lib/decode-jwt.ts` (add `role` to `JwtPayload` + `userFromToken`)
- Modify: `lib/auth.ts` (add `role` to `AuthUser`, add `requireAdmin`/`requireRider`)
- Modify: `app/api/auth/login/route.ts` (include `role` in the signed claims)

**Interfaces:**
- Produces: `AuthUser.role: "user" | "admin" | "rider"`; `requireAdmin(request): AuthUser | null`; `requireRider(request): AuthUser | null`; `IUser.role`; `User.role` (store type); `userFromToken` returns `role`.
- Consumes: existing `getAuthUser`, `signToken`.

- [ ] **Step 1: Add `role` to the User model**

In `models/User.ts`, add to the `IUser` interface (after `passwordHash`):
```ts
  role: "user" | "admin" | "rider";
```
And to the schema (after `passwordHash` field):
```ts
    role: {
      type: String,
      enum: ["user", "admin", "rider"],
      default: "user",
      index: true,
    },
```

- [ ] **Step 2: Add `role` to the store `User` type**

In `lib/store.tsx`, find the `User` interface (id/email/firstName/lastName) and add:
```ts
  role: "user" | "admin" | "rider";
```

- [ ] **Step 3: Add `role` to the client JWT decode**

In `lib/decode-jwt.ts`, add `role?: "user" | "admin" | "rider";` to `JwtPayload`, and in `userFromToken` include it on the returned object with a default:
```ts
  return {
    id: payload.id,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    role: payload.role ?? "user",
  };
```

- [ ] **Step 4: Add `role` to `AuthUser` and add role guards**

In `lib/auth.ts`, add `role: "user" | "admin" | "rider";` to the `AuthUser` interface, then append:
```ts
/** Like getAuthUser, but only returns the user when they are an admin. */
export function requireAdmin(request: Request): AuthUser | null {
  const user = getAuthUser(request);
  return user && user.role === "admin" ? user : null;
}

/** Like getAuthUser, but only returns the user when they are a rider. */
export function requireRider(request: Request): AuthUser | null {
  const user = getAuthUser(request);
  return user && user.role === "rider" ? user : null;
}
```

- [ ] **Step 5: Include `role` in the login token**

In `app/api/auth/login/route.ts`, change the `userInfo` object to include the role (so `signToken` puts it in the claims):
```ts
    const userInfo = {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role ?? "user",
    };
```

- [ ] **Step 6: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: no errors (the existing `<img>` warnings are fine).

- [ ] **Step 7: Manual check**

Run `pnpm dev`. Log in as an existing user. In the browser console:
```js
JSON.parse(atob(localStorage.getItem("smartbasket:token").split(".")[1]))
```
Expected: payload now contains `"role": "user"`.

- [ ] **Step 8: Commit**

```bash
git add models/User.ts lib/store.tsx lib/decode-jwt.ts lib/auth.ts app/api/auth/login/route.ts
git commit -m "feat(auth): add role claim (user/admin/rider) + requireAdmin/requireRider guards"
```

---

### Task 2: `pnpm make-admin <email>` script

**Files:**
- Create: `scripts/make-admin.ts`
- Modify: `package.json` (add `make-admin` script)

**Interfaces:**
- Consumes: `connectToDatabase`, `User` model.
- Produces: CLI `pnpm make-admin <email>` that sets a user's `role` to `admin`.

- [ ] **Step 1: Write the script**

Create `scripts/make-admin.ts`. Match `scripts/seed.ts`'s conventions exactly: **relative** imports (not the `@/` alias) and env loaded by Node's `--env-file` (no `dotenv`):
```ts
import mongoose from "mongoose";
import { connectToDatabase } from "../lib/mongodb";
import { User } from "../models/User";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: pnpm make-admin <email>");
    process.exit(1);
  }

  await connectToDatabase();
  const result = await User.updateOne({ email }, { $set: { role: "admin" } });

  if (result.matchedCount === 0) {
    console.error(`No user found with email "${email}". Register that account first.`);
  } else {
    console.log(`✓ "${email}" is now an admin. They must log out and back in to refresh their token.`);
  }

  await mongoose.disconnect();
  process.exit(result.matchedCount === 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Add the package.json script**

In `package.json` `"scripts"`, add (next to `"seed"`), mirroring the existing `seed` invocation exactly:
```json
    "make-admin": "node --env-file=.env --import tsx scripts/make-admin.ts",
```

- [ ] **Step 3: Run it (manual check)**

Ensure MongoDB is running and you have a registered account (e.g. the owner's email).
Run: `pnpm make-admin owner@example.com`
Expected: `✓ "owner@example.com" is now an admin...`
Then log out and back in; the token payload `role` is now `"admin"` (check as in Task 1 Step 7).

- [ ] **Step 4: Commit**

```bash
git add scripts/make-admin.ts package.json
git commit -m "feat(admin): pnpm make-admin <email> to promote an account to admin"
```

---

### Task 3: Order status + rider on the model

**Files:**
- Modify: `models/Order.ts`

**Interfaces:**
- Produces: `IOrder.status: "pending" | "assigned" | "delivered" | "cancelled"`; `IOrder.riderId?: ObjectId`; `PlainOrder.status`; `PlainOrder.riderId: string | null`. `toPlainOrder` defaults missing status to `"pending"`.
- Consumes: nothing new.

- [ ] **Step 1: Extend `IOrder` and the schema**

In `models/Order.ts`, add to the `IOrder` interface (after `payment`):
```ts
  status: "pending" | "assigned" | "delivered" | "cancelled";
  riderId?: mongoose.Types.ObjectId;
```
Add to `OrderSchema` fields (after `payment`):
```ts
    status: {
      type: String,
      enum: ["pending", "assigned", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    riderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
```

- [ ] **Step 2: Extend `PlainOrder` and `toPlainOrder`**

In the `PlainOrder` interface add (after `payment`):
```ts
  status: "pending" | "assigned" | "delivered" | "cancelled";
  riderId: string | null;
```
In `toPlainOrder`, add to the returned object (after `payment`):
```ts
    status: o.status ?? "pending",
    riderId: o.riderId ? o.riderId.toString() : null,
```

- [ ] **Step 3: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add models/Order.ts
git commit -m "feat(orders): add status + riderId to Order, surfaced in toPlainOrder"
```

---

### Task 4: Zod schemas for rider creation + order actions

**Files:**
- Modify: `schema/index.ts`

**Interfaces:**
- Produces: `createRiderSchema` (`{ firstName, lastName, email, password }`), `assignOrderSchema` (`{ action: "assign", riderId }` | `{ action: "cancel" }`), `orderStatusQuerySchema` (`{ status?: "pending"|"assigned"|"delivered"|"cancelled" }`), plus inferred types.
- Consumes: existing `emailSchema`, `passwordSchema`.

- [ ] **Step 1: Append the schemas**

At the end of `schema/index.ts`:
```ts
export const createRiderSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: emailSchema,
  password: passwordSchema,
});

export type CreateRiderInput = z.infer<typeof createRiderSchema>;

// Admin action on an order: assign a rider (pending|assigned) or cancel (pending|assigned).
export const assignOrderSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("assign"),
    riderId: z.string().min(1, "A rider must be selected."),
  }),
  z.object({ action: z.literal("cancel") }),
]);

export type AssignOrderInput = z.infer<typeof assignOrderSchema>;

export const orderStatusEnum = z.enum([
  "pending",
  "assigned",
  "delivered",
  "cancelled",
]);

export const orderStatusQuerySchema = z.object({
  status: orderStatusEnum.optional(),
});
```

- [ ] **Step 2: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add schema/index.ts
git commit -m "feat(schema): createRiderSchema, assignOrderSchema, orderStatusQuerySchema"
```

---

### Task 5: Admin riders API

**Files:**
- Create: `app/api/admin/riders/route.ts`

**Interfaces:**
- Consumes: `requireAdmin`, `connectToDatabase`, `User`, `createRiderSchema`, bcrypt.
- Produces: `GET /api/admin/riders` → `{ success, riders: { id, firstName, lastName, email }[] }`; `POST /api/admin/riders` → `201 { success, rider }`.

- [ ] **Step 1: Write the route**

Create `app/api/admin/riders/route.ts`:
```ts
import bcrypt from "bcrypt";
import { connectToDatabase } from "@/lib/mongodb";
import { User, IUser } from "@/models/User";
import { requireAdmin } from "@/lib/auth";
import { createRiderSchema } from "@/schema";

const SALT_ROUNDS = 12;

// GET /api/admin/riders — list all rider accounts.
export async function GET(request: Request) {
  if (!requireAdmin(request)) {
    return Response.json({ success: false, message: "Forbidden." }, { status: 403 });
  }
  try {
    await connectToDatabase();
    const riders = await User.find({ role: "rider" })
      .sort({ createdAt: -1 })
      .lean<IUser[]>();
    return Response.json(
      {
        success: true,
        riders: riders.map((r) => ({
          id: r._id.toString(),
          firstName: r.firstName,
          lastName: r.lastName,
          email: r.email,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/admin/riders failed", error);
    return Response.json({ success: false, message: "Failed to load riders." }, { status: 500 });
  }
}

// POST /api/admin/riders — create a rider account.
export async function POST(request: Request) {
  if (!requireAdmin(request)) {
    return Response.json({ success: false, message: "Forbidden." }, { status: 403 });
  }
  await connectToDatabase();
  try {
    const body = await request.json();
    const result = createRiderSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return Response.json(
        { success: false, message: firstError?.message ?? "Invalid input." },
        { status: 400 },
      );
    }

    const { firstName, lastName, email, password } = result.data;
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail }).lean<IUser>();
    if (existing) {
      return Response.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const rider = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
      role: "rider",
    });

    return Response.json(
      {
        success: true,
        rider: {
          id: rider._id.toString(),
          firstName: rider.firstName,
          lastName: rider.lastName,
          email: rider.email,
        },
      },
      { status: 201 },
    );
  } catch {
    return Response.json({ success: false, message: "Invalid request body." }, { status: 400 });
  }
}
```

- [ ] **Step 2: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: no errors.

- [ ] **Step 3: Manual check (curl)**

With dev running and an admin token in `$TOKEN`:
```bash
curl -s -X POST localhost:3000/api/admin/riders -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"firstName":"Riz","lastName":"Khan","email":"rider1@sb.com","password":"password123"}'
curl -s localhost:3000/api/admin/riders -H "Authorization: Bearer $TOKEN"
```
Expected: create returns `201` with the rider; list includes `rider1@sb.com`. A non-admin token returns `403`.

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/riders/route.ts
git commit -m "feat(api): admin riders list + create (role-guarded)"
```

---

### Task 6: Admin orders API (list + assign/cancel)

**Files:**
- Create: `app/api/admin/orders/route.ts`
- Create: `app/api/admin/orders/[id]/route.ts`

**Interfaces:**
- Consumes: `requireAdmin`, `connectToDatabase`, `Order`, `IOrder`, `toPlainOrder`, `User`, `assignOrderSchema`, `orderStatusQuerySchema`.
- Produces: `GET /api/admin/orders?status=` → `{ success, orders: (PlainOrder & { riderName: string | null })[] }`; `PATCH /api/admin/orders/[id]` → `{ success, order }`.

- [ ] **Step 1: Write the list route**

Create `app/api/admin/orders/route.ts`:
```ts
import { connectToDatabase } from "@/lib/mongodb";
import { Order, IOrder, toPlainOrder } from "@/models/Order";
import { User, IUser } from "@/models/User";
import { requireAdmin } from "@/lib/auth";
import { orderStatusQuerySchema } from "@/schema";

// GET /api/admin/orders?status= — all orders, newest first, with rider name.
export async function GET(request: Request) {
  if (!requireAdmin(request)) {
    return Response.json({ success: false, message: "Forbidden." }, { status: 403 });
  }
  try {
    await connectToDatabase();

    const url = new URL(request.url);
    const parsed = orderStatusQuerySchema.safeParse({
      status: url.searchParams.get("status") ?? undefined,
    });
    const filter = parsed.success && parsed.data.status ? { status: parsed.data.status } : {};

    const docs = await Order.find(filter).sort({ createdAt: -1 }).lean<IOrder[]>();

    // Join rider names in one query.
    const riderIds = [...new Set(docs.filter((o) => o.riderId).map((o) => o.riderId!.toString()))];
    const riders = riderIds.length
      ? await User.find({ _id: { $in: riderIds } }).lean<IUser[]>()
      : [];
    const nameById = new Map(
      riders.map((r) => [r._id.toString(), `${r.firstName} ${r.lastName}`.trim()]),
    );

    const orders = docs.map((o) => {
      const plain = toPlainOrder(o);
      return { ...plain, riderName: plain.riderId ? nameById.get(plain.riderId) ?? null : null };
    });

    return Response.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/orders failed", error);
    return Response.json({ success: false, message: "Failed to load orders." }, { status: 500 });
  }
}
```

- [ ] **Step 2: Write the action route**

Create `app/api/admin/orders/[id]/route.ts`:
```ts
import { connectToDatabase } from "@/lib/mongodb";
import { Order, IOrder, toPlainOrder } from "@/models/Order";
import { User, IUser } from "@/models/User";
import { requireAdmin } from "@/lib/auth";
import { assignOrderSchema } from "@/schema";

// PATCH /api/admin/orders/[id] — assign a rider or cancel.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requireAdmin(request)) {
    return Response.json({ success: false, message: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  await connectToDatabase();

  try {
    const body = await request.json();
    const result = assignOrderSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return Response.json(
        { success: false, message: firstError?.message ?? "Invalid input." },
        { status: 400 },
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return Response.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    if (result.data.action === "assign") {
      // Legal from pending or assigned (re-assign / swap rider).
      if (order.status !== "pending" && order.status !== "assigned") {
        return Response.json(
          { success: false, message: `Cannot assign an order that is ${order.status}.` },
          { status: 409 },
        );
      }
      const rider = await User.findOne({
        _id: result.data.riderId,
        role: "rider",
      }).lean<IUser>();
      if (!rider) {
        return Response.json({ success: false, message: "Rider not found." }, { status: 400 });
      }
      order.riderId = rider._id;
      order.status = "assigned";
    } else {
      // cancel — legal from pending or assigned.
      if (order.status !== "pending" && order.status !== "assigned") {
        return Response.json(
          { success: false, message: `Cannot cancel an order that is ${order.status}.` },
          { status: 409 },
        );
      }
      order.status = "cancelled";
    }

    await order.save();
    return Response.json(
      { success: true, order: toPlainOrder(order as unknown as IOrder) },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH /api/admin/orders/[id] failed", error);
    return Response.json({ success: false, message: "Invalid request." }, { status: 400 });
  }
}
```

- [ ] **Step 3: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: no errors.

- [ ] **Step 4: Manual check (curl)**

With an admin token in `$TOKEN`, a placed order id in `$OID`, and a rider id in `$RID`:
```bash
curl -s localhost:3000/api/admin/orders -H "Authorization: Bearer $TOKEN"
curl -s -X PATCH localhost:3000/api/admin/orders/$OID -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d "{\"action\":\"assign\",\"riderId\":\"$RID\"}"
```
Expected: list shows orders with `status`/`riderName`; assign returns the order with `status:"assigned"` and `riderId` set. Assigning a delivered/cancelled order → `409`.

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/orders/route.ts app/api/admin/orders/[id]/route.ts
git commit -m "feat(api): admin orders list + assign/cancel with server-enforced transitions"
```

---

### Task 7: Rider orders API (list + deliver)

**Files:**
- Create: `app/api/rider/orders/route.ts`
- Create: `app/api/rider/orders/[id]/route.ts`

**Interfaces:**
- Consumes: `requireRider`, `connectToDatabase`, `Order`, `IOrder`, `toPlainOrder`.
- Produces: `GET /api/rider/orders` → `{ success, orders: PlainOrder[] }` (assigned + delivered, scoped to caller); `PATCH /api/rider/orders/[id]` → `{ success, order }` (assigned→delivered, own order only).

- [ ] **Step 1: Write the list route**

Create `app/api/rider/orders/route.ts`:
```ts
import { connectToDatabase } from "@/lib/mongodb";
import { Order, IOrder, toPlainOrder } from "@/models/Order";
import { requireRider } from "@/lib/auth";

// GET /api/rider/orders — orders assigned to the calling rider.
export async function GET(request: Request) {
  const rider = requireRider(request);
  if (!rider) {
    return Response.json({ success: false, message: "Forbidden." }, { status: 403 });
  }
  try {
    await connectToDatabase();
    const docs = await Order.find({
      riderId: rider.id,
      status: { $in: ["assigned", "delivered"] },
    })
      .sort({ createdAt: -1 })
      .lean<IOrder[]>();
    return Response.json({ success: true, orders: docs.map(toPlainOrder) }, { status: 200 });
  } catch (error) {
    console.error("GET /api/rider/orders failed", error);
    return Response.json({ success: false, message: "Failed to load orders." }, { status: 500 });
  }
}
```

- [ ] **Step 2: Write the deliver route**

Create `app/api/rider/orders/[id]/route.ts`:
```ts
import { connectToDatabase } from "@/lib/mongodb";
import { Order, IOrder, toPlainOrder } from "@/models/Order";
import { requireRider } from "@/lib/auth";

// PATCH /api/rider/orders/[id] — mark the rider's own assigned order delivered.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const rider = requireRider(request);
  if (!rider) {
    return Response.json({ success: false, message: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  await connectToDatabase();

  try {
    const order = await Order.findById(id);
    if (!order) {
      return Response.json({ success: false, message: "Order not found." }, { status: 404 });
    }
    if (!order.riderId || order.riderId.toString() !== rider.id) {
      return Response.json({ success: false, message: "Not your order." }, { status: 403 });
    }
    if (order.status !== "assigned") {
      return Response.json(
        { success: false, message: `Cannot deliver an order that is ${order.status}.` },
        { status: 409 },
      );
    }

    order.status = "delivered";
    await order.save();
    return Response.json(
      { success: true, order: toPlainOrder(order as unknown as IOrder) },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH /api/rider/orders/[id] failed", error);
    return Response.json({ success: false, message: "Invalid request." }, { status: 400 });
  }
}
```

- [ ] **Step 3: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: no errors.

- [ ] **Step 4: Manual check (curl)**

With a rider token in `$RTOKEN` and an order assigned to that rider in `$OID`:
```bash
curl -s localhost:3000/api/rider/orders -H "Authorization: Bearer $RTOKEN"
curl -s -X PATCH localhost:3000/api/rider/orders/$OID -H "Authorization: Bearer $RTOKEN"
```
Expected: list shows the assigned order; PATCH returns `status:"delivered"`. Delivering an order not assigned to this rider → `403`; a non-rider token → `403`.

- [ ] **Step 5: Commit**

```bash
git add app/api/rider/orders/route.ts app/api/rider/orders/[id]/route.ts
git commit -m "feat(api): rider orders list + mark-delivered (own assigned orders only)"
```

---

### Task 8: Role-based Navbar links

**Files:**
- Modify: `components/Navbar.tsx`

**Interfaces:**
- Consumes: `useAuthUser()` (now returns `role`).
- Produces: an **Admin** link when `role === "admin"`, a **My Deliveries** link when `role === "rider"`.

- [ ] **Step 1: Add the conditional links**

In `components/Navbar.tsx`, where the signed-in user's menu/links render (near the `user` from `useAuthUser()`), add role-gated links. Match the existing link styling; example using the existing `Link` import:
```tsx
{user?.role === "admin" && (
  <Link href="/admin/orders" className="text-sm font-medium text-foreground hover:text-brand">
    Admin
  </Link>
)}
{user?.role === "rider" && (
  <Link href="/rider/orders" className="text-sm font-medium text-foreground hover:text-brand">
    My Deliveries
  </Link>
)}
```
Place these alongside the other authenticated nav items (e.g. near the My Orders / account dropdown). Reuse the existing class names already used for nav links in this file rather than the example classes if they differ.

- [ ] **Step 2: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: no errors.

- [ ] **Step 3: Manual check**

As an admin → "Admin" link visible and routes to `/admin/orders`. As a rider → "My Deliveries" visible. As a normal user → neither.

- [ ] **Step 4: Commit**

```bash
git add components/Navbar.tsx
git commit -m "feat(nav): role-based Admin / My Deliveries links"
```

---

### Task 9: Admin orders page

**Files:**
- Create: `app/admin/orders/page.tsx`

**Interfaces:**
- Consumes: `useAuthUser`, `useAuthGet`, `apiClient`, `getToken`. Reads `GET /api/admin/orders` and `GET /api/admin/riders`; mutates via `PATCH /api/admin/orders/[id]`.

- [ ] **Step 1: Write the page**

Create `app/admin/orders/page.tsx`:
```tsx
"use client";

import { Suspense } from "react";
import Link from "next/link";
import apiClient from "@/lib/axios";
import { getToken } from "@/lib/utils";
import { useAuthUser } from "@/lib/use-auth";
import { useAuthGet } from "@/lib/use-api";

type AdminOrder = {
  id: string;
  total: number;
  status: "pending" | "assigned" | "delivered" | "cancelled";
  riderId: string | null;
  riderName: string | null;
  createdAt: string;
  customer: { name: string };
};
type Rider = { id: string; firstName: string; lastName: string };

const STATUS_STYLES: Record<AdminOrder["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  assigned: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrdersPage() {
  const user = useAuthUser();

  if (user && user.role !== "admin") {
    return <Denied />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">All Orders</h1>
        <Suspense fallback={<p className="mt-8 text-muted-foreground">Loading orders…</p>}>
          <OrdersTable />
        </Suspense>
      </div>
    </div>
  );
}

function Denied() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto text-center bg-card rounded-2xl border border-border p-12">
        <h1 className="text-2xl font-bold text-foreground">Admins only</h1>
        <p className="mt-2 text-muted-foreground">You do not have access to this page.</p>
        <Link href="/" className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark">
          Go home
        </Link>
      </div>
    </div>
  );
}

async function patchOrder(id: string, body: object) {
  await apiClient.patch(`/admin/orders/${id}`, body, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  window.location.reload();
}

function OrdersTable() {
  const ordersData = useAuthGet<{ orders: AdminOrder[] }>("/admin/orders");
  const ridersData = useAuthGet<{ riders: Rider[] }>("/admin/riders");
  const orders = ordersData?.orders ?? [];
  const riders = ridersData?.riders ?? [];

  if (orders.length === 0) {
    return <p className="mt-8 text-muted-foreground">No orders yet.</p>;
  }

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full text-sm bg-card rounded-2xl border border-border">
        <thead>
          <tr className="text-left text-muted-foreground border-b border-border">
            <th className="p-3">Order</th>
            <th className="p-3">Customer</th>
            <th className="p-3">Total</th>
            <th className="p-3">Status</th>
            <th className="p-3">Rider</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-border last:border-0">
              <td className="p-3 font-mono text-xs">{o.id.slice(-6)}</td>
              <td className="p-3">{o.customer.name}</td>
              <td className="p-3">Rs. {o.total}</td>
              <td className="p-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[o.status]}`}>
                  {o.status}
                </span>
              </td>
              <td className="p-3">{o.riderName ?? "—"}</td>
              <td className="p-3">
                {(o.status === "pending" || o.status === "assigned") ? (
                  <div className="flex items-center gap-2">
                    <select
                      defaultValue={o.riderId ?? ""}
                      onChange={(e) => {
                        if (e.target.value) patchOrder(o.id, { action: "assign", riderId: e.target.value });
                      }}
                      className="rounded border border-border px-2 py-1 text-xs"
                    >
                      <option value="">Assign rider…</option>
                      {riders.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.firstName} {r.lastName}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => patchOrder(o.id, { action: "cancel" })}
                      className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

> Note: `useAuthUser()` returns `null` during SSR/first paint, so the `role !== "admin"` guard only fires once the token is read. This is UX only — the API enforces access.

- [ ] **Step 2: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: no errors.

- [ ] **Step 3: Manual check**

As admin, open `/admin/orders`: table lists orders. Assign a rider from the dropdown → page reloads, status shows `assigned` and the rider name. Cancel → status `cancelled`. As a normal user, the page shows "Admins only".

- [ ] **Step 4: Commit**

```bash
git add app/admin/orders/page.tsx
git commit -m "feat(admin): orders table with rider assignment + cancel"
```

---

### Task 10: Admin riders page

**Files:**
- Create: `app/admin/riders/page.tsx`

**Interfaces:**
- Consumes: `useAuthUser`, `useAuthGet`, `apiClient`, `getToken`, `createRiderSchema` (client-side validation optional). Reads `GET /api/admin/riders`; mutates via `POST /api/admin/riders`.

- [ ] **Step 1: Write the page**

Create `app/admin/riders/page.tsx`:
```tsx
"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/axios";
import { getToken } from "@/lib/utils";
import { useAuthUser } from "@/lib/use-auth";
import { useAuthGet } from "@/lib/use-api";

type Rider = { id: string; firstName: string; lastName: string; email: string };

export default function AdminRidersPage() {
  const user = useAuthUser();
  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center bg-card rounded-2xl border border-border p-12">
          <h1 className="text-2xl font-bold text-foreground">Admins only</h1>
          <Link href="/" className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">Riders</h1>
        <AddRiderForm />
        <Suspense fallback={<p className="mt-8 text-muted-foreground">Loading riders…</p>}>
          <RidersList />
        </Suspense>
      </div>
    </div>
  );
}

function AddRiderForm() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await apiClient.post("/admin/riders", form, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      window.location.reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to add rider.";
      setError(message);
      setSubmitting(false);
    }
  }

  const field = (key: keyof typeof form, label: string, type = "text") => (
    <label className="block">
      <span className="text-sm text-muted-foreground">{label}</span>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
        required
      />
    </label>
  );

  return (
    <form onSubmit={onSubmit} className="mt-6 bg-card rounded-2xl border border-border p-5 space-y-3">
      <h2 className="font-semibold text-foreground">Add a rider</h2>
      <div className="grid grid-cols-2 gap-3">
        {field("firstName", "First name")}
        {field("lastName", "Last name")}
      </div>
      {field("email", "Email", "email")}
      {field("password", "Temp password", "password")}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {submitting ? "Adding…" : "Add rider"}
      </button>
    </form>
  );
}

function RidersList() {
  const data = useAuthGet<{ riders: Rider[] }>("/admin/riders");
  const riders = data?.riders ?? [];
  return (
    <div className="mt-6 space-y-2">
      {riders.length === 0 ? (
        <p className="text-muted-foreground">No riders yet.</p>
      ) : (
        riders.map((r) => (
          <div key={r.id} className="bg-card rounded-xl border border-border p-4 flex justify-between">
            <span className="font-medium text-foreground">{r.firstName} {r.lastName}</span>
            <span className="text-sm text-muted-foreground">{r.email}</span>
          </div>
        ))
      )}
    </div>
  );
}
```

- [ ] **Step 2: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: no errors.

- [ ] **Step 3: Manual check**

As admin, open `/admin/riders`: add a rider → page reloads, rider appears in the list. Duplicate email → inline error.

- [ ] **Step 4: Commit**

```bash
git add app/admin/riders/page.tsx
git commit -m "feat(admin): riders page with add-rider form + list"
```

---

### Task 11: Rider orders page

**Files:**
- Create: `app/rider/orders/page.tsx`

**Interfaces:**
- Consumes: `useAuthUser`, `useAuthGet`, `apiClient`, `getToken`. Reads `GET /api/rider/orders`; mutates via `PATCH /api/rider/orders/[id]`.

- [ ] **Step 1: Write the page**

Create `app/rider/orders/page.tsx`:
```tsx
"use client";

import { Suspense } from "react";
import Link from "next/link";
import apiClient from "@/lib/axios";
import { getToken } from "@/lib/utils";
import { useAuthUser } from "@/lib/use-auth";
import { useAuthGet } from "@/lib/use-api";

type RiderOrder = {
  id: string;
  total: number;
  status: "pending" | "assigned" | "delivered" | "cancelled";
  createdAt: string;
  customer: { name: string; phone: string; city: string; area: string; address: string };
};

export default function RiderOrdersPage() {
  const user = useAuthUser();
  if (user && user.role !== "rider") {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center bg-card rounded-2xl border border-border p-12">
          <h1 className="text-2xl font-bold text-foreground">Riders only</h1>
          <Link href="/" className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">My Deliveries</h1>
        <Suspense fallback={<p className="mt-8 text-muted-foreground">Loading deliveries…</p>}>
          <DeliveriesList />
        </Suspense>
      </div>
    </div>
  );
}

async function markDelivered(id: string) {
  await apiClient.patch(`/rider/orders/${id}`, {}, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  window.location.reload();
}

function DeliveriesList() {
  const data = useAuthGet<{ orders: RiderOrder[] }>("/rider/orders");
  const orders = data?.orders ?? [];

  if (orders.length === 0) {
    return <p className="mt-8 text-muted-foreground">No deliveries assigned to you.</p>;
  }

  return (
    <div className="mt-6 space-y-4">
      {orders.map((o) => (
        <div key={o.id} className="bg-card rounded-2xl border border-border p-5">
          <div className="flex justify-between">
            <span className="font-medium text-foreground">{o.customer.name}</span>
            <span className="font-bold text-foreground">Rs. {o.total}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{o.customer.phone}</p>
          <p className="text-sm text-muted-foreground">
            {o.customer.address}, {o.customer.area}, {o.customer.city}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Status: {o.status}</span>
            {o.status === "assigned" && (
              <button
                onClick={() => markDelivered(o.id)}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Mark delivered
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: no errors.

- [ ] **Step 3: Manual check**

Log in as the rider (after the admin assigned them an order). `/rider/orders` lists the order with customer phone + address. "Mark delivered" → reloads, status `delivered`, button gone.

- [ ] **Step 4: Commit**

```bash
git add app/rider/orders/page.tsx
git commit -m "feat(rider): deliveries page with mark-delivered"
```

---

### Task 12: Show order status on the shopper's My Orders

**Files:**
- Modify: `app/my-orders/page.tsx`

**Interfaces:**
- Consumes: the now-present `order.status` on the user-facing order objects.

- [ ] **Step 1: Add a status badge to the order card**

In `app/my-orders/page.tsx`, extend the `Order` rows. The store `Order` type may not yet include `status`; reference it via a local widening. In `OrdersList`, change the per-order card to show the status. Add near the top of the card (inside the first `flex` row, after the order id span):
```tsx
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-700">
                  {(order as { status?: string }).status ?? "pending"}
                </span>
```

> Rationale for the cast: `lib/store`'s `Order` type doesn't declare `status`. Rather than broaden that shared type for a cosmetic badge, read it defensively. (If a later task adds `status` to the store `Order` type, drop the cast.)

- [ ] **Step 2: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: no errors.

- [ ] **Step 3: Manual check**

As a shopper with orders, `/my-orders` shows a status badge per order; an assigned/delivered order reflects the admin/rider actions.

- [ ] **Step 4: Commit**

```bash
git add app/my-orders/page.tsx
git commit -m "feat(orders): show order status badge on My Orders"
```

---

## End-to-end verification (after all tasks)

1. Register the owner account; `pnpm make-admin <owner-email>`; log out/in → **Admin** link appears.
2. `/admin/riders` → add a rider; log in as that rider → **My Deliveries** link appears.
3. As a shopper, place an order → it appears in `/admin/orders` as `pending`.
4. Admin assigns the rider → `assigned`; the order shows in `/rider/orders`.
5. Rider marks delivered → `delivered`; admin list and shopper `/my-orders` reflect it.
6. Negatives: non-admin → `/api/admin/*` returns 403; rider delivering another rider's order → 403; assigning a delivered order → 409.
7. Final: `pnpm lint && pnpm build` clean.

## Notes / known constraints carried from the spec

- **Token freshness:** promoting a user to admin/rider requires that user to log out and back in (stateless 7-day JWT). Documented; acceptable for an FYP.
- **Out of scope:** product/category CRUD, contact inbox (tech-debt #2/#3), rider edit/delete, server-side revocation (tech-debt #1).
