# Cart & Order Flow — Design Spec

## Goal
Fix the `/cart` page so a user can reliably add products, review the cart, enter delivery details, and place a Cash-on-Delivery order that shows the correct total on the confirmation page.

## Current State
- Cart state lives in `localStorage` via `lib/store.tsx`.
- `/cart` displays items, allows quantity changes and removal, and has a checkout form.
- `placeOrder` saves an order to `localStorage` and clears the cart.
- The order confirmation page (`/order-confirmation`) reads the order by ID.

## Problems Found
1. **Wrong order total:** `placeOrder` only stores the item subtotal. The cart UI adds a Rs. 50 delivery fee when subtotal < Rs. 500, so the confirmation page shows an incorrect final total.
2. **Broken online-payment option:** the checkout UI shows “Online Payment – Upload proof” but has no upload input or handling.
3. **Inconsistent styling:** `/cart` uses ad-hoc `gray-*` / `green-600` colors instead of the project’s Tailwind design tokens.
4. **Weak validation:** checkout inputs only check for non-empty strings.

## Proposed Changes (Approach A)

### 1. Correct order total
- Compute shipping in `lib/store.tsx` the same way the cart UI does:
  - `shipping = subtotal > 500 || subtotal === 0 ? 0 : 50`
  - `total = subtotal + shipping`
- Store `shipping` and `total` on the `Order` object.
- Update `app/order-confirmation/page.tsx` to display `shipping` and `total`.

### 2. Fix online-payment option
- Disable the “Online Payment” radio button.
- Label it “Online Payment (coming soon)”.
- Keep “Cash on Delivery” as the only selectable method.

### 3. Improve checkout validation
- Trim all fields.
- Require phone to be at least 10 digits (digits only).
- Show a single inline error message when validation fails.

### 4. Styling consistency
- Replace hard-coded `green-600` / `gray-100` classes in `/cart` with project tokens: `bg-brand`, `bg-surface`, `text-foreground`, `border`, `ring-brand`, etc.
- Keep the layout and behavior the same; only colors/spacing align with the rest of the site.

### 5. Manual verification
After the changes:
1. Add one or more products from `/items/see-more` or the home page.
2. Open `/cart` and confirm items, quantities, and totals render correctly.
3. Click **Checkout**, fill the delivery form, and click **Place Order**.
4. Confirm redirect to `/order-confirmation?id=...` with the correct order total (including shipping when applicable).
5. Confirm the cart icon in the navbar shows `0` after the order is placed.

## Out of Scope
- Backend order persistence (MongoDB order model/API).
- Real payment gateway integration.
- User authentication for checkout.

## Files to Modify
- `lib/store.tsx`
- `app/cart/page.tsx`
- `app/order-confirmation/page.tsx`
