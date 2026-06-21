"use client";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBasket, Heart } from "lucide-react";
import { useStore } from "@/lib/store";

export default function FavoritesPage() {
  const { favorites, toggleFavourite, addToCart } = useStore();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center gap-3 border-b border-gray-200 pb-5 mb-8">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            My Favorites
          </h1>
          <span className="bg-gray-200 text-gray-800 text-sm font-semibold px-2.5 py-0.5 rounded-full">
            {favorites.length} {favorites.length === 1 ? "Item" : "Items"}
          </span>
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-medium text-gray-600">
              Your favorites list is empty!
            </p>
            <p className="text-gray-400 mt-2">
              Explore the store to save your favorite grocery items here.
            </p>
            <Link
              href="/items/see-more"
              className="mt-6 inline-block rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
            >
              Browse products
            </Link>
          </div>
        ) : (
          /* Favorites Grid */
          <div className="grid gap-6 md:grid-cols-2">
            {favorites.map((item) => (
              <div
                key={item.id}
                className="flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* Image Section */}
                <div className="w-32 h-32 flex-shrink-0 relative bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                {/* Details Section */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">
                        {item.name}
                      </h2>
                      {/* Remove from favorites */}
                      <button
                        onClick={() => toggleFavourite(item)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-gray-50"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    {item.unit && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {item.unit}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-bold text-gray-900">
                      Rs. {item.price}
                    </span>
                    {/* Add to Cart */}
                    <button
                      onClick={() => addToCart(item)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-green-600 hover:bg-green-700 text-white"
                    >
                      <ShoppingBasket className="w-4 h-4" />
                      Add to Cart
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
