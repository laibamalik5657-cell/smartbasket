# Cart & Order Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the `/cart` checkout flow so orders show the correct total (including shipping), only Cash on Delivery is selectable, and the page matches the site design tokens.

**Architecture:** Keep the existing module-level `localStorage` store in `lib/store.tsx`. Update the `Order` shape to include shipping and compute the same total shown in the cart UI. Patch `/cart` for validation, disabled online payment, and token-based styling. Update `/order-confirmation` to show the new shipping/total lines.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, `lucide-react`, `localStorage`.

---

### Task 1: Compute shipping + total in the store

**Files:**
- Modify: `lib/store.tsx:27-34`
- Modify: `lib/store.tsx:177-199`

- [ ] **Step 1: Add `shipping` to the `Order` interface**

```typescript
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
```

- [ ] **Step 2: Update `placeOrder` to compute and store shipping/total**

Replace the body of `placeOrder` with:

```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add lib/store.tsx
git commit -m "fix(store): include shipping in order total"
```

---

### Task 2: Show shipping/total on order confirmation

**Files:**
- Modify: `app/order-confirmation/page.tsx:54-58`

- [ ] **Step 1: Replace the totals block**

Replace:

```tsx
<div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-lg">
  <span>Total</span>
  <span>Rs. {order.total}</span>
</div>
```

with:

```tsx
<div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
  <div className="flex justify-between">
    <span className="text-gray-600">Items</span>
    <span>Rs. {order.subtotal}</span>
  </div>
  <div className="flex justify-between">
    <span className="text-gray-600">Delivery</span>
    <span>Rs. {order.shipping}</span>
  </div>
  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
    <span>Total</span>
    <span>Rs. {order.total}</span>
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add app/order-confirmation/page.tsx
git commit -m "fix(order-confirmation): display shipping and item subtotal"
```

---

### Task 3: Fix checkout form in `/cart`

**Files:**
- Modify: `app/cart/page.tsx:31-45`
- Modify: `app/cart/page.tsx:118-148`
- Modify: `app/cart/page.tsx:194-263` (styling only)

- [ ] **Step 1: Tighten validation and disable online payment**

Replace `handlePlaceOrder` with:

```typescript
const handlePlaceOrder = () => {
  const trimmed = {
    name: customer.name.trim(),
    phone: customer.phone.trim(),
    city: customer.city.trim(),
    area: customer.area.trim(),
    address: customer.address.trim(),
  };

  if (
    !trimmed.name ||
    !trimmed.phone ||
    !trimmed.city ||
    !trimmed.area ||
    !trimmed.address
  ) {
    setError("Please fill in all delivery details.");
    return;
  }

  if (!/^\d{10,}$/.test(trimmed.phone)) {
    setError("Please enter a valid 10-digit phone number.");
    return;
  }

  setError("");
  const order = placeOrder({ payment, customer: trimmed });
  router.push(`/order-confirmation?id=${order.id}`);
};
```

- [ ] **Step 2: Disable the online-payment option**

Replace the online-payment label block in the Payment Method section with:

```tsx
<label className="flex items-center justify-between border rounded-lg p-4 opacity-60 cursor-not-allowed">
  <div>
    <p className="font-medium">Online Payment</p>
    <p className="text-sm text-gray-500">Coming soon</p>
  </div>
  <input
    type="radio"
    name="payment"
    value="online"
    checked={payment === "online"}
    onChange={(e) => setPayment(e.target.value)}
    disabled
  />
</label>
```

- [ ] **Step 3: Align styling with design tokens**

Update the tailwind classes in the cart/checkout markup:
- `bg-gray-50` → `bg-surface`
- `bg-gray-100` (page/checkout background) → `bg-surface`
- `bg-green-600` buttons → `bg-brand hover:bg-brand-dark`
- `text-green-600` → `text-brand`
- `focus:border-green-600` inputs → `focus:border-brand focus:ring-1 focus:ring-brand`
- `border-gray-100` / `border-gray-200` → `border-border`
- `text-gray-500` descriptions → `text-muted`
- `text-gray-900` headings → `text-foreground`
- Keep `text-red-500` / `text-red-600` for errors.

- [ ] **Step 4: Commit**

```bash
git add app/cart/page.tsx
git commit -m "fix(cart): disable online payment, validate phone, use design tokens"
```

---

### Task 4: Verify the end-to-end flow

- [ ] **Step 1: Run the linter**

```bash
pnpm lint
```

Expected: 0 errors (existing warnings may remain).

- [ ] **Step 2: Manual browser walkthrough**

1. Open `http://localhost:3000/items/see-more` and click **Add** on 1–2 products.
2. Click the cart icon and confirm the items, quantities, and totals are correct.
3. Click **Checkout**, fill all fields with a 10-digit phone number, and click **Place Order**.
4. Confirm redirect to `/order-confirmation?id=ORD-...` and that the total includes delivery fee when subtotal < Rs. 500.
5. Confirm the navbar cart badge resets to `0`.

- [ ] **Step 3: Commit verification notes (optional)**

```bash
git commit --allow-empty -m "verify: cart order flow passes manual walkthrough"
```
