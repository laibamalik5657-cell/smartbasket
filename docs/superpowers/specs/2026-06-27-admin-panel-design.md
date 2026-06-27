# Admin & Rider Panel — Design Spec

Date: 2026-06-27
Status: Approved (ready for implementation planning)
Tech-debt item: #2 (Admin panel epic — this spec covers the **orders + riders** slice only)

## Summary

Add a seller/owner **admin panel** to view all orders and assign them to **riders**, plus a
**rider portal** where riders see the orders assigned to them and mark them delivered.

The seller is the site owner and acts as the admin. Riders are real, login-capable accounts
created by the admin. Authorization is role-based via the existing JWT.

Order lifecycle: **pending → assigned → delivered**, plus **cancelled**.

### Out of scope (deliberately deferred)

These stay in the broader admin epic (tech-debt #2), NOT this task:

- Product / category CRUD from the admin panel.
- Contact-message inbox (tech-debt #3).
- Rider editing / deletion (this spec is rider **create + list** only).
- Server-side token revocation (tech-debt #1) — unrelated; roles ride on the existing stateless JWT.

## Decisions (locked)

| Decision | Choice |
| --- | --- |
| Admin auth | `role` field on `User`, surfaced in the JWT. |
| Owner → admin | One-off `pnpm make-admin <email>` script flips an existing user's role to `admin`. |
| Riders | Real user accounts with `role: "rider"` and their own login + portal. |
| Rider onboarding | Admin creates rider accounts (name, email, temp password). No public rider signup. |
| Order workflow | `pending → assigned → delivered` (+ `cancelled`). |
| Status responsibilities | Admin: assign rider (pending→assigned) and cancel. Rider: mark delivered (assigned→delivered) for their own orders. |
| Re-assignment | Allowed while status is `assigned` (admin can swap riders). |

## 1. Roles (auth foundation)

- `User` gains `role: "user" | "admin" | "rider"`, default `"user"`, indexed.
- `AuthUser` (in `lib/auth.ts`) gains `role`. `signToken` includes it; `getAuthUser` returns it.
- `lib/decode-jwt.ts` (`userFromToken`) adds `role` so client UI can react (still client-safe decode,
  no signature verification — never trusted for authorization).
- `lib/auth.ts` adds two thin guards built on `getAuthUser`:
  - `requireAdmin(request): AuthUser | null` — non-null only if `role === "admin"`.
  - `requireRider(request): AuthUser | null` — non-null only if `role === "rider"`.
  - Routes call these and reply `401` (no/invalid token) or `403` (wrong role). No route
    re-implements Bearer parsing or role checks.
- **Owner promotion:** owner registers through the normal signup, then runs
  `pnpm make-admin <email>` (`scripts/make-admin.ts` via `tsx`, connects via `connectToDatabase()`,
  sets that user's `role` to `"admin"`). Single auth path; no way to self-grant admin from the UI.

### Token freshness note

Role lives in the JWT, which is stateless and lives up to 7 days. When the admin promotes a
user to rider (or `make-admin` promotes the owner), that user must **log out and back in** to get
a token carrying the new role. This is acceptable for an FYP and is documented for the user; it is
the same constraint already noted in tech-debt #1. (A future `tokenVersion`/revocation pass would
remove it.)

## 2. Data model changes

### `models/Order.ts`

- Add `status: "pending" | "assigned" | "delivered" | "cancelled"`, default `"pending"`, indexed.
- Add `riderId?: ObjectId` (`ref: "User"`), indexed.
- `toPlainOrder` additionally returns:
  - `status`
  - `riderId: string | null`
  - `riderName: string | null` (joined from the rider User for display; null when unassigned)
- Existing user-facing `my-orders` / `order-confirmation` can now display `status` (cheap win,
  no schema change beyond the above).

### `models/User.ts`

- Add `role` field only. Riders are `User` docs with `role: "rider"` — no separate collection.

## 3. API routes

### Admin — guarded by `requireAdmin`

- `GET /api/admin/orders?status=` — all orders, newest first, each with `riderName`. Optional
  `status` filter (validated against the enum).
- `PATCH /api/admin/orders/[id]` — body is one of:
  - `{ action: "assign", riderId }` — legal only from `pending` **or** `assigned` (re-assign);
    sets `riderId` and `status = "assigned"`. Validates that `riderId` is a real `role: "rider"` user.
  - `{ action: "cancel" }` — legal from `pending` or `assigned`; sets `status = "cancelled"`.
  - Illegal transitions (e.g. assigning a delivered/cancelled order) → `409 Conflict`.
- `GET /api/admin/riders` — list riders (`role: "rider"`): id, name, email.
- `POST /api/admin/riders` — create a rider `{ firstName, lastName, email, password }`:
  bcrypt-hash the password (cost 12, same as register), set `role: "rider"`. Duplicate email → `409`.

### Rider — guarded by `requireRider`

- `GET /api/rider/orders` — orders where `riderId === me`, statuses `assigned` + `delivered`,
  including customer `phone` + `address` (needed to deliver).
- `PATCH /api/rider/orders/[id]` — mark delivered. Server checks
  `status === "assigned" && riderId === me` → `delivered`; otherwise `403` (not yours) or
  `409` (wrong status).

### Existing `/api/orders`

Unchanged in behaviour; `GET` continues to be user-scoped. It now returns `status` via the
updated `toPlainOrder` so the shopper's my-orders view can show it.

## 4. Pages (App Router)

All admin/rider pages are `"use client"` leaves that fetch via the `useAuthGet()` Suspense helper
(`lib/use-api.ts`), wrapped in `<Suspense>` — consistent with `my-orders` / `order-confirmation`.

> **Authorization model:** client-side route guards (read `useAuthUser()`, redirect if the role
> is wrong) are **UX convenience only**. The API routes (`requireAdmin` / `requireRider`) are the
> real enforcement. A user hand-crafting requests still can't act outside their role.

- `/admin/orders` — table of all orders: short id, customer name, total, **status badge**,
  assigned rider, date. Row actions: assign-rider dropdown (riders from `GET /api/admin/riders`)
  and cancel. Optional status filter.
- `/admin/riders` — rider list + "Add rider" form (`firstName`, `lastName`, `email`, `password`).
- `/rider/orders` — the rider's assigned orders with customer **phone + address** and a
  "Mark delivered" button per order.
- **Navbar** (`components/Navbar.tsx`): via `useAuthUser()`, conditionally show an **Admin** link
  (role `admin`) or **My Deliveries** link (role `rider`).

## 5. Validation (Zod, `schema/index.ts`)

- `createRiderSchema` — `{ firstName, lastName, email, password }` (mirror `registerSchema` rules).
- `assignOrderSchema` — discriminated on `action`: `{ action: "assign", riderId }` |
  `{ action: "cancel" }`.
- `orderStatusQuerySchema` — optional `status` enum for the admin list filter.

Shared by both the client forms and the API routes, per existing convention.

## 6. Status transition rules (server-enforced, single source of truth)

```
pending   --assign(admin)-->  assigned
pending   --cancel(admin)-->  cancelled
assigned  --assign(admin)-->  assigned   (re-assign / swap rider)
assigned  --cancel(admin)-->  cancelled
assigned  --deliver(rider, own order)--> delivered
delivered --> (terminal)
cancelled --> (terminal)
```

Any transition not listed returns `409`. Rider acting on an order not assigned to them → `403`.

## Files touched (anticipated)

- `models/User.ts` — add `role`.
- `models/Order.ts` — add `status`, `riderId`; extend `toPlainOrder`.
- `lib/auth.ts` — `role` in `AuthUser`; `requireAdmin`, `requireRider`.
- `lib/decode-jwt.ts` — include `role`.
- `schema/index.ts` — `createRiderSchema`, `assignOrderSchema`, `orderStatusQuerySchema`.
- `app/api/admin/orders/route.ts`, `app/api/admin/orders/[id]/route.ts`
- `app/api/admin/riders/route.ts`
- `app/api/rider/orders/route.ts`, `app/api/rider/orders/[id]/route.ts`
- `app/admin/orders/page.tsx`, `app/admin/riders/page.tsx`, `app/rider/orders/page.tsx`
- `components/Navbar.tsx` — role-based links.
- `scripts/make-admin.ts` + `package.json` script `make-admin`.
- `app/my-orders/page.tsx` — show status badge (minor).

## Verification (no test framework — `pnpm build` + `pnpm lint` + manual)

1. `pnpm make-admin <owner-email>`, re-login → Admin link appears.
2. Admin creates a rider; rider logs in → My Deliveries link appears.
3. Shopper places an order → appears in `/admin/orders` as `pending`.
4. Admin assigns rider → status `assigned`, visible in `/rider/orders`.
5. Rider marks delivered → status `delivered`; admin sees it.
6. Negative: non-admin hits `/api/admin/*` → 403; rider delivers someone else's order → 403;
   assign a delivered order → 409.
