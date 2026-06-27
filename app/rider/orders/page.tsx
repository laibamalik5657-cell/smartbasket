"use client";

import { Suspense } from "react";
import Link from "next/link";
import apiClient from "@/lib/axios";
import { getToken } from "@/lib/utils";
import { useAuthUser } from "@/lib/use-auth";
import { useAuthGet } from "@/lib/use-api";

type RiderOrder = {
  id: string;
  total: number;
  status: "pending" | "assigned" | "delivered" | "cancelled";
  createdAt: string;
  customer: { name: string; phone: string; city: string; area: string; address: string };
};

export default function RiderOrdersPage() {
  const user = useAuthUser();
  if (user && user.role !== "rider") {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center bg-card rounded-2xl border border-border p-12">
          <h1 className="text-2xl font-bold text-foreground">Riders only</h1>
          <Link href="/" className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">My Deliveries</h1>
        <Suspense fallback={<p className="mt-8 text-muted-foreground">Loading deliveries…</p>}>
          <DeliveriesList />
        </Suspense>
      </div>
    </div>
  );
}

async function markDelivered(id: string) {
  await apiClient.patch(`/rider/orders/${id}`, {}, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  window.location.reload();
}

function DeliveriesList() {
  const data = useAuthGet<{ orders: RiderOrder[] }>("/rider/orders");
  const orders = data?.orders ?? [];

  if (orders.length === 0) {
    return <p className="mt-8 text-muted-foreground">No deliveries assigned to you.</p>;
  }

  return (
    <div className="mt-6 space-y-4">
      {orders.map((o) => (
        <div key={o.id} className="bg-card rounded-2xl border border-border p-5">
          <div className="flex justify-between">
            <span className="font-medium text-foreground">{o.customer.name}</span>
            <span className="font-bold text-foreground">Rs. {o.total}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{o.customer.phone}</p>
          <p className="text-sm text-muted-foreground">
            {o.customer.address}, {o.customer.area}, {o.customer.city}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Status: {o.status}</span>
            {o.status === "assigned" && (
              <button
                onClick={() => markDelivered(o.id)}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Mark delivered
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
