"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBasket, Heart, ArrowLeft, SlidersHorizontal, Star } from "lucide-react";
import { useStore } from "@/lib/store";

export type SeeMoreProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  oldPrice: number | null;
  discount: string;
  rating: number | null;
  image: string;
  category: string;
  unit: string;
};

export default function FeaturedList({ products }: { products: SeeMoreProduct[] }) {
  const { addToCart, toggleFavourite, isFavourite } = useStore();
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const handleGoBack = () => {
    if (typeof window !== "undefined") window.history.back();
  };

  const toStoreProduct = (p: SeeMoreProduct) => ({
    id: p.slug,
    name: p.name,
    price: p.price,
    image: p.image,
    unit: p.unit,
    category: p.category,
  });

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((item) => item.category === activeCategory);

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
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                  : "bg-white text-gray-600 border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50"
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
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="bg-white rounded-2xl border border-emerald-100/40 p-3 sm:p-4 relative flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                {product.discount && (
                  <div className="absolute top-3 left-3 z-10 bg-orange-500 text-white font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-md shadow-sm">
                    {product.discount}
                  </div>
                )}

                <button
                  onClick={(e) => {
                    stop(e);
                    toggleFavourite(toStoreProduct(product));
                  }}
                  className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-xs p-1.5 rounded-full shadow-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isFavourite(product.slug) ? "text-red-500 fill-red-500" : "text-gray-400"
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
                    {product.rating !== null && (
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-[11px] font-bold text-gray-500">{product.rating}</span>
                      </div>
                    )}

                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2 leading-snug min-h-[40px] sm:min-h-[48px]">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium mt-0.5 mb-2">{product.unit}</p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between gap-1">
                    <div>
                      <p className="text-base sm:text-lg font-black text-emerald-700 leading-tight">
                        Rs. {product.price}
                      </p>
                      {product.oldPrice ? (
                        <p className="text-xs text-gray-400 line-through font-medium">
                          Rs. {product.oldPrice}
                        </p>
                      ) : null}
                    </div>

                    <button
                      onClick={(e) => {
                        stop(e);
                        addToCart(toStoreProduct(product));
                      }}
                      className="p-2 sm:px-3 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-sm shadow-emerald-100 flex items-center justify-center gap-1.5 font-medium text-xs sm:text-sm"
                      title="Add to basket"
                    >
                      <ShoppingBasket className="w-4 h-4" />
                      <span className="hidden sm:inline">Add</span>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
