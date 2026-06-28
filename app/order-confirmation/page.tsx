"use client";

import { Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { useOrderTracking } from "@/lib/use-order";
import {
  STORE_COORD,
  destinationFor,
  deliveryProgress,
  type Coord,
} from "@/lib/tracking";
import StatusStepper from "./_components/StatusStepper";
import EtaBanner from "./_components/EtaBanner";

const DeliveryMap = dynamic(() => import("./_components/DeliveryMap"), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-xl bg-surface" />,
});

function Confirmation() {
  const params = useSearchParams();
  const id = params.get("id");
  const { order, loading, now } = useOrderTracking(id);

  // Stable coordinates for the map (recomputing would re-init the map each render).
  const destination = useMemo<Coord>(
    () => (order ? destinationFor(order) : STORE_COORD),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [order?.id],
  );

  if (loading) {
    return <p className="text-center text-gray-500 py-20">Loading…</p>;
  }

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

  const cancelled = order.status === "cancelled";
  const showMap = order.status === "assigned" || order.status === "out_for_delivery" || order.status === "delivered";
  const progress = deliveryProgress(order, now);

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
      <div className="text-center border-b border-border pb-6">
        {cancelled ? (
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-3" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="w-16 h-16 text-brand mx-auto mb-3" aria-hidden="true" />
        )}
        <h1 className="text-2xl font-bold text-foreground">
          {cancelled ? "Order cancelled" : "Order placed!"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {cancelled
            ? "This order was cancelled."
            : `Thank you, ${order.customer.name}. Your order is confirmed.`}
        </p>
        <p className="mt-2 text-sm font-medium text-foreground">Order ID: {order.id}</p>
      </div>

      {/* Live tracker */}
      {!cancelled && (
        <div className="py-6 space-y-5 border-b border-border">
          <StatusStepper status={order.status} />
          <EtaBanner order={order} now={now} />
          {showMap && (
            <DeliveryMap
              store={STORE_COORD}
              destination={destination}
              progress={progress}
              status={order.status}
            />
          )}
        </div>
      )}

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
          <span>Rs. {order.subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery</span>
          <span>Rs. {order.shipping}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
          <span>Total</span>
          <span>Rs. {order.total}</span>
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
          Payment: {order.payment === "cod" ? "Cash on Delivery" : "Online Payment"}
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
