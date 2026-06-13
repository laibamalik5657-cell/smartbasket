"use client";
import Image from "next/image";
import React, { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ShieldCheck, ArrowLeft } from 'lucide-react';

type CartItem = {
  id: number;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  image: string;
};

export default function CartPage() {
  // Real Pakistani staple products with current local prices in Rs.
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: 'Dalda Banaspati Ghee Polybag',
      variant: '1 Kg',
      price: 525,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?w=500&auto=format&fit=crop&q=60', // Cooking oil context
    },
    {
      id: 2,
      name: 'Nestlé MilkPak Cream',
      variant: '200 ml',
      price: 190,
      quantity: 3,
      image: 'https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=500&auto=format&fit=crop&q=60', // Dairy pack context
    },
    {
      id: 3,
      name: 'Tapal Danedar Tea Family Pack',
      variant: '430 g',
      price: 670,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60', // Loose tea context
    },
    {
      id: 4,
      name: 'National Iodized Salt',
      variant: '800 g',
      price: 70,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&auto=format&fit=crop&q=60', // Table salt context
    }
  ]);

  // Handle quantity increase
  const incrementQuantity = (id: number) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  // Handle quantity decrease
  const decrementQuantity = (id: number) => {
    setCartItems(cartItems.map(item => 
      item.id === id && item.quantity > 1 
        ? { ...item, quantity: item.quantity - 1 } 
        : item
    ));
  };

  // Remove item completely
  const removeItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryCharges = subtotal > 2000 ? 0 : 150; // Free delivery over Rs. 2000
  const totalAmount = subtotal + deliveryCharges;

  return (
    <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Top Navigation / Heading */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg text-white">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Shopping Cart</h1>
          </div>
          <button className="flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </button>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-emerald-100">
            <ShoppingBag className="w-20 h-20 text-emerald-200 mx-auto mb-4" />
            <p className="text-2xl font-bold text-gray-700">Your cart feels light!</p>
            <p className="text-gray-400 mt-2 mb-6">Looks like you haven&apos;t added anything to your cart yet.</p>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm shadow-emerald-200">
              Go to Shop
            </button>
          </div>
        ) : (
          /* Main Layout Split */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center bg-white p-4 rounded-xl shadow-sm border border-emerald-100/50 gap-4"
                >
                  {/* Image */}
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={96}
                    height={96}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg bg-emerald-50 flex-shrink-0"
                    unoptimized
                  />

                  {/* Details Wrapper */}
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Title & Variant */}
                    <div>
                      <h3 className="font-semibold text-gray-800 text-base sm:text-lg leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">{item.variant}</p>
                      <p className="text-emerald-700 font-medium text-sm sm:hidden mt-1">
                        Rs. {item.price}
                      </p>
                    </div>

                    {/* Actions: Quantity & Pricing */}
                    <div className="flex items-center justify-between sm:gap-8">
                      {/* Counter Controls */}
                      <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-gray-50">
                        <button 
                          onClick={() => decrementQuantity(item.id)}
                          className="p-1 hover:bg-white rounded text-gray-500 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-sm font-semibold text-gray-700 select-none">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => incrementQuantity(item.id)}
                          className="p-1 hover:bg-white rounded text-gray-500 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Item Total Price */}
                      <div className="hidden sm:block text-right min-w-[90px]">
                        <p className="text-xs text-gray-400">Rs. {item.price} each</p>
                        <p className="font-bold text-gray-800 text-base">
                          Rs. {item.price * item.quantity}
                        </p>
                      </div>

                      {/* Trash Button */}
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors ml-2"
                        title="Remove Item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-4 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm text-gray-600 border-b border-gray-100 pb-4 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800">Rs. {subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery Charges</span>
                  <span className={`font-semibold ${deliveryCharges === 0 ? 'text-emerald-600' : 'text-gray-800'}`}>
                    {deliveryCharges === 0 ? 'FREE' : `Rs. ${deliveryCharges}`}
                  </span>
                </div>
                {deliveryCharges > 0 && (
                  <p className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded">
                    💡 Add items worth <b>Rs. {2000 - subtotal}</b> more for FREE delivery!
                  </p>
                )}
              </div>

              {/* Total Price Row */}
              <div className="flex justify-between items-baseline mb-6">
                <span className="text-base font-bold text-gray-800">Total Amount</span>
                <span className="text-2xl font-black text-emerald-700">
                  Rs. {totalAmount}
                </span>
              </div>

              {/* Checkout CTA */}
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md shadow-emerald-100 flex items-center justify-center gap-2 text-base">
                Proceed to Checkout
              </button>

              {/* Trust Badge */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>100% Safe and Secure Checkout</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}