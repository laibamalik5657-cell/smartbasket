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
