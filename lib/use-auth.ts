"use client";

import { useSyncExternalStore } from "react";
import { getToken } from "@/lib/utils";
import { userFromToken } from "@/lib/decode-jwt";
import type { User } from "@/lib/store";

/*
 * Reactive read of the signed-in user, derived from the JWT in localStorage.
 *
 * Why a hook (and not just `userFromToken(getToken())` inline): this repo's
 * ESLint forbids the "load from localStorage in useEffect" pattern, and reading
 * localStorage during render breaks hydration. useSyncExternalStore solves
 * both — getServerSnapshot returns null (the server can't read localStorage),
 * so SSR and the first client render agree, then it syncs to the real token.
 *
 * Same-tab login/logout do a full-page navigation, so the fresh load re-reads
 * the token; the "storage" listener keeps other tabs in sync too.
 */
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function useAuthUser(): User | null {
  const token = useSyncExternalStore(subscribe, getToken, () => null);
  return token ? userFromToken(token) : null;
}
