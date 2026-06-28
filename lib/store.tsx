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

/* Orders are persisted server-side per user (see app/api/orders + models/Order),
 * NOT in this store. This type is the plain shape the API returns and the
 * order pages render. */
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

/* The signed-in user is NOT kept here — it lives in the JWT in localStorage.
 * Save/read/clear the token with lib/utils, and read the current user
 * reactively with useAuthUser() (lib/use-auth). This type is the decoded
 * shape, re-exported for those helpers. */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "admin" | "rider";
  createdAt?: string;
}

const CART_KEY = "smartbasket:cart";
const FAV_KEY = "smartbasket:favorites";

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

/*
 * localStorage acts as the external store. We cache the parsed value so
 * getSnapshot returns a stable reference (required by useSyncExternalStore),
 * and only swap the reference when something actually writes.
 */
let cartCache: CartLine[] = EMPTY_CART;
let favCache: Product[] = EMPTY_FAV;

function loadCaches() {
  cartCache = readRaw<CartLine[]>(CART_KEY, EMPTY_CART);
  favCache = readRaw<Product[]>(FAV_KEY, EMPTY_FAV);
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

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const favCount = favorites.length;

  return {
    cart,
    favorites,
    cartCount,
    favCount,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    toggleFavourite,
    isFavourite,
  };
}
