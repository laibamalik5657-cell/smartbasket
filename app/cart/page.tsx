'use client';

import { useState } from 'react';

/* TYPES */
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
  category: string;
}

/* MAIN PAGE */
export default function CartPage() {

  const [items, setItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Milk Pak Full Cream Milk',
      price: 245,
      quantity: 1,
      unit: '200 ml',
      category: 'Dairy',
      image: 'data:image/jpeg;base64,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'
    },
    {
      id: '2',
      name: 'Coca Cola Original',
      price: 120,
      quantity: 2,
      unit: '500 ml bottle',
      category: 'Cold Drinks',
      image: 'data:image/jpeg;base64,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'
    },
    {
      id: '3',
      name: 'Bananas Fresh',
      price: 200,
      quantity: 1,
      unit: '1 dozen',
      category: 'Fruits',
      image: 'data:image/jpeg;base64,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'
    }
  ]);
  const [toggle, setToggle] = useState(false)

  /* FUNCTIONS */
  const updateQty = (id: string, qty: number) => {
    if (qty < 1) return removeItem(id);

    setItems(items.map(i =>
      i.id === id ? { ...i, quantity: qty } : i
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  /*if (toggle) {
    return <div>address</div>
  }*/
 if (toggle) {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">

        <h1 className="text-3xl font-bold mb-6">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left Side */}
          <div className="lg:col-span-2 space-y-6">

            {/* Delivery Address */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4">
                Delivery Address
              </h2>

              <div className="grid md:grid-cols-2 gap-4">

                <input
                  type="text"
                  placeholder="Full Name"
                  className="border rounded-lg p-3"
                />

                <input
                  type="text"
                  placeholder="Phone Number"
                  className="border rounded-lg p-3"
                />

                <input
                  type="text"
                  placeholder="City"
                  className="border rounded-lg p-3"
                />

                <input
                  type="text"
                  placeholder="Area"
                  className="border rounded-lg p-3"
                />

              </div>

              <textarea
                placeholder="House No, Street, Landmark"
                className="w-full border rounded-lg p-3 mt-4"
                rows={4}
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-xl shadow">

              <h2 className="text-xl font-semibold mb-4">
                Payment Method
              </h2>

              <div className="space-y-3">

                <label className="flex items-center justify-between border rounded-lg p-4 cursor-pointer hover:border-green-500">
                  <div>
                    <p className="font-medium">
                      Cash on Delivery
                    </p>
                    <p className="text-sm text-gray-500">
                      Pay when your order arrives
                    </p>
                  </div>

                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    defaultChecked
                  />
                </label>

                <label className="flex items-center justify-between border rounded-lg p-4 cursor-pointer hover:border-green-500">
                  <div>
                    <p className="font-medium">
                      Online Payment
                    </p>
                    <p className="text-sm text-gray-500">
                      Upload proof
                    </p>
                  </div>

                  <input
                    type="radio"
                    name="payment"
                    value="online"
                  />
                </label>

              </div>

            </div>
          </div>

          {/* Right Side */}
          <div>

            <div className="bg-white p-6 rounded-xl shadow sticky top-4">

              <h2 className="text-xl font-semibold mb-4">
                Order Summary
              </h2>

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

              <button
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
              >
                Place Order
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <h1 className="text-2xl font-bold mb-6">
        🛒 Grocery Cart 
      </h1>

      {/* CART ITEMS */}
      <div className="bg-white rounded-lg p-4">

        {items.map(item => (
          <div key={item.id} className="flex gap-4 border-b py-4">

            {/* IMAGE */}
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 object-cover rounded-lg"
            />

            {/* DETAILS */}
            <div className="flex-1">

              <h2 className="font-semibold text-gray-900">
                {item.name}
              </h2>

              <p className="text-sm text-gray-500">
                {item.category} • {item.unit}
              </p>

              <p className="text-sm mt-1">
                Rs {item.price} × {item.quantity}
              </p>

              {/* QTY */}
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

            {/* RIGHT SIDE */}
            <div className="text-right">

              <p className="font-bold">
                Rs {item.price * item.quantity}
              </p>

              <button
                onClick={() => removeItem(item.id)}
                className="text-red-500 text-sm mt-2"
              >
                Remove
              </button>

            </div>
          </div>
        ))}
      </div>

      {/* SUMMARY */}
      <div className="mt-6 bg-white p-4 rounded-lg">

        <p>Subtotal: Rs {subtotal}</p>
        <p>Delivery: Rs {shipping}</p>

        <p className="font-bold text-lg mt-2">
          Total: Rs {total}
        </p>

        <button className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg" onClick={() => setToggle(true)}>
          Checkout
        </button>
      </div>

    </div>
  );
}
