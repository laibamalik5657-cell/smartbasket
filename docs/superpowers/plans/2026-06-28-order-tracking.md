# Order Tracking + Live Delivery Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the static order-confirmation page into a live tracker — status stepper, heuristic ETA, and a simulated Leaflet/OSM delivery map with an animated rider — and add an `out_for_delivery` status with a rider "Picked up" action.

**Architecture:** Add one order status (`out_for_delivery`) + an `outForDeliveryAt` timestamp. The rider PATCH becomes a small server-enforced state machine. All tracking presentation (labels, ETA, geo, progress) is pure client-side logic in `lib/tracking.ts`; the confirmation page polls `/api/orders/[id]` via a `useOrderTracking` hook and a 1s `now` ticker, and renders a vanilla-Leaflet map (client-only, `ssr:false`) whose rider marker is a time-based simulation. No GPS, routing, geocoding, or websockets.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript (strict), Mongoose, Zod, Tailwind v4, axios, **Leaflet** (new), OpenStreetMap tiles. pnpm.

## Global Constraints

- Package manager **pnpm**; run from repo root.
- **No test framework** — validation is `pnpm lint` + `pnpm build` + manual. Do NOT add a runner or write tests.
- Client→API calls go through `@/lib/axios` (`apiClient`), **not** `fetch`.
- ESLint `react-hooks/set-state-in-effect` is an **ERROR**: never call a `setState` synchronously in a `useEffect` body. `setState` inside async callbacks (`setInterval`/`setTimeout`/`.then`/`async`) is allowed. Leaflet objects live in **refs**, not state.
- Order status literal (verbatim, everywhere): `"pending" | "assigned" | "out_for_delivery" | "delivered" | "cancelled"`.
- ETA constant: `DELIVERY_MINUTES = 25`.
- Map: **vanilla `leaflet`** (not react-leaflet), rendered in a `"use client"` component imported via `dynamic(..., { ssr: false })`. Use an emoji `divIcon` (Leaflet's default marker images break under bundlers). OSM tiles load via Leaflet's own `<img>` — no `next.config` change needed.
- Auth: protected GET/PATCH send `Authorization: Bearer ${getToken()}`; mutations reload the page (`window.location.reload()`).
- Follow existing patterns in each file you touch.

---

### Task 1: Order model + schema — add `out_for_delivery` + `outForDeliveryAt`

**Files:**
- Modify: `models/Order.ts`
- Modify: `schema/index.ts`

**Interfaces:**
- Produces: `IOrder.status` gains `"out_for_delivery"`; `IOrder.outForDeliveryAt?: Date`; `PlainOrder.status` gains the value; `PlainOrder.outForDeliveryAt: string | null`; `toPlainOrder` returns `outForDeliveryAt`. `orderStatusEnum` includes `"out_for_delivery"`; new `riderOrderUpdateSchema` (`{ status: "out_for_delivery" | "delivered" }`).

- [ ] **Step 1: Extend the Order model**

In `models/Order.ts`:
- In the `IOrder` interface change `status` to include the new value and add the timestamp (after the existing `status`/`riderId` lines):
```ts
  status: "pending" | "assigned" | "out_for_delivery" | "delivered" | "cancelled";
  riderId?: mongoose.Types.ObjectId;
  outForDeliveryAt?: Date;
```
- In `OrderSchema`, update the `status` enum and add `outForDeliveryAt` (next to `riderId`):
```ts
    status: {
      type: String,
      enum: ["pending", "assigned", "out_for_delivery", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    riderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    outForDeliveryAt: { type: Date },
```
- In the `PlainOrder` interface update `status` and add the field (after `riderId`):
```ts
  status: "pending" | "assigned" | "out_for_delivery" | "delivered" | "cancelled";
  riderId: string | null;
  outForDeliveryAt: string | null;
```
- In `toPlainOrder`, add after the `riderId` mapping line:
```ts
    outForDeliveryAt: o.outForDeliveryAt
      ? new Date(o.outForDeliveryAt).toISOString()
      : null,
```

- [ ] **Step 2: Extend the Zod schemas**

In `schema/index.ts`:
- Update `orderStatusEnum` to include the new value:
```ts
export const orderStatusEnum = z.enum([
  "pending",
  "assigned",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);
```
- Append a rider status-update schema (at the end of the file):
```ts
// Rider advances their own order: assigned → out_for_delivery → delivered.
export const riderOrderUpdateSchema = z.object({
  status: z.enum(["out_for_delivery", "delivered"]),
});

export type RiderOrderUpdateInput = z.infer<typeof riderOrderUpdateSchema>;
```

- [ ] **Step 3: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: no errors (existing `<img>` warnings are fine).

- [ ] **Step 4: Commit**

```bash
git add models/Order.ts schema/index.ts
git commit -m "feat(orders): add out_for_delivery status + outForDeliveryAt timestamp"
```

---

### Task 2: Rider API — body-driven transitions + list filter

**Files:**
- Modify: `app/api/rider/orders/[id]/route.ts`
- Modify: `app/api/rider/orders/route.ts`

**Interfaces:**
- Consumes: `requireRider`, `Order`/`IOrder`/`toPlainOrder`, `riderOrderUpdateSchema`.
- Produces: `PATCH /api/rider/orders/[id]` accepts `{ status: "out_for_delivery" | "delivered" }`, enforces `assigned→out_for_delivery` (stamps `outForDeliveryAt`) and `out_for_delivery→delivered`. `GET /api/rider/orders` includes `out_for_delivery`.

- [ ] **Step 1: Rewrite the PATCH handler**

Replace the body of `app/api/rider/orders/[id]/route.ts` with:
```ts
import { connectToDatabase } from "@/lib/mongodb";
import { Order, IOrder, toPlainOrder } from "@/models/Order";
import { requireRider } from "@/lib/auth";
import { riderOrderUpdateSchema } from "@/schema";

// PATCH /api/rider/orders/[id] — rider advances their own order:
// assigned → out_for_delivery (picked up) → delivered.
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
    const body = await request.json();
    const result = riderOrderUpdateSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return Response.json(
        { success: false, message: firstError?.message ?? "Invalid input." },
        { status: 400 },
      );
    }
    const target = result.data.status;

    const order = await Order.findById(id);
    if (!order) {
      return Response.json({ success: false, message: "Order not found." }, { status: 404 });
    }
    if (!order.riderId || order.riderId.toString() !== rider.id) {
      return Response.json({ success: false, message: "Not your order." }, { status: 403 });
    }

    const legal =
      (target === "out_for_delivery" && order.status === "assigned") ||
      (target === "delivered" && order.status === "out_for_delivery");
    if (!legal) {
      return Response.json(
        { success: false, message: `Cannot move an order from ${order.status} to ${target}.` },
        { status: 409 },
      );
    }

    order.status = target;
    if (target === "out_for_delivery") {
      order.outForDeliveryAt = new Date();
    }
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

- [ ] **Step 2: Widen the list filter**

In `app/api/rider/orders/route.ts`, change the status filter:
```ts
    const docs = await Order.find({
      riderId: rider.id,
      status: { $in: ["assigned", "out_for_delivery", "delivered"] },
    })
```

- [ ] **Step 3: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: no errors.

- [ ] **Step 4: Manual check (curl)**

With a rider token in `$RTOKEN` and an order assigned to that rider in `$OID`:
```bash
curl -s -X PATCH localhost:3000/api/rider/orders/$OID -H "Authorization: Bearer $RTOKEN" \
  -H 'Content-Type: application/json' -d '{"status":"out_for_delivery"}'
curl -s -X PATCH localhost:3000/api/rider/orders/$OID -H "Authorization: Bearer $RTOKEN" \
  -H 'Content-Type: application/json' -d '{"status":"delivered"}'
```
Expected: first returns `status:"out_for_delivery"` with `outForDeliveryAt` set; second returns `delivered`. Delivering before pickup (from `assigned`) → 409. (Runtime check — note as deferred to controller if no token handy.)

- [ ] **Step 5: Commit**

```bash
git add app/api/rider/orders/[id]/route.ts app/api/rider/orders/route.ts
git commit -m "feat(rider-api): pick-up + deliver transitions, stamp outForDeliveryAt"
```

---

### Task 3: Rider page — "Picked up" / "Mark delivered" buttons

**Files:**
- Modify: `app/rider/orders/page.tsx`

**Interfaces:**
- Consumes: the rider PATCH from Task 2 (`{ status }`).

- [ ] **Step 1: Update the order type + status display**

In `app/rider/orders/page.tsx`, change the `RiderOrder` type's `status` union:
```ts
type RiderOrder = {
  id: string;
  total: number;
  status: "pending" | "assigned" | "out_for_delivery" | "delivered" | "cancelled";
  createdAt: string;
  customer: { name: string; phone: string; city: string; area: string; address: string };
};
```

- [ ] **Step 2: Replace `markDelivered` with a status updater**

Replace the `markDelivered` function with:
```ts
async function updateStatus(id: string, status: "out_for_delivery" | "delivered") {
  try {
    await apiClient.patch(
      `/rider/orders/${id}`,
      { status },
      { headers: { Authorization: `Bearer ${getToken()}` } },
    );
    window.location.reload();
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "Something went wrong. Please try again.";
    alert(message);
  }
}
```

- [ ] **Step 3: Render the right button per status**

In `DeliveriesList`, replace the status/button row (the `<div className="mt-3 flex items-center justify-between">…</div>`) with:
```tsx
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground capitalize">
              Status: {o.status.replace(/_/g, " ")}
            </span>
            {o.status === "assigned" && (
              <button
                onClick={() => updateStatus(o.id, "out_for_delivery")}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Picked up
              </button>
            )}
            {o.status === "out_for_delivery" && (
              <button
                onClick={() => updateStatus(o.id, "delivered")}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Mark delivered
              </button>
            )}
          </div>
```

- [ ] **Step 4: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: no errors.

- [ ] **Step 5: Manual check**

As a rider with an assigned order: `/rider/orders` shows "Picked up" → click → reloads to "Status: out for delivery" with "Mark delivered" → click → "delivered", buttons gone. (Deferred to controller if no rider session.)

- [ ] **Step 6: Commit**

```bash
git add app/rider/orders/page.tsx
git commit -m "feat(rider): Picked up + Mark delivered actions by status"
```

---

### Task 4: Tracking helpers — `lib/tracking.ts`

**Files:**
- Create: `lib/tracking.ts`

**Interfaces:**
- Produces: `OrderStatus`, `TrackedOrder`, `DELIVERY_MINUTES`, `STORE_COORD`, `statusLabel(status)`, `etaText(order, now)`, `deliveryProgress(order, now)`, `destinationFor(order)`, `lerp(a, b, t)`. `Coord = [number, number]`.

- [ ] **Step 1: Write the module**

Create `lib/tracking.ts`:
```ts
export type OrderStatus =
  | "pending"
  | "assigned"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type Coord = [number, number];

export type TrackedOrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type TrackedOrder = {
  id: string;
  status: OrderStatus;
  outForDeliveryAt: string | null;
  subtotal: number;
  shipping: number;
  total: number;
  payment: string;
  createdAt: string;
  items: TrackedOrderItem[];
  customer: {
    name: string;
    phone: string;
    city: string;
    area: string;
    address: string;
  };
};

export const DELIVERY_MINUTES = 25;

/** The (fixed) store location — central Rawalpindi. */
export const STORE_COORD: Coord = [33.5651, 73.0169];

/** Approximate centres for known delivery areas (lowercased keys). */
const AREA_COORDS: Record<string, Coord> = {
  "satellite town": [33.6402, 73.0689],
  saddar: [33.595, 73.053],
  "bahria town": [33.523, 73.095],
  dha: [33.538, 73.145],
  gulberg: [33.63, 73.09],
  chaklala: [33.5687, 73.0997],
  "f-7": [33.72, 73.055],
  "f-10": [33.695, 73.015],
  "g-11": [33.668, 72.993],
  "blue area": [33.708, 73.056],
  islamabad: [33.6844, 73.0479],
  rawalpindi: [33.5651, 73.0169],
};
const DEFAULT_AREA_COORD: Coord = [33.6, 73.05];

export function statusLabel(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "Packing your order";
    case "assigned":
      return "Rider assigned";
    case "out_for_delivery":
      return "On the way";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
  }
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** A stable, distinct-looking destination for an order (no geocoding). */
export function destinationFor(order: Pick<TrackedOrder, "id" | "customer">): Coord {
  const key = (order.customer.area || order.customer.city || "").trim().toLowerCase();
  const base = AREA_COORDS[key] ?? DEFAULT_AREA_COORD;
  const h = hashString(order.id);
  const dLat = ((h % 1000) / 1000 - 0.5) * 0.02; // ~±0.01° (~1 km)
  const dLng = (((h >> 10) % 1000) / 1000 - 0.5) * 0.02;
  return [base[0] + dLat, base[1] + dLng];
}

function minutesSince(iso: string | null, now: number): number {
  if (!iso) return 0;
  return (now - new Date(iso).getTime()) / 60000;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/** 0..1 position along the route store→destination. */
export function deliveryProgress(order: Pick<TrackedOrder, "status" | "outForDeliveryAt">, now: number): number {
  if (order.status === "delivered") return 1;
  if (order.status === "out_for_delivery") {
    return clamp(minutesSince(order.outForDeliveryAt, now) / DELIVERY_MINUTES, 0, 1);
  }
  return 0;
}

/** Customer-facing ETA line. */
export function etaText(order: Pick<TrackedOrder, "status" | "outForDeliveryAt">, now: number): string {
  switch (order.status) {
    case "pending":
      return "Packing · dispatching in ~10 min";
    case "assigned":
      return "Rider assigned · picking up shortly";
    case "out_for_delivery": {
      const remaining = Math.round(DELIVERY_MINUTES - minutesSince(order.outForDeliveryAt, now));
      return remaining >= 1 ? `Arriving in ~${remaining} min` : "Arriving any moment";
    }
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Order cancelled";
  }
}

/** Linear interpolation between two coordinates. */
export function lerp(a: Coord, b: Coord, t: number): Coord {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}
```

- [ ] **Step 2: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/tracking.ts
git commit -m "feat(tracking): status labels, heuristic ETA, geo + route helpers"
```

---

### Task 5: Polling hook — `lib/use-order.ts`

**Files:**
- Create: `lib/use-order.ts`

**Interfaces:**
- Consumes: `apiClient`, `getToken`, `TrackedOrder`.
- Produces: `useOrderTracking(id: string | null) => { order: TrackedOrder | null; loading: boolean; now: number }`. Initial GET + 10s poll (stops at delivered/cancelled) + 1s `now` ticker. All `setState` in async callbacks.

- [ ] **Step 1: Write the hook**

Create `lib/use-order.ts`:
```ts
"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/axios";
import { getToken } from "@/lib/utils";
import type { TrackedOrder } from "@/lib/tracking";

/*
 * Live order tracking: initial authenticated GET of /orders/[id], then poll
 * every 10s until a terminal status, plus a 1s `now` ticker that drives the ETA
 * countdown and rider-marker animation between polls.
 *
 * Every setState here runs inside an async callback (fetch .then/finally, or a
 * timer callback) — never synchronously in an effect body — so it stays clear
 * of this repo's `react-hooks/set-state-in-effect` error.
 */
export function useOrderTracking(id: string | null): {
  order: TrackedOrder | null;
  loading: boolean;
  now: number;
} {
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(!!id);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!id) return;
    let active = true;
    let poll: ReturnType<typeof setInterval> | undefined;
    const token = getToken();

    async function fetchOrder() {
      try {
        const res = await apiClient.get(`/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!active) return;
        const o = res.data?.order as TrackedOrder | undefined;
        setOrder(o ?? null);
        if (o && (o.status === "delivered" || o.status === "cancelled") && poll) {
          clearInterval(poll);
        }
      } catch {
        if (active) setOrder(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchOrder();
    poll = setInterval(fetchOrder, 10000);
    return () => {
      active = false;
      if (poll) clearInterval(poll);
    };
  }, [id]);

  useEffect(() => {
    const ticker = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(ticker);
  }, []);

  return { order, loading, now };
}
```

- [ ] **Step 2: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: no errors. In particular, **no `react-hooks/set-state-in-effect` error** (all setState is in async callbacks).

- [ ] **Step 3: Commit**

```bash
git add lib/use-order.ts
git commit -m "feat(tracking): useOrderTracking polling hook + now ticker"
```

---

### Task 6: Leaflet dependency + `DeliveryMap` component

**Files:**
- Modify: `package.json` (+ lockfile) via pnpm
- Create: `app/order-confirmation/_components/DeliveryMap.tsx`

**Interfaces:**
- Consumes: `lerp`, `STORE_COORD`/`Coord`, `OrderStatus` from `lib/tracking`; `leaflet`.
- Produces: default-export `DeliveryMap({ store, destination, progress, status })` (client-only).

- [ ] **Step 1: Add Leaflet**

Run:
```bash
pnpm add leaflet && pnpm add -D @types/leaflet
```
Expected: `leaflet` in `dependencies`, `@types/leaflet` in `devDependencies`; lockfile updated.

- [ ] **Step 2: Write the map component**

Create `app/order-confirmation/_components/DeliveryMap.tsx`:
```tsx
"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { lerp, type Coord, type OrderStatus } from "@/lib/tracking";

type Props = {
  store: Coord;
  destination: Coord;
  progress: number; // 0..1
  status: OrderStatus;
};

function emojiIcon(emoji: string) {
  return L.divIcon({
    html: `<span style="font-size:22px;line-height:22px">${emoji}</span>`,
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export default function DeliveryMap({ store, destination, progress, status }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const riderRef = useRef<L.Marker | null>(null);

  // Initialise the map once for a given store/destination pair.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: false });
    mapRef.current = map;

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);

    L.polyline([store, destination], { color: "#16a34a", weight: 4, opacity: 0.7 }).addTo(map);
    L.marker(store, { icon: emojiIcon("🏬") }).addTo(map);
    L.marker(destination, { icon: emojiIcon("📍") }).addTo(map);
    riderRef.current = L.marker(store, { icon: emojiIcon("🛵") }).addTo(map);

    map.fitBounds(L.latLngBounds([store, destination]).pad(0.4));

    return () => {
      map.remove();
      mapRef.current = null;
      riderRef.current = null;
    };
  }, [store, destination]);

  // Move the rider marker as progress/status changes.
  useEffect(() => {
    const rider = riderRef.current;
    if (!rider) return;
    const t = status === "delivered" ? 1 : status === "out_for_delivery" ? progress : 0;
    rider.setLatLng(lerp(store, destination, t));
  }, [progress, status, store, destination]);

  return (
    <div
      ref={containerRef}
      className="h-64 w-full overflow-hidden rounded-xl border border-border"
      style={{ zIndex: 0 }}
    />
  );
}
```

> Note: `store` and `destination` must be **referentially stable** (the init effect depends on them). The page (Task 8) memoizes them — do not recompute new arrays per render.

- [ ] **Step 3: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: no errors. (The component isn't imported yet; it compiles standalone.)

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml app/order-confirmation/_components/DeliveryMap.tsx
git commit -m "feat(tracking): Leaflet delivery map component (simulated rider)"
```

---

### Task 7: `StatusStepper` + `EtaBanner` components

**Files:**
- Create: `app/order-confirmation/_components/StatusStepper.tsx`
- Create: `app/order-confirmation/_components/EtaBanner.tsx`

**Interfaces:**
- Consumes: `OrderStatus`, `TrackedOrder`, `etaText` from `lib/tracking`.
- Produces: default-export `StatusStepper({ status })` and `EtaBanner({ order, now })`.

- [ ] **Step 1: Write the stepper**

Create `app/order-confirmation/_components/StatusStepper.tsx`:
```tsx
import type { OrderStatus } from "@/lib/tracking";

type Props = { status: OrderStatus };

const STEPS = ["Placed", "Packing", "On the way", "Delivered"] as const;

// How far along the 4-step bar each status sits (index of the active step).
function activeIndex(status: OrderStatus): number {
  switch (status) {
    case "pending":
      return 1; // Packing
    case "assigned":
    case "out_for_delivery":
      return 2; // On the way
    case "delivered":
      return 3; // Delivered
    case "cancelled":
      return 0;
  }
}

export default function StatusStepper({ status }: Props) {
  const active = activeIndex(status);
  return (
    <div className="flex items-center justify-between">
      {STEPS.map((label, i) => {
        const done = i < active;
        const current = i === active;
        return (
          <div key={label} className="flex flex-1 flex-col items-center text-center">
            <div className="flex w-full items-center">
              {i > 0 && (
                <div className={`h-0.5 flex-1 ${i <= active ? "bg-brand" : "bg-border"}`} />
              )}
              <div
                className={`mx-1 h-3 w-3 rounded-full ${
                  done || current ? "bg-brand" : "bg-border"
                } ${current ? "ring-4 ring-brand/20" : ""}`}
              />
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 ${i < active ? "bg-brand" : "bg-border"}`} />
              )}
            </div>
            <span
              className={`mt-2 text-xs ${
                done || current ? "font-medium text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Write the ETA banner**

Create `app/order-confirmation/_components/EtaBanner.tsx`:
```tsx
import { Bike } from "lucide-react";
import { etaText, statusLabel, type TrackedOrder } from "@/lib/tracking";

type Props = { order: Pick<TrackedOrder, "status" | "outForDeliveryAt">; now: number };

export default function EtaBanner({ order, now }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface p-4">
      <Bike className="h-6 w-6 text-brand" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-foreground">{statusLabel(order.status)}</p>
        <p className="text-sm text-muted-foreground">{etaText(order, now)}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: no errors. (If `Bike` is not exported by the installed lucide-react version, use `Truck` instead — both are valid icons; pick whichever the build accepts.)

- [ ] **Step 4: Commit**

```bash
git add app/order-confirmation/_components/StatusStepper.tsx app/order-confirmation/_components/EtaBanner.tsx
git commit -m "feat(tracking): status stepper + ETA banner components"
```

---

### Task 8: Confirmation page — compose the live tracker

**Files:**
- Modify: `app/order-confirmation/page.tsx`

**Interfaces:**
- Consumes: `useOrderTracking`, `STORE_COORD`, `destinationFor`, `deliveryProgress`, `statusLabel` (`lib/tracking`), `StatusStepper`, `EtaBanner`, dynamic `DeliveryMap`.

- [ ] **Step 1: Rewrite the page**

Replace `app/order-confirmation/page.tsx` with:
```tsx
"use client";

import { Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { useOrderTracking } from "@/lib/use-order";
import {
  STORE_COORD,
  destinationFor,
  deliveryProgress,
  type Coord,
} from "@/lib/tracking";
import StatusStepper from "./_components/StatusStepper";
import EtaBanner from "./_components/EtaBanner";

const DeliveryMap = dynamic(() => import("./_components/DeliveryMap"), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-xl bg-surface" />,
});

function Confirmation() {
  const params = useSearchParams();
  const id = params.get("id");
  const { order, loading, now } = useOrderTracking(id);

  // Stable coordinates for the map (recomputing would re-init the map each render).
  const destination = useMemo<Coord>(
    () => (order ? destinationFor(order) : STORE_COORD),
    [order?.id],
  );

  if (loading) {
    return <p className="text-center text-gray-500 py-20">Loading…</p>;
  }

  if (!order) {
    return (
      <div className="text-center bg-card rounded-2xl shadow-sm border border-border p-12">
        <h1 className="text-2xl font-bold text-foreground">Order not found</h1>
        <p className="mt-2 text-muted-foreground">We couldn&apos;t find that order.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const cancelled = order.status === "cancelled";
  const showMap = order.status === "assigned" || order.status === "out_for_delivery" || order.status === "delivered";
  const progress = deliveryProgress(order, now);

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
      <div className="text-center border-b border-border pb-6">
        {cancelled ? (
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-3" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="w-16 h-16 text-brand mx-auto mb-3" aria-hidden="true" />
        )}
        <h1 className="text-2xl font-bold text-foreground">
          {cancelled ? "Order cancelled" : "Order placed!"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {cancelled
            ? "This order was cancelled."
            : `Thank you, ${order.customer.name}. Your order is confirmed.`}
        </p>
        <p className="mt-2 text-sm font-medium text-foreground">Order ID: {order.id}</p>
      </div>

      {/* Live tracker */}
      {!cancelled && (
        <div className="py-6 space-y-5 border-b border-border">
          <StatusStepper status={order.status} />
          <EtaBanner order={order} now={now} />
          {showMap && (
            <DeliveryMap
              store={STORE_COORD}
              destination={destination}
              progress={progress}
              status={order.status}
            />
          )}
        </div>
      )}

      {/* Items */}
      <div className="py-6 space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-foreground">
              {item.name} × {item.quantity}
            </span>
            <span className="font-medium">Rs. {item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-border pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Items</span>
          <span>Rs. {order.subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery</span>
          <span>Rs. {order.shipping}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
          <span>Total</span>
          <span>Rs. {order.total}</span>
        </div>
      </div>

      {/* Delivery */}
      <div className="mt-6 rounded-lg bg-surface p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Delivering to</p>
        <p className="mt-1">
          {order.customer.address}, {order.customer.area}, {order.customer.city}
        </p>
        <p>Phone: {order.customer.phone}</p>
        <p className="mt-2">
          Payment: {order.payment === "cod" ? "Cash on Delivery" : "Online Payment"}
        </p>
      </div>

      <Link
        href="/items/see-more"
        className="mt-6 block text-center rounded-lg bg-brand px-5 py-3 text-sm font-medium text-white hover:bg-brand-dark"
      >
        Continue shopping
      </Link>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <Suspense fallback={<p className="text-center text-gray-500 py-20">Loading…</p>}>
          <Confirmation />
        </Suspense>
      </div>
    </div>
  );
}
```

> The `<Suspense>` boundary stays because `useSearchParams()` requires it. `useOrderTracking` no longer uses Suspense (it polls), so it returns `loading` and the component renders a spinner itself.

- [ ] **Step 2: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: no errors; no `set-state-in-effect` error.

- [ ] **Step 3: Manual check (controller, end-to-end)**

Place an order → `/order-confirmation?id=…` shows the stepper at "Packing", ETA "Packing · ~10 min", no map. Admin assigns a rider → within ~10s it advances to "On the way"/"Rider assigned" and the map appears. Rider taps "Picked up" → ETA counts down and the 🛵 animates along the route. Rider "Mark delivered" → "Delivered", marker at 📍, polling stops. Cancel a pending order → cancelled banner.

- [ ] **Step 4: Commit**

```bash
git add app/order-confirmation/page.tsx
git commit -m "feat(tracking): live order-confirmation tracker (stepper, ETA, map, polling)"
```

---

### Task 9: `out_for_delivery` label/badge on admin + My Orders

**Files:**
- Modify: `app/admin/orders/page.tsx`
- Modify: `app/my-orders/page.tsx`

**Interfaces:**
- Consumes: `statusLabel` from `lib/tracking`.

- [ ] **Step 1: Admin orders table — add the status**

In `app/admin/orders/page.tsx`:
- Add `"out_for_delivery"` to the `AdminOrder["status"]` union:
```ts
  status: "pending" | "assigned" | "out_for_delivery" | "delivered" | "cancelled";
```
- Add an entry to `STATUS_STYLES`:
```ts
const STATUS_STYLES: Record<AdminOrder["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  assigned: "bg-blue-100 text-blue-800",
  out_for_delivery: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};
```
- Where the badge renders `{o.status}`, show a readable label — replace the badge text with:
```tsx
                  {o.status.replace(/_/g, " ")}
```

- [ ] **Step 2: My Orders — readable status label**

In `app/my-orders/page.tsx`, import the helper and use it for the badge. Add to the imports:
```tsx
import { statusLabel, type OrderStatus } from "@/lib/tracking";
```
Replace the badge expression `{(order as { status?: string }).status ?? "pending"}` with:
```tsx
                  {statusLabel(((order as { status?: OrderStatus }).status ?? "pending"))}
```

- [ ] **Step 3: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: no errors.

- [ ] **Step 4: Manual check**

Admin table shows an "out for delivery" badge for picked-up orders; My Orders shows "On the way" for the same. (Deferred to controller.)

- [ ] **Step 5: Commit**

```bash
git add app/admin/orders/page.tsx app/my-orders/page.tsx
git commit -m "feat(orders): out_for_delivery label + badge on admin and My Orders"
```

---

## End-to-end verification (after all tasks)

1. Place an order → confirmation shows "Packing" step, ETA "~10 min", no map.
2. Admin assigns rider → page auto-advances (~10s poll) to "On the way" + map (rider at store).
3. Rider "Picked up" → `out_for_delivery`; ETA counts down; 🛵 animates toward 📍.
4. Rider "Mark delivered" → "Delivered"; marker at destination; polling stops.
5. Admin cancels a pending/assigned order → confirmation shows cancelled banner.
6. Negatives: rider deliver-before-pickup → 409; other rider's order → 403.
7. `pnpm lint && pnpm build` clean; `/api/orders/[id]` polls on a 10s interval (not a tight loop) and stops at delivered/cancelled.

## Notes / constraints carried from the spec

- Simulated movement: marker position is time-based (reaches destination at ~`DELIVERY_MINUTES`), not real location.
- No GPS, routing, geocoding, websockets, or stored coordinates.
- Leaflet default-marker images are avoided via emoji `divIcon`; OSM tiles need no `next.config`/CSP change.
- Polling + ticker keep `setState` in async callbacks; the map keeps Leaflet objects in refs — both to respect `react-hooks/set-state-in-effect`.
