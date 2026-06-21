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
      <div className="text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
        <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
        <p className="mt-2 text-gray-500">We couldn&apos;t find that order.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="text-center border-b border-gray-100 pb-6">
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-gray-900">Order placed!</h1>
        <p className="mt-1 text-gray-500">
          Thank you, {order.customer.name}. Your order is confirmed.
        </p>
        <p className="mt-2 text-sm font-medium text-gray-700">Order ID: {order.id}</p>
      </div>

      {/* Items */}
      <div className="py-6 space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-gray-700">
              {item.name} × {item.quantity}
            </span>
            <span className="font-medium">Rs. {item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>Rs. {order.total}</span>
      </div>

      {/* Delivery */}
      <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-800">Delivering to</p>
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
        className="mt-6 block text-center rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white hover:bg-green-700"
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
