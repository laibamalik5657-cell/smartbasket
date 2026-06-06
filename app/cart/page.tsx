// app/cart/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Types
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
  slug: string;
}

// Cart Item Component
const CartItemComponent = ({ 
  item, 
  onUpdateQuantity, 
  onRemove 
}: { 
  item: CartItem; 
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-6 py-6 border-b border-gray-200">
      {/* Product Image */}
      <div className="sm:w-32 sm:h-32 relative bg-gray-100 rounded-lg overflow-hidden">
        {/* <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 128px"
        /> */}
      </div>

      {/* Product Details */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <div>
            <Link 
              href={`/product/${item.slug}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {item.name}
            </Link>
            {item.size && (
              <p className="text-sm text-gray-500 mt-1">Size: {item.size}</p>
            )}
            {item.color && (
              <p className="text-sm text-gray-500">Color: {item.color}</p>
            )}
          </div>
          
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">
              ${item.price.toFixed(2)} each
            </p>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Decrease quantity"
            >
              {/* <MinusIcon className="w-5 h-5" /> */}
            </button>
            <span className="w-12 text-center font-medium">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Increase quantity"
            >
              {/* <PlusIcon className="w-5 h-5" /> */}
            </button>
          </div>
          
          <button
            onClick={() => onRemove(item.id)}
            className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
          >
            {/*<TrashIcon className="w-5 h-5" />*/}
            <span className="text-sm">Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Empty Cart Component
const EmptyCart = () => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🛒</div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Your cart is empty
      </h2>
      <p className="text-gray-600 mb-6">
        Looks like you haven&apos;t added any items to your cart yet.
      </p>
      <Link
        href="/products"
        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
};

// Order Summary Component
const OrderSummary = ({ 
  subtotal, 
  tax, 
  shipping, 
  total 
}: { 
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Tax (10%)</span>
          <span className="text-gray-900">${tax.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">
            {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between font-semibold text-lg">
            <span className="text-gray-900">Total</span>
            <span className="text-blue-600">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <button className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium">
        Proceed to Checkout
      </button>
      
      <p className="text-xs text-gray-500 text-center mt-4">
        Shipping and taxes calculated at checkout
      </p>
    </div>
  );
};

// Main Cart Page Component
export default function CartPage() {
  // Sample cart data - replace with your actual cart data from API/state
  const [items, setItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Coldrink',
      price: 29.99,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
      size: 'M',
      color: 'White',
      slug: 'classic-white-t-shirt'
    },
    {
      id: '2',
      name: 'Bread',
      price: 150,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&h=500&fit=crop',
      size: '32',
      color: 'Blue',
      slug: 'slim-fit-jeans'
    }
  ]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
      return;
    }
    setItems(items.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.1;
  };

  const getShipping = () => {
    return getSubtotal() > 50 ? 0 : 5.99;
  };

  const getTotal = () => {
    return getSubtotal() + getTax() + getShipping();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                {/* Clear Cart Button */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
                
                {/* Cart Items List */}
                <div>
                  {items.map((item) => (
                    <CartItemComponent
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
                
                {/* Continue Shopping Link */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link
                    href="/products"
                    className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
                  >
                    ← Continue Shopping
                  </Link>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummary
                subtotal={getSubtotal()}
                tax={getTax()}
                shipping={getShipping()}
                total={getTotal()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}