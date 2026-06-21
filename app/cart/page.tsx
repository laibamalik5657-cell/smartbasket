"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQty, removeFromCart, placeOrder } = useStore();

  const [checkout, setCheckout] = useState(false);
  const [payment, setPayment] = useState("cod");
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    city: "",
    area: "",
    address: "",
  });
  const [error, setError] = useState("");

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 500 || subtotal === 0 ? 0 : 50;
  const total = subtotal + shipping;

  const setField = (field: keyof typeof customer, value: string) =>
    setCustomer((prev) => ({ ...prev, [field]: value }));

  const handlePlaceOrder = () => {
    const trimmed = {
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      city: customer.city.trim(),
      area: customer.area.trim(),
      address: customer.address.trim(),
    };

    if (
      !trimmed.name ||
      !trimmed.phone ||
      !trimmed.city ||
      !trimmed.area ||
      !trimmed.address
    ) {
      setError("Please fill in all delivery details.");
      return;
    }

    if (!/^\d{10,}$/.test(trimmed.phone)) {
      setError("Please enter a valid phone number (at least 10 digits).");
      return;
    }

    setError("");
    const order = placeOrder({ payment, customer: trimmed });
    router.push(`/order-confirmation?id=${order.id}`);
  };

  /* EMPTY CART */
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-2xl shadow-sm border border-border p-12 max-w-md w-full">
          <p className="text-5xl mb-4">🛒</p>
          <h1 className="text-2xl font-bold text-foreground">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">Add some fresh groceries to get started.</p>
          <Link
            href="/items/see-more"
            className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  /* CHECKOUT */
  if (checkout) {
    return (
      <div className="min-h-screen bg-surface py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={customer.name}
                    onChange={(e) => setField("name", e.target.value)}
                    className="border rounded-lg p-3 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  />
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="Phone Number"
                    value={customer.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    className="border rounded-lg p-3 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={customer.city}
                    onChange={(e) => setField("city", e.target.value)}
                    className="border rounded-lg p-3 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  />
                  <input
                    type="text"
                    placeholder="Area"
                    value={customer.area}
                    onChange={(e) => setField("area", e.target.value)}
                    className="border rounded-lg p-3 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  />
                </div>
                <textarea
                  placeholder="House No, Street, Landmark"
                  value={customer.address}
                  onChange={(e) => setField("address", e.target.value)}
                  className="w-full border rounded-lg p-3 mt-4 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  rows={4}
                />
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center justify-between border rounded-lg p-4 cursor-pointer hover:border-brand">
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={payment === "cod"}
                      onChange={(e) => setPayment(e.target.value)}
                    />
                  </label>
                  <label className="flex items-center justify-between border rounded-lg p-4 opacity-60 cursor-not-allowed">
                    <div>
                      <p className="font-medium">Online Payment</p>
                      <p className="text-sm text-muted-foreground">Coming soon</p>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={payment === "online"}
                      onChange={(e) => setPayment(e.target.value)}
                      disabled
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div>
              <div className="bg-white p-6 rounded-xl shadow sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Items Total</span>
                    <span>Rs. {subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>Rs. {shipping}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>Rs. {total}</span>
                  </div>
                </div>

                {error && <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>}

                <button
                  onClick={handlePlaceOrder}
                  className="w-full mt-6 bg-brand hover:bg-brand-dark text-white py-3 rounded-lg font-medium"
                >
                  Place Order
                </button>
                <button
                  onClick={() => setCheckout(false)}
                  className="w-full mt-2 text-muted-foreground py-2 text-sm hover:text-foreground"
                >
                  ← Back to cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* CART LIST */
  return (
    <div className="min-h-screen bg-surface p-6">
      <h1 className="text-2xl font-bold mb-6">🛒 Grocery Cart</h1>

      <div className="bg-white rounded-lg p-4">
        {cart.map((item) => (
          <div key={item.id} className="flex gap-4 border-b py-4">
            <Image
              src={item.image}
              alt={item.name}
              width={80}
              height={80}
              unoptimized
              className="w-20 h-20 object-cover rounded-lg"
            />

            <div className="flex-1">
              <h2 className="font-semibold text-foreground">{item.name}</h2>
              <p className="text-sm text-muted-foreground">
                {[item.category, item.unit].filter(Boolean).join(" • ")}
              </p>
              <p className="text-sm mt-1">
                Rs {item.price} × {item.quantity}
              </p>

              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => updateQty(item.id, item.quantity - 1)}
                  className="px-2 bg-gray-200 rounded"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQty(item.id, item.quantity + 1)}
                  className="px-2 bg-gray-200 rounded"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-right">
              <p className="font-bold">Rs {item.price * item.quantity}</p>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 text-sm mt-2"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white p-4 rounded-lg">
        <p>Subtotal: Rs {subtotal}</p>
        <p>Delivery: Rs {shipping}</p>
        <p className="font-bold text-lg mt-2">Total: Rs {total}</p>

        <button
          className="w-full mt-4 bg-brand text-white py-2 rounded-lg hover:bg-brand-dark"
          onClick={() => setCheckout(true)}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
