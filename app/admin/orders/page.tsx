"use client";

import { Suspense } from "react";
import Link from "next/link";
import apiClient from "@/lib/axios";
import { getToken } from "@/lib/utils";
import { useAuthUser } from "@/lib/use-auth";
import { useAuthGet } from "@/lib/use-api";

type AdminOrder = {
  id: string;
  total: number;
  status: "pending" | "assigned" | "out_for_delivery" | "delivered" | "cancelled";
  riderId: string | null;
  riderName: string | null;
  createdAt: string;
  customer: { name: string };
};
type Rider = { id: string; firstName: string; lastName: string };

const STATUS_STYLES: Record<AdminOrder["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  assigned: "bg-blue-100 text-blue-800",
  out_for_delivery: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrdersPage() {
  const user = useAuthUser();

  if (user && user.role !== "admin") {
    return <Denied />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">All Orders</h1>
        <Suspense fallback={<p className="mt-8 text-muted-foreground">Loading orders…</p>}>
          <OrdersTable />
        </Suspense>
      </div>
    </div>
  );
}

function Denied() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto text-center bg-card rounded-2xl border border-border p-12">
        <h1 className="text-2xl font-bold text-foreground">Admins only</h1>
        <p className="mt-2 text-muted-foreground">You do not have access to this page.</p>
        <Link href="/" className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark">
          Go home
        </Link>
      </div>
    </div>
  );
}

async function patchOrder(id: string, body: object) {
  try {
    await apiClient.patch(`/admin/orders/${id}`, body, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    window.location.reload();
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "Something went wrong. Please try again.";
    alert(message);
  }
}

function OrdersTable() {
  const ordersData = useAuthGet<{ orders: AdminOrder[] }>("/admin/orders");
  const ridersData = useAuthGet<{ riders: Rider[] }>("/admin/riders");
  const orders = ordersData?.orders ?? [];
  const riders = ridersData?.riders ?? [];

  if (orders.length === 0) {
    return <p className="mt-8 text-muted-foreground">No orders yet.</p>;
  }

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full text-sm bg-card rounded-2xl border border-border">
        <thead>
          <tr className="text-left text-muted-foreground border-b border-border">
            <th className="p-3">Order</th>
            <th className="p-3">Customer</th>
            <th className="p-3">Total</th>
            <th className="p-3">Status</th>
            <th className="p-3">Rider</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-border last:border-0">
              <td className="p-3 font-mono text-xs">{o.id.slice(-6)}</td>
              <td className="p-3">{o.customer.name}</td>
              <td className="p-3">Rs. {o.total}</td>
              <td className="p-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[o.status]}`}>
                  {o.status.replace(/_/g, " ")}
                </span>
              </td>
              <td className="p-3">{o.riderName ?? "—"}</td>
              <td className="p-3">
                {(o.status === "pending" || o.status === "assigned") ? (
                  <div className="flex items-center gap-2">
                    <select
                      defaultValue={o.riderId ?? ""}
                      onChange={(e) => {
                        if (e.target.value) patchOrder(o.id, { action: "assign", riderId: e.target.value });
                      }}
                      className="rounded border border-border px-2 py-1 text-xs"
                    >
                      <option value="">Assign rider…</option>
                      {riders.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.firstName} {r.lastName}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => patchOrder(o.id, { action: "cancel" })}
                      className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
