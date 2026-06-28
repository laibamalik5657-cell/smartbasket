# Navbar auth user icon — Design

**Date:** 2026-06-21  
**Status:** Approved

## Goal

After a user logs in (or signs up), the navbar should replace the "Sign In / Sign Up" buttons with a dropdown showing the user's first name. The dropdown gives access to account-related pages and a logout action. Mobile menu behaves the same way.

## Decisions from brainstorming

- **State approach:** Extend the existing `lib/store.tsx` localStorage-backed store (Option 1).
- **Auth entry points:** Keep the existing `/login` and `/signup` pages.
- **Signup behavior:** Automatically log the user in after successful registration.
- **Dropdown scope:** Full dropdown — all links go to real pages and logout clears the session.
- **Mobile behavior:** Same dropdown inside the hamburger menu.

## Data model

Add a `User` type to `lib/store.tsx`:

```ts
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}
```

Persist under `localStorage` key `smartbasket:user`.

## Store changes (`lib/store.tsx`)

- Add `userCache: User | null` and `USER_KEY`.
- Add `setUser(user: User | null)` — writes to `localStorage`, updates cache, emits listeners.
- Add `clearUser()` convenience alias for `setUser(null)`.
- Expose `user` and `isAuthenticated = !!user` from `useStore()`.
- Keep the existing `useSyncExternalStore` pattern; server snapshot returns `null`.

## Auth flow changes

### Login (`app/login/page.tsx`)

After a successful `apiClient.post("/auth/login", values)`:

1. Read `response.data.user`.
2. Call `setUser(user)` from `useStore()`.
3. Show success message and redirect to `/`.

### Signup (`app/signup/page.tsx`)

Two acceptable implementations (choose simplest that works):

1. **Preferred:** Update `/api/auth/register` to return the created user object, then call `setUser(user)` and redirect home.
2. **Fallback:** After successful registration, immediately call `/auth/login` with the same credentials, read the user, call `setUser(user)`, and redirect home.

### Logout

A dropdown item calls `clearUser()` and navigates to `/`.

## Navbar changes (`components/Navbar.tsx`)

- Read `user` and `clearUser` from `useStore()`.
- If `user` exists (desktop):
  - Replace "Sign In / Sign Up" with a `DropdownMenu` trigger button showing `user.firstName` + `ChevronDown` icon.
  - Dropdown content:
    - Label: avatar icon + "Welcome back, [firstName] [lastName]"
    - Items:
      - My Orders → `/my-orders`
      - Payments → `/payments`
      - Profile → `/profile`
    - Separator
    - Logout (destructive style)
- If no user (desktop):
  - Keep existing "Sign In" and "Sign Up" links.
- Mobile hamburger menu mirrors the same logic.

Use the project's existing shadcn/ui `DropdownMenu` component if available; otherwise add it.

## New account pages

Create minimal client-side pages that read from `useStore()`:

- `app/my-orders/page.tsx` — list placed orders from the store (reuses order shape).
- `app/payments/page.tsx` — simple placeholder page for payment methods.
- `app/profile/page.tsx` — display user's name/email and provide a logout button.

## Error handling and edge cases

- Corrupt `localStorage` falls back to `null` via the existing `readRaw` helper.
- Logout clears only user state; cart/favorites/orders remain untouched.
- Auth API errors keep their existing behavior; the navbar simply renders the unauthenticated state.

## Testing

- `pnpm lint` must pass.
- `pnpm build` must pass.
- Manual check:
  1. Log in — navbar shows user dropdown.
  2. Click dropdown items — navigate to correct pages.
  3. Log out — navbar returns to Sign In / Sign Up.
  4. Sign up — user is logged in immediately.
  5. Refresh page — logged-in navbar persists.

## Files touched

- `lib/store.tsx`
- `app/login/page.tsx`
- `app/signup/page.tsx`
- `app/api/auth/register/route.ts` (optional, if returning user)
- `components/Navbar.tsx`
- `app/my-orders/page.tsx` (new)
- `app/payments/page.tsx` (new)
- `app/profile/page.tsx` (new)
- `components/ui/dropdown-menu.tsx` (if not present)
