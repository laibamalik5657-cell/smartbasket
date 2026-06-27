"use client";

import { use, useState } from "react";
import apiClient from "@/lib/axios";
import { getToken } from "@/lib/utils";

/*
 * Suspense-based authenticated GET.
 *
 * Why this and not useEffect+useState: this repo's ESLint forbids
 * `set-state-in-effect`, so fetch-on-mount is done with React 19's `use()`
 * instead. The request promise is created once per mount via useState's
 * initializer (stable across re-renders), and `use()` unwraps it under the
 * nearest <Suspense> boundary.
 *
 * SSR / logged-out are handled by resolving to null (the server can't read the
 * localStorage token, and there's nothing to fetch without one). Call this
 * inside a component wrapped in <Suspense>.
 */
export function useAuthGet<T>(url: string): T | null {
  const [promise] = useState<Promise<T | null>>(() => {
    if (typeof window === "undefined" || !url || !getToken()) {
      return Promise.resolve(null);
    }
    return apiClient
      .get(url, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((res) => res.data as T)
      .catch(() => null);
  });

  return use(promise);
}
