"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { ShoppingBasket, Heart, ArrowLeft, SlidersHorizontal, Star } from 'lucide-react';
import { useStore } from '@/lib/store';

type Product = {
  id: number;
  name: string;
  weight: string;
  price: number;
  oldPrice: number;
  discount: string;
  rating: number;
  image: string;
  category: string;
};

/* Map the page's product shape to the shared store shape. */
const toStoreProduct = (p: Product) => ({
  id: String(p.id),
  name: p.name,
  price: p.price,
  image: p.image,
  unit: p.weight,
  category: p.category,
});

export default function FeaturedTodayPage() {
  const [products] = useState<Product[]>([
    {
      id: 1,
      name: 'Dalda Banaspati Ghee Polybag',
      weight: '1 Kg',
      price: 525,
      oldPrice: 560,
      discount: '6% OFF',
      rating: 4.8,
      image: '/products/seemore-1.jpg',
      category: 'Ghee & Oil',
    },
    {
      id: 2,
      name: 'Nestlé MilkPak Cream',
      weight: '200 ml',
      price: 190,
      oldPrice: 210,
      discount: '10% OFF',
      rating: 4.9,
      image: '/products/seemore-2.jpg',
      category: 'Dairy',
    },
    {
      id: 3,
      name: 'Tapal Danedar Tea Family Pack',
      weight: '430 g',
      price: 670,
      oldPrice: 720,
      discount: 'Rs. 50 Save',
      rating: 4.7,
      image: '/products/seemore-3.jpg',
      category: 'Beverages',
    },
    {
      id: 4,
      name: 'National Iodized Salt',
      weight: '800 g',
      price: 70,
      oldPrice: 85,
      discount: '17% OFF',
      rating: 4.5,
      image: '/products/seemore-4.jpg',
      category: 'Staples',
    },
    {
      id: 5,
      name: 'Dawn Bread Regular',
      weight: 'Large',
      price: 240,
      oldPrice: 260,
      discount: 'Rs. 20 Save',
      rating: 4.6,
      image: '/products/seemore-5.jpg',
      category: 'Bakery',
    },
    {
      id: 6,
      name: 'Shan Biryani Masala Double Pack',
      weight: '100 g',
      price: 160,
      oldPrice: 180,
      discount: '11% OFF',
      rating: 4.9,
      image: '/products/seemore-6.jpg',
      category: 'Staples',
    },
  ]);

  const { addToCart, toggleFavourite, isFavourite } = useStore();
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Ghee & Oil', 'Dairy', 'Beverages', 'Staples', 'Bakery'];

  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-100 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-emerald-100 rounded-lg text-emerald-800 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Featured Today</h1>
              <p className="text-xs sm:text-sm text-emerald-700 font-medium mt-0.5">Today&apos;s best prices and fresh deals just for you</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center text-sm font-semibold text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>{filteredProducts.length} Deals Found</span>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none no-scrollbar">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                activeCategory === category
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100'
                  : 'bg-white text-gray-600 border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-emerald-100/50 shadow-sm">
            <p className="text-gray-500 font-medium">No items available right now in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-emerald-100/40 p-3 sm:p-4 relative flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                <div className="absolute top-3 left-3 z-10 bg-orange-500 text-white font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-md shadow-sm">
                  {product.discount}
                </div>

                <button
                  onClick={() => toggleFavourite(toStoreProduct(product))}
                  className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-xs p-1.5 rounded-full shadow-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isFavourite(String(product.id)) ? 'text-red-500 fill-red-500' : 'text-gray-400'
                    }`}
                  />
                </button>

                <div className="w-full aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3 relative flex items-center justify-center">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-[11px] font-bold text-gray-500">{product.rating}</span>
                    </div>

                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2 leading-snug min-h-[40px] sm:min-h-[48px]">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium mt-0.5 mb-2">{product.weight}</p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between gap-1">
                    <div>
                      <p className="text-base sm:text-lg font-black text-emerald-700 leading-tight">
                        Rs. {product.price}
                      </p>
                      <p className="text-xs text-gray-400 line-through font-medium">
                        Rs. {product.oldPrice}
                      </p>
                    </div>

                    <button
                      onClick={() => addToCart(toStoreProduct(product))}
                      className="p-2 sm:px-3 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-sm shadow-emerald-100 flex items-center justify-center gap-1.5 font-medium text-xs sm:text-sm"
                      title="Add to basket"
                    >
                      <ShoppingBasket className="w-4 h-4" />
                      <span className="hidden sm:inline">Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
