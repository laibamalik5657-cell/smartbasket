"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import type { Order } from "@/lib/store";
import { statusLabel, type OrderStatus } from "@/lib/tracking";
import { useAuthUser } from "@/lib/use-auth";
import { useAuthGet } from "@/lib/use-api";

export default function MyOrdersPage() {
  const user = useAuthUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center bg-card rounded-2xl shadow-sm border border-border p-12">
          <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
          <p className="mt-2 text-muted-foreground">
            Please sign in to view your orders.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
        <Suspense
          fallback={
            <p className="mt-8 text-center text-muted-foreground">
              Loading your orders…
            </p>
          }
        >
          <OrdersList />
        </Suspense>
      </div>
    </div>
  );
}

function OrdersList() {
  const data = useAuthGet<{ orders: Order[] }>("/orders");
  const orders = data?.orders ?? [];

  return (
    <>
      <p className="mt-1 text-muted-foreground">
        {orders.length === 0
          ? "You haven't placed any orders yet."
          : `${orders.length} order${orders.length === 1 ? "" : "s"} placed.`}
      </p>

      {orders.length === 0 ? (
        <div className="mt-8 text-center bg-card rounded-2xl shadow-sm border border-border p-12">
          <Package className="mx-auto mb-3 h-12 w-12 text-muted-foreground" aria-hidden="true" />
          <p className="text-muted-foreground">No orders to show.</p>
          <Link
            href="/items/see-more"
            className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/order-confirmation?id=${order.id}`}
              className="block bg-card rounded-2xl shadow-sm border border-border p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {order.id}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-700">
                  {statusLabel(((order as { status?: OrderStatus }).status ?? "pending"))}
                </span>
                <span className="text-sm font-bold text-foreground">
                  Rs. {order.total}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                  {order.items.reduce((n, i) => n + i.quantity, 0)} item
                  {order.items.reduce((n, i) => n + i.quantity, 0) === 1 ? "" : "s"}
                </span>
                <span>
                  {order.payment === "cod" ? "Cash on Delivery" : "Online Payment"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
