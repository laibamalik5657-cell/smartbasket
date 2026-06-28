# Order Tracking + Live Delivery Map — Design Spec

Date: 2026-06-28
Status: Approved (ready for implementation planning)
Builds on: the admin & rider panel (2026-06-27-admin-panel-design.md)

## Summary

Turn the static order-confirmation page into a **live order tracker**: a status stepper
(Placed → Packing → On the way → Delivered), a heuristic **ETA**, and a **simulated live
delivery map** (Leaflet + OpenStreetMap) where a rider marker animates from the store to the
delivery area once the order is picked up. Adds one order status (`out_for_delivery`) and a
rider "Picked up" action.

This is a **convincing demo**, not real logistics: no GPS, no rider location reporting, no
routing API, no websockets, no stored coordinates. The rider movement is simulated client-side.

### Decisions (locked)

| Decision | Choice |
| --- | --- |
| Rider map fidelity | Simulated — Leaflet + free OSM tiles, animated marker. No real GPS. |
| ETA | Heuristic, computed client-side (no routing API). |
| Lifecycle | `pending → assigned → out_for_delivery → delivered` (+ `cancelled`). |
| Admin "accept" | Assigning a rider *is* acceptance (no separate Accept action). |
| Map library | **Vanilla `leaflet`** in a client-only component (not `react-leaflet`, to avoid React 19 peer-dep friction). |
| Live updates | Confirmation page **polls** `/api/orders/[id]` every ~10s; stops at a terminal status. |

### Out of scope

Real GPS / rider location reporting, geocoding services, routing/traffic APIs, websockets/SSE,
persisted coordinates, multi-rider dispatch optimization.

## 1. Lifecycle & data model

### `models/Order.ts`

- Extend `status` enum to: `"pending" | "assigned" | "out_for_delivery" | "delivered" | "cancelled"`.
- Add `outForDeliveryAt?: Date` — set when the rider picks the order up; drives the ETA countdown.
- `toPlainOrder` additionally returns `outForDeliveryAt: string | null` (ISO or null). `status`
  already surfaced.

Customer-facing labels (display only, in `lib/tracking.ts`): `pending` → "Packing your order",
`assigned` → "Rider assigned", `out_for_delivery` → "On the way", `delivered` → "Delivered",
`cancelled` → "Cancelled".

## 2. Transitions (server-enforced)

```
pending          --assign(admin)-->        assigned        (assigning = accepting)
pending|assigned --cancel(admin)-->         cancelled
assigned         --pick up(rider, own)-->   out_for_delivery   (stamps outForDeliveryAt = now)
out_for_delivery --deliver(rider, own)-->   delivered
delivered, cancelled  --> terminal
```

- **Admin** (`/api/admin/orders/[id]`): unchanged — assign (pending|assigned→assigned), cancel
  (pending|assigned→cancelled). Admin cannot cancel once `out_for_delivery` (rider-driven from
  there).
- **Rider** (`/api/rider/orders/[id]` PATCH): now a small state machine driven by a request body.
  New Zod `riderOrderUpdateSchema = { status: "out_for_delivery" | "delivered" }`. Legal:
  `assigned → out_for_delivery` (sets `outForDeliveryAt`) and `out_for_delivery → delivered`.
  Any other → 409. Own-order (`riderId === caller.id`) + role checks unchanged (403 otherwise),
  404 if not found.
- **Rider list** (`GET /api/rider/orders`): status filter becomes
  `{ $in: ["assigned", "out_for_delivery", "delivered"] }` so picked-up orders still show.
- **Customer** (`GET /api/orders/[id]`): unchanged handler; returns the new fields via
  `toPlainOrder`.

## 3. ETA (heuristic, client-side) — `lib/tracking.ts`

Pure functions, no I/O:

- `statusLabel(status)` → the customer-facing label above.
- `etaText(order, now)`:
  - `pending` → "Packing · dispatching in ~10 min"
  - `assigned` → "Rider assigned · picking up shortly"
  - `out_for_delivery` → "Arriving in ~N min", `N = max(1, round(DELIVERY_MINUTES − minutesSince(outForDeliveryAt, now)))` with `DELIVERY_MINUTES = 25`; when N hits 0 → "Arriving any moment"
  - `delivered` → "Delivered"
  - `cancelled` → "Order cancelled"
- `deliveryProgress(order, now)` → `0..1` fraction along the route for `out_for_delivery`
  (`minutesSince / DELIVERY_MINUTES`, clamped), used to position the rider marker. `0` for
  `assigned`, `1` for `delivered`.

## 4. Geo (no geocoding) — `lib/tracking.ts`

- `STORE_COORD` — a fixed Rawalpindi coordinate constant (the "store").
- `AREA_COORDS: Record<string, [lat, lng]>` — a small lookup of known Rawalpindi/Islamabad areas
  (lowercased keys), with a `DEFAULT_AREA_COORD` fallback.
- `destinationFor(order)` → looks up `customer.area` (then `customer.city`) in `AREA_COORDS`,
  then applies a **deterministic small offset** derived from a hash of `order.id` (so each order's
  destination is distinct but stable across renders/polls). Returns `[lat, lng]`.
- `routePoints(from, to)` → for the demo, a straight 2-point line `[from, to]` (a simple
  multi-point easing can come later; YAGNI now).

All client-side; no DB coordinates, no network geocoding.

## 5. Map component — `app/order-confirmation/_components/DeliveryMap.tsx`

- `"use client"`, loaded via `dynamic(() => import("./DeliveryMap"), { ssr: false })` from the
  page (Leaflet needs `window`). Imports `leaflet` + `leaflet/dist/leaflet.css`.
- Props: `{ store: [lat,lng], destination: [lat,lng], progress: number, status }`.
- Renders an OSM tile layer, a route polyline `store→destination`, a destination pin, and a rider
  marker positioned at `lerp(store, destination, progress)`. Map/markers are created and updated
  through **refs in effects** (no React state for Leaflet objects → no `set-state-in-effect`
  concern; effects that only mutate refs/DOM are fine). Marker icon: a small emoji/divIcon (avoids
  Leaflet's broken default-marker asset paths under bundlers).
- Tiles load from `https://tile.openstreetmap.org/...` via Leaflet's own `<img>` (not
  `next/image`), so **no `next.config` `remotePatterns` change** is required. (The app sets no CSP.)

## 6. Confirmation page — `app/order-confirmation/page.tsx`

Restructured into a tracker + the existing details:

```
 ┌───────────────────────────────────────────┐
 │  ●──────●──────◍· · · · ○                  │  status stepper (current highlighted)
 │  Placed  Packing  On the way  Delivered     │
 ├───────────────────────────────────────────┤
 │  🛵  Arriving in ~18 min                    │  ETA banner
 ├───────────────────────────────────────────┤
 │  [   DeliveryMap (route + rider marker)  ]  │  shown for assigned | out_for_delivery | delivered
 ├───────────────────────────────────────────┤
 │  Items · Totals · Delivering to …           │  existing details (retained)
 └───────────────────────────────────────────┘
```

- New components under `app/order-confirmation/_components/`: `StatusStepper.tsx`, `EtaBanner.tsx`,
  `DeliveryMap.tsx`. The page composes them.
- A `cancelled` order shows a cancelled banner instead of the stepper/ETA/map.
- The map is hidden for `pending` (nothing to show yet) and shown from `assigned` onward.
- **Stepper mapping** (4 coarse nodes; the ETA banner carries the precise label): `Placed` is
  always complete; `Packing` is active on `pending`, complete from `assigned` onward; `On the way`
  is active on `assigned` and `out_for_delivery`, complete at `delivered`; `Delivered` is the
  final node, active at `delivered`. (So `assigned` highlights "On the way" with the ETA banner
  reading "Rider assigned · picking up shortly"; `out_for_delivery` reads "Arriving in ~N min".)

## 7. Live updates — `lib/use-order.ts` (`useOrderTracking(id)`)

- Replaces the page's `useAuthGet` for the order. Does an initial authenticated GET of
  `/orders/[id]`, stores `{order, loading}` in `useState`, then **polls every 10s** via
  `setInterval`, re-fetching and updating state. **`setState` is called only inside the async
  interval/fetch callbacks** — never synchronously in the effect body — so it does not trip
  `react-hooks/set-state-in-effect`. The effect returns a cleanup that clears the interval.
- Polling stops once `status` is `delivered` or `cancelled` (clear the interval).
- A separate lightweight `now` ticker (1s `setInterval`, setState in callback) drives the ETA
  countdown and the rider-marker animation smoothly between polls.
- Auth header via `getToken()` (same Bearer pattern as `useAuthGet`); requests use `@/lib/axios`.
- **Order type:** the shared `Order` type in `lib/store` lacks `status`/`outForDeliveryAt`. Define
  a `TrackedOrder` type (in `lib/tracking.ts`, extending the order shape with
  `status: OrderStatus` and `outForDeliveryAt: string | null`) and use it in the hook, page, and
  tracker components — rather than widening the shared store type or casting ad-hoc.

> Note: this page moves off the Suspense `useAuthGet` helper because it needs polling + a ticker.
> That's intentional and isolated to this page; other pages keep `useAuthGet`.

## 8. Rider page — `app/rider/orders/page.tsx`

- Show the order's current status. Buttons by status:
  - `assigned` → **"Picked up"** → PATCH `{ status: "out_for_delivery" }`.
  - `out_for_delivery` → **"Mark delivered"** → PATCH `{ status: "delivered" }`.
- After a successful PATCH, full-page `window.location.reload()` (existing pattern), with the
  try/catch + alert error handling already in place.

## 9. Other surfaces

- **Admin orders table** (`app/admin/orders/page.tsx`): add an `out_for_delivery` entry to
  `STATUS_STYLES` and a readable label ("Out for delivery").
- **My Orders** (`app/my-orders/page.tsx`): the status badge should render `out_for_delivery`
  nicely (label + style) — route its label through `statusLabel` from `lib/tracking.ts`.

## 10. Validation (Zod) — `schema/index.ts`

- `riderOrderUpdateSchema = z.object({ status: z.enum(["out_for_delivery", "delivered"]) })`.
- Extend the shared order status enum (`orderStatusEnum`) to include `out_for_delivery`.

## Files touched (anticipated)

- `models/Order.ts` — enum + `outForDeliveryAt` + `toPlainOrder`.
- `schema/index.ts` — `riderOrderUpdateSchema`; extend `orderStatusEnum`.
- `app/api/rider/orders/[id]/route.ts` — body-driven transitions + `outForDeliveryAt`.
- `app/api/rider/orders/route.ts` — include `out_for_delivery` in the list filter.
- `lib/tracking.ts` — labels, ETA, progress, geo (store/area/destination), route points.
- `lib/use-order.ts` — `useOrderTracking(id)` polling hook + `now` ticker.
- `app/order-confirmation/page.tsx` — compose tracker + details; use `useOrderTracking`.
- `app/order-confirmation/_components/{StatusStepper,EtaBanner,DeliveryMap}.tsx` — new.
- `app/rider/orders/page.tsx` — Picked up / Mark delivered by status.
- `app/admin/orders/page.tsx`, `app/my-orders/page.tsx` — `out_for_delivery` label/badge.
- `package.json` — add `leaflet` (+ `@types/leaflet`).

## Verification (no test framework — `pnpm lint` + `pnpm build` + manual)

1. Place an order → confirmation shows stepper at "Packing", no map yet, ETA "Packing · ~10 min".
2. Admin assigns a rider → within ~10s the page advances to "Rider assigned" and the map appears
   (rider at store, route to destination).
3. Rider taps **Picked up** → status `out_for_delivery`; confirmation shows "On the way", ETA
   counts down, rider marker animates along the route.
4. Rider taps **Mark delivered** → "Delivered", marker at destination, polling stops.
5. Admin cancels a pending/assigned order → confirmation shows the cancelled banner.
6. Negative: rider can't deliver before picking up (409); can't act on another rider's order (403).
7. `pnpm lint && pnpm build` clean; confirm `/api/orders/[id]` polling fires on an interval (not a
   tight loop) and stops at delivered/cancelled.

## Notes / constraints

- Simulated movement: the marker position is a function of elapsed time since `outForDeliveryAt`,
  not real location — it will reach the destination at ~`DELIVERY_MINUTES` regardless of actual
  delivery.
- `leaflet` default marker images break under bundlers; use a `divIcon` (emoji) to avoid asset
  path issues.
- Polling + ticker use `setState` only in async callbacks to respect the repo's
  `react-hooks/set-state-in-effect` rule; the map uses refs (no state) for Leaflet objects.
