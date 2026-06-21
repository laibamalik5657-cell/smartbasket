# Navbar auth user icon — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After login or signup, show the user's first name in the navbar with a dropdown menu for My Orders, Payments, Profile, and Logout; unauthenticated users still see Sign In / Sign Up.

**Architecture:** Extend the existing `lib/store.tsx` localStorage-backed store with a `User` slice, then wire the login/signup pages to save the returned user, update `components/Navbar.tsx` to read that state, and add minimal account pages for the dropdown links.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui (DropdownMenu, Button), lucide-react, pnpm.

---

## File structure

| File | Action | Responsibility |
| --- | --- | --- |
| `.gitignore` | Modify | Ignore brainstorm artifacts in `.superpowers/` |
| `lib/store.tsx` | Modify | Add `User` type, user cache, `setUser`/`clearUser`, expose `user`/`isAuthenticated` |
| `app/login/page.tsx` | Modify | Save returned user to store before redirecting home |
| `app/signup/page.tsx` | Modify | Save returned user to store (auto-login) before redirecting home |
| `components/ui/dropdown-menu.tsx` | Create | shadcn DropdownMenu primitive |
| `components/Navbar.tsx` | Modify | Show user dropdown when authenticated; keep Sign In/Sign Up otherwise |
| `app/my-orders/page.tsx` | Create | List placed orders from the store |
| `app/payments/page.tsx` | Create | Simple payment methods placeholder |
| `app/profile/page.tsx` | Create | Show user info and logout button |

---

### Task 1: Ignore brainstorm artifacts

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add `.superpowers/` to `.gitignore`**

Append this line to `.gitignore`:

```gitignore
# brainstorming mockups
.superpowers/
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore superpowers brainstorm artifacts"
```

---

### Task 2: Add user state to the store

**Files:**
- Modify: `lib/store.tsx`

- [ ] **Step 1: Add the `User` interface and key**

Insert the `User` interface right after the `Order` interface, and add a `USER_KEY` constant with the other keys:

```ts
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const CART_KEY = "smartbasket:cart";
const FAV_KEY = "smartbasket:favorites";
const ORDERS_KEY = "smartbasket:orders";
const USER_KEY = "smartbasket:user";
```

- [ ] **Step 2: Add user cache and loader**

Add a user cache variable and load it inside `loadCaches()`:

```ts
let cartCache: CartLine[] = EMPTY_CART;
let favCache: Product[] = EMPTY_FAV;
let ordersCache: Order[] = EMPTY_ORDERS;
let userCache: User | null = null;

function loadCaches() {
  cartCache = readRaw<CartLine[]>(CART_KEY, EMPTY_CART);
  favCache = readRaw<Product[]>(FAV_KEY, EMPTY_FAV);
  ordersCache = readRaw<Order[]>(ORDERS_KEY, EMPTY_ORDERS);
  userCache = readRaw<User | null>(USER_KEY, null);
}
```

- [ ] **Step 3: Add user setter**

Add `setUser` next to the other setters:

```ts
function setUser(next: User | null) {
  userCache = next;
  persist(USER_KEY, next);
  emit();
}
```

- [ ] **Step 4: Expose user from `useStore()`**

Inside `useStore()`, add:

```ts
const user = useSyncExternalStore(
  subscribe,
  () => userCache,
  () => null,
);

const setUserCallback = useCallback((next: User | null) => {
  setUser(next);
}, []);

const clearUser = useCallback(() => setUser(null), []);

const isAuthenticated = !!user;
```

Then include them in the returned object:

```ts
return {
  cart,
  favorites,
  orders,
  user,
  isAuthenticated,
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
  setUser: setUserCallback,
  clearUser,
};
```

- [ ] **Step 5: Verify types**

Run:

```bash
pnpm tsc --noEmit
```

Expected: no TypeScript errors in `lib/store.tsx`.

- [ ] **Step 6: Commit**

```bash
git add lib/store.tsx
git commit -m "feat(store): add localStorage-backed user session"
```

---

### Task 3: Save user on login

**Files:**
- Modify: `app/login/page.tsx`

- [ ] **Step 1: Import `useStore`**

Add to existing imports:

```ts
import { useStore } from "@/lib/store";
```

Inside the component, add:

```ts
const { setUser } = useStore();
```

- [ ] **Step 2: Capture the API response and save the user**

Change the submit handler from:

```ts
await apiClient.post("/auth/login", values);
```

to:

```ts
const response = await apiClient.post("/auth/login", values);
if (response.data?.user) {
  setUser(response.data.user);
}
```

The full handler should look like:

```ts
async function onSubmit(values: LoginInput) {
  setMessage(null);
  try {
    const response = await apiClient.post("/auth/login", values);
    if (response.data?.user) {
      setUser(response.data.user);
    }
    setMessage({ type: "success", text: "Signed in successfully." });
    router.push("/");
  } catch (err) {
    const text = isAxiosError(err)
      ? err.response?.data?.message || "Sign in failed."
      : "Something went wrong. Please try again.";
    setMessage({ type: "error", text });
  }
}
```

- [ ] **Step 3: Verify lint**

Run:

```bash
pnpm lint
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add app/login/page.tsx
git commit -m "feat(login): persist user session after successful login"
```

---

### Task 4: Auto-login on signup

**Files:**
- Modify: `app/signup/page.tsx`

- [ ] **Step 1: Import `useStore`**

Add to existing imports:

```ts
import { useStore } from "@/lib/store";
```

Inside the component, add:

```ts
const { setUser } = useStore();
```

- [ ] **Step 2: Save returned user and redirect**

Change the submit handler from:

```ts
await apiClient.post("/auth/register", {
  firstName: values.firstName,
  lastName: values.lastName,
  email: values.email,
  password: values.password,
});
setMessage({ type: "success", text: "Account created successfully." });
router.push("/");
```

to:

```ts
const response = await apiClient.post("/auth/register", {
  firstName: values.firstName,
  lastName: values.lastName,
  email: values.email,
  password: values.password,
});
if (response.data?.user) {
  setUser(response.data.user);
}
setMessage({ type: "success", text: "Account created successfully." });
router.push("/");
```

- [ ] **Step 3: Verify lint**

Run:

```bash
pnpm lint
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add app/signup/page.tsx
git commit -m "feat(signup): auto-login after successful registration"
```

---

### Task 5: Add DropdownMenu component

**Files:**
- Create: `components/ui/dropdown-menu.tsx`

- [ ] **Step 1: Install via shadcn CLI**

Run:

```bash
pnpm dlx shadcn@latest add dropdown-menu --yes --overwrite
```

Expected: `components/ui/dropdown-menu.tsx` is created or updated.

- [ ] **Step 2: Verify it exports the required parts**

Open `components/ui/dropdown-menu.tsx` and confirm it exports:

- `DropdownMenu`
- `DropdownMenuTrigger`
- `DropdownMenuContent`
- `DropdownMenuItem`
- `DropdownMenuLabel`
- `DropdownMenuSeparator`

- [ ] **Step 3: Commit**

```bash
git add components/ui/dropdown-menu.tsx pnpm-lock.yaml package.json
git commit -m "chore: add shadcn dropdown-menu component"
```

---

### Task 6: Update Navbar with user dropdown

**Files:**
- Modify: `components/Navbar.tsx`

- [ ] **Step 1: Add imports**

Add these imports at the top:

```ts
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, Package, CreditCard, User } from "lucide-react";
```

- [ ] **Step 2: Read user state and logout helper**

Inside the component, replace:

```ts
const pathname = usePathname();
const [open, setOpen] = useState(false);
const { cartCount, favCount } = useStore();
```

with:

```ts
const pathname = usePathname();
const router = useRouter();
const [open, setOpen] = useState(false);
const { cartCount, favCount, user, clearUser } = useStore();
const isAuthenticated = !!user;

function handleLogout() {
  clearUser();
  router.push("/");
}
```

- [ ] **Step 3: Replace desktop auth links with user dropdown**

Replace the desktop "Sign In / Sign Up" block (the two `<Link>` elements inside the `hidden md:flex` actions div) with:

```tsx
{isAuthenticated ? (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="sm"
        className="hidden sm:flex items-center gap-1"
      >
        <span className="text-sm font-medium">{user?.firstName}</span>
        <ChevronDown className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel className="font-normal">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10">
            <User className="h-4 w-4 text-brand" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-medium">Welcome back,</p>
            <p className="text-sm font-semibold truncate max-w-[140px]">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => router.push("/my-orders")}>
        <Package className="mr-2 h-4 w-4" />
        My Orders
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => router.push("/payments")}>
        <CreditCard className="mr-2 h-4 w-4" />
        Payments
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => router.push("/profile")}>
        <User className="mr-2 h-4 w-4" />
        Profile
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={handleLogout}
        className="text-red-600 focus:text-red-600 focus:bg-red-50"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
) : (
  <>
    <Link
      href="/login"
      className="ml-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand hover:text-brand"
    >
      Sign In
    </Link>
    <Link
      href="/signup"
      className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
    >
      Sign Up
    </Link>
  </>
)}
```

- [ ] **Step 4: Update mobile menu auth block**

Replace the mobile "Sign In / Sign Up" block inside `{open && (...)}` with:

```tsx
{isAuthenticated ? (
  <div className="space-y-1 border-t border-border pt-3">
    <div className="flex items-center gap-2 px-3 py-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10">
        <User className="h-4 w-4 text-brand" />
      </div>
      <div>
        <p className="text-sm font-medium">Welcome back,</p>
        <p className="text-sm font-semibold">
          {user?.firstName} {user?.lastName}
        </p>
      </div>
    </div>
    <Link
      href="/my-orders"
      onClick={() => setOpen(false)}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-surface"
    >
      <Package className="h-4 w-4" />
      My Orders
    </Link>
    <Link
      href="/payments"
      onClick={() => setOpen(false)}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-surface"
    >
      <CreditCard className="h-4 w-4" />
      Payments
    </Link>
    <Link
      href="/profile"
      onClick={() => setOpen(false)}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-surface"
    >
      <User className="h-4 w-4" />
      Profile
    </Link>
    <button
      onClick={() => {
        handleLogout();
        setOpen(false);
      }}
      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </button>
  </div>
) : (
  <div className="flex gap-2 pt-2">
    <Link
      href="/login"
      onClick={() => setOpen(false)}
      className="flex-1 rounded-md border border-border px-3 py-2 text-center text-sm font-medium text-foreground"
    >
      Sign In
    </Link>
    <Link
      href="/signup"
      onClick={() => setOpen(false)}
      className="flex-1 rounded-md bg-brand px-3 py-2 text-center text-sm font-medium text-white"
    >
      Sign Up
    </Link>
  </div>
)}
```

- [ ] **Step 5: Verify lint**

Run:

```bash
pnpm lint
```

Expected: no new errors.

- [ ] **Step 6: Commit**

```bash
git add components/Navbar.tsx
git commit -m "feat(navbar): show user dropdown when authenticated"
```

---

### Task 7: Create My Orders page

**Files:**
- Create: `app/my-orders/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { Package } from "lucide-react";

export default function MyOrdersPage() {
  const { orders } = useStore();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        View all your placed orders.
      </p>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-white p-8 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No orders yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You haven&apos;t placed any orders yet.
          </p>
          <Link
            href="/items/see-more"
            className="mt-4 inline-block rounded-full bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-border bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {order.id}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm font-bold text-brand">
                  Rs. {order.total.toFixed(2)}
                </p>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.name} x{item.quantity} — Rs.{" "}
                    {(item.price * item.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/my-orders/page.tsx
git commit -m "feat(my-orders): add order history page"
```

---

### Task 8: Create Payments page

**Files:**
- Create: `app/payments/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
"use client";

import { CreditCard } from "lucide-react";

export default function PaymentsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-foreground">Payments</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your payment methods.
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-white p-8 text-center">
        <CreditCard className="mx-auto h-10 w-10 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">No payment methods saved</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Payment method management is coming soon.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/payments/page.tsx
git commit -m "feat(payments): add payments placeholder page"
```

---

### Task 9: Create Profile page

**Files:**
- Create: `app/profile/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
"use client";

import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export default function ProfilePage() {
  const router = useRouter();
  const { user, clearUser } = useStore();

  function handleLogout() {
    clearUser();
    router.push("/");
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <h1 className="text-2xl font-bold">Not signed in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please sign in to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-foreground">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your account details.
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
            <User className="h-8 w-8 text-brand" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex justify-between border-b border-border pb-3">
            <span className="text-sm text-muted-foreground">First Name</span>
            <span className="text-sm font-medium">{user.firstName}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-3">
            <span className="text-sm text-muted-foreground">Last Name</span>
            <span className="text-sm font-medium">{user.lastName}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-3">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium">{user.email}</span>
          </div>
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="mt-6 w-full gap-2 text-red-600 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/profile/page.tsx
git commit -m "feat(profile): add profile page with logout"
```

---

### Task 10: Final verification

**Files:**
- All modified/created files

- [ ] **Step 1: Run lint**

```bash
pnpm lint
```

Expected: no errors (existing img warnings may remain).

- [ ] **Step 2: Run build**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 3: Manual smoke test checklist**

1. Start dev server: `pnpm dev`
2. Log in with demo credentials — navbar shows first name dropdown.
3. Click each dropdown item — navigates to `/my-orders`, `/payments`, `/profile`.
4. Click Logout — navbar returns to Sign In / Sign Up.
5. Sign up with a new email — navbar shows the new user's first name immediately.
6. Refresh the page — logged-in navbar persists.

- [ ] **Step 4: Final commit**

```bash
git commit -m "feat(auth): navbar reflects login state with user dropdown" --allow-empty
```

---

## Self-review checklist

1. **Spec coverage:**
   - User state in store ✅ Task 2
   - Login saves user ✅ Task 3
   - Signup auto-login ✅ Task 4
   - Navbar dropdown ✅ Task 6
   - My Orders / Payments / Profile pages ✅ Tasks 7–9
   - Logout ✅ Task 6 + Task 9
   - Mobile menu ✅ Task 6
   - Persistence across refresh ✅ Task 2

2. **Placeholder scan:** No TBD/TODO/fill-in-details found.

3. **Type consistency:** `User` type defined once in `lib/store.tsx` and reused via `useStore()` everywhere. API routes already return the same user shape.
