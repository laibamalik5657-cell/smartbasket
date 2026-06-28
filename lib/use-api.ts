"use client";

import { use, useEffect } from "react";
import apiClient from "@/lib/axios";
import { getToken } from "@/lib/utils";

/*
 * Suspense-based authenticated GET.
 *
 * Why this and not useEffect+useState: this repo's ESLint forbids
 * `set-state-in-effect`, so fetch-on-mount is done with React 19's `use()`.
 *
 * `use()` requires a STABLE promise. A component that suspends on its first
 * render never commits, so React re-runs it from scratch on every Suspense
 * retry — which means a promise created in render (or a useState initializer)
 * is recreated on each retry, firing an endless stream of identical requests.
 * So we cache the promise in module scope keyed by token+url: retries reuse the
 * one promise (resolve once → commit, no loop). The entry is evicted on unmount
 * so a later visit refetches; full-page reloads (the app's post-mutation
 * pattern) clear the whole module cache anyway.
 *
 * SSR / logged-out resolve to a shared null promise (the server can't read the
 * localStorage token, and there's nothing to fetch without one). Call this
 * inside a component wrapped in <Suspense>.
 */
const NULL_RESULT: Promise<null> = Promise.resolve(null);
const cache = new Map<string, Promise<unknown>>();

function cacheKey(token: string, url: string): string {
  return `${token}:${url}`;
}

function requestPromise<T>(url: string): Promise<T | null> {
  const token = typeof window === "undefined" ? "" : getToken() ?? "";
  if (!token || !url) {
    return NULL_RESULT;
  }
  const key = cacheKey(token, url);
  let promise = cache.get(key) as Promise<T | null> | undefined;
  if (!promise) {
    promise = apiClient
      .get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.data as T)
      .catch(() => null);
    cache.set(key, promise);
  }
  return promise;
}

export function useAuthGet<T>(url: string): T | null {
  const result = use(requestPromise<T>(url));

  // Evict on unmount so a later mount refetches. Cleanup-only effect — no
  // setState, so it doesn't trip `react-hooks/set-state-in-effect`. Effects run
  // only after commit, i.e. after the suspense cycle settled, so this never
  // races the retry loop the cache exists to prevent.
  useEffect(() => {
    const key = cacheKey(getToken() ?? "", url);
    return () => {
      cache.delete(key);
    };
  }, [url]);

  return result;
}
