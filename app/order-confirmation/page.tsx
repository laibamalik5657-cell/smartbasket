"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useStore } from "@/lib/store";

function Confirmation() {
  const params = useSearchParams();
  const id = params.get("id");
  const { getOrder } = useStore();

  const order = id ? getOrder(id) : undefined;

  if (!order) {
    return (
      <div className="text-center bg-card rounded-2xl shadow-sm border border-border p-12">
        <h1 className="text-2xl font-bold text-foreground">Order not found</h1>
        <p className="mt-2 text-muted-foreground">We couldn&apos;t find that order.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
        >
          Back to home
        </Link>
      </div>
    );
  }

  // Legacy orders saved before the shipping/total update may be missing these fields.
  const subtotal =
    order.subtotal ??
    order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping =
    order.shipping ??
    (subtotal > 500 || subtotal === 0 ? 0 : 50);
  const total = order.total ?? subtotal + shipping;

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
      <div className="text-center border-b border-border pb-6">
        <CheckCircle2 className="w-16 h-16 text-brand mx-auto mb-3" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-foreground">Order placed!</h1>
        <p className="mt-1 text-muted-foreground">
          Thank you, {order.customer.name}. Your order is confirmed.
        </p>
        <p className="mt-2 text-sm font-medium text-foreground">Order ID: {order.id}</p>
      </div>

      {/* Items */}
      <div className="py-6 space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-foreground">
              {item.name} × {item.quantity}
            </span>
            <span className="font-medium">Rs. {item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-border pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Items</span>
          <span>Rs. {subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery</span>
          <span>Rs. {shipping}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
          <span>Total</span>
          <span>Rs. {total}</span>
        </div>
      </div>

      {/* Delivery */}
      <div className="mt-6 rounded-lg bg-surface p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Delivering to</p>
        <p className="mt-1">
          {order.customer.address}, {order.customer.area}, {order.customer.city}
        </p>
        <p>Phone: {order.customer.phone}</p>
        <p className="mt-2">
          Payment:{" "}
          {order.payment === "cod" ? "Cash on Delivery" : "Online Payment"}
        </p>
      </div>

      <Link
        href="/items/see-more"
        className="mt-6 block text-center rounded-lg bg-brand px-5 py-3 text-sm font-medium text-white hover:bg-brand-dark"
      >
        Continue shopping
      </Link>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <Suspense fallback={<p className="text-center text-gray-500 py-20">Loading…</p>}>
          <Confirmation />
        </Suspense>
      </div>
    </div>
  );
}
