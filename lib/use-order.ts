"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/axios";
import { getToken } from "@/lib/utils";
import type { TrackedOrder } from "@/lib/tracking";

/*
 * Live order tracking: initial authenticated GET of /orders/[id], then poll
 * every 10s until a terminal status, plus a 1s `now` ticker that drives the ETA
 * countdown and rider-marker animation between polls.
 *
 * Every setState here runs inside an async callback (fetch .then/finally, or a
 * timer callback) — never synchronously in an effect body — so it stays clear
 * of this repo's `react-hooks/set-state-in-effect` error.
 */
export function useOrderTracking(id: string | null): {
  order: TrackedOrder | null;
  loading: boolean;
  now: number;
} {
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(!!id);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!id) return;
    let active = true;
    const pollRef: { id?: ReturnType<typeof setInterval> } = {};
    const token = getToken();

    async function fetchOrder() {
      try {
        const res = await apiClient.get(`/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!active) return;
        const o = res.data?.order as TrackedOrder | undefined;
        setOrder(o ?? null);
        if (o && (o.status === "delivered" || o.status === "cancelled") && pollRef.id) {
          clearInterval(pollRef.id);
        }
      } catch {
        if (active) setOrder(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchOrder();
    pollRef.id = setInterval(fetchOrder, 10000);
    return () => {
      active = false;
      if (pollRef.id) clearInterval(pollRef.id);
    };
  }, [id]);

  useEffect(() => {
    const ticker = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(ticker);
  }, []);

  return { order, loading, now };
}
