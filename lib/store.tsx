"use client";

import { useCallback, useSyncExternalStore, type ReactNode } from "react";

/* Shared product shape used across cart, favorites and product lists. */
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  unit?: string;
  category?: string;
}

export interface CartLine extends Product {
  quantity: number;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  city: string;
  area: string;
  address: string;
}

export interface Order {
  id: string;
  items: CartLine[];
  subtotal: number;
  shipping: number;
  total: number;
  payment: string;
  customer: OrderCustomer;
  createdAt: string;
}

const CART_KEY = "smartbasket:cart";
const FAV_KEY = "smartbasket:favorites";
const ORDERS_KEY = "smartbasket:orders";

function readRaw<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/* Stable empty snapshots (used on the server and before any writes). */
const EMPTY_CART: CartLine[] = [];
const EMPTY_FAV: Product[] = [];
const EMPTY_ORDERS: Order[] = [];

/*
 * localStorage acts as the external store. We cache the parsed value so
 * getSnapshot returns a stable reference (required by useSyncExternalStore),
 * and only swap the reference when something actually writes.
 */
let cartCache: CartLine[] = EMPTY_CART;
let favCache: Product[] = EMPTY_FAV;
let ordersCache: Order[] = EMPTY_ORDERS;

function loadCaches() {
  cartCache = readRaw<CartLine[]>(CART_KEY, EMPTY_CART);
  favCache = readRaw<Product[]>(FAV_KEY, EMPTY_FAV);
  ordersCache = readRaw<Order[]>(ORDERS_KEY, EMPTY_ORDERS);
}

if (typeof window !== "undefined") loadCaches();

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = () => {
    loadCaches();
    cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function persist(key: string, value: unknown) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

function setCart(next: CartLine[]) {
  cartCache = next;
  persist(CART_KEY, next);
  emit();
}

function setFav(next: Product[]) {
  favCache = next;
  persist(FAV_KEY, next);
  emit();
}

function setOrders(next: Order[]) {
  ordersCache = next;
  persist(ORDERS_KEY, next);
  emit();
}

/* Kept so existing <StoreProvider> in the layout keeps working — the store
 * itself is module-level, so this is just a passthrough. */
export function StoreProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useStore() {
  const cart = useSyncExternalStore(
    subscribe,
    () => cartCache,
    () => EMPTY_CART,
  );
  const favorites = useSyncExternalStore(
    subscribe,
    () => favCache,
    () => EMPTY_FAV,
  );
  const orders = useSyncExternalStore(
    subscribe,
    () => ordersCache,
    () => EMPTY_ORDERS,
  );

  const addToCart = useCallback((product: Product, qty = 1) => {
    const existing = cartCache.find((i) => i.id === product.id);
    if (existing) {
      setCart(
        cartCache.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + qty } : i,
        ),
      );
    } else {
      setCart([...cartCache, { ...product, quantity: qty }]);
    }
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart(cartCache.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty < 1) {
      setCart(cartCache.filter((i) => i.id !== id));
      return;
    }
    setCart(cartCache.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
  }, []);

  const clearCart = useCallback(() => setCart(EMPTY_CART), []);

  const toggleFavourite = useCallback((product: Product) => {
    setFav(
      favCache.some((f) => f.id === product.id)
        ? favCache.filter((f) => f.id !== product.id)
        : [...favCache, product],
    );
  }, []);

  const isFavourite = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites],
  );

  const placeOrder = useCallback(
    ({
      payment,
      customer,
    }: {
      payment: string;
      customer: OrderCustomer;
    }): Order => {
      const subtotal = cartCache.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const shipping = subtotal > 500 || subtotal === 0 ? 0 : 50;
      const total = subtotal + shipping;
      const order: Order = {
        id: `ORD-${Date.now()}`,
        items: cartCache,
        subtotal,
        shipping,
        total,
        payment,
        customer,
        createdAt: new Date().toISOString(),
      };
      setOrders([order, ...ordersCache]);
      setCart(EMPTY_CART);
      return order;
    },
    [],
  );

  const getOrder = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders],
  );

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const favCount = favorites.length;

  return {
    cart,
    favorites,
    orders,
    cartCount,
    favCount,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    toggleFavourite,
    isFavourite,
    placeOrder,
    getOrder,
  };
}
