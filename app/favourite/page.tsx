"use client";
import Image from "next/image";
import React, { useState } from 'react';
import { Trash2, ShoppingBasket, Heart } from 'lucide-react';

export default function FavoritesPage() {
  // Real local grocery items with mock database data in PKR
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      name: 'Premium Basmati Rice',
      weight: '5 Kg',
      price: 1350,
      image: 'https://api.milanfoods.com.pk/uploads/Rice_Bag_03_6f18424346.webp',
      inStock: true,
    },
    {
      id: 2,
      name: 'Fresh Farm Eggs',
      weight: '1 Dozen',
      price: 320,
      image: 'https://www.metro-online.pk/_next/image?url=https%3A%2F%2Fprodimages.metro-online.pk%2FProducts%2F1708157456191.jpg&w=3840&q=75',
      inStock: true,
    },
    {
      id: 3,
      name: 'Organic Cooking Oil',
      weight: '3 Litre',
      price: 1580,
      image: 'data:image/jpeg;base64,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',
      inStock: true,
    },
    {
      id: 4,
      name: 'Fresh Red Tomatoes',
      weight: '1 Kg',
      price: 180,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6Txv4qZbFTw9npVy6nGrIVel6ElZgPvqtOw&s',
      inStock: false, // Out of stock example
    }
  ]);

  // Function to remove item from list
  const removeFromFavorites = (id: number) => {
    setFavorites(favorites.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="flex items-center gap-3 border-b border-gray-200 pb-5 mb-8">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Favorites</h1>
          <span className="bg-gray-200 text-gray-800 text-sm font-semibold px-2.5 py-0.5 rounded-full">
            {favorites.length} {favorites.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-medium text-gray-600">Your favorites list is empty!</p>
            <p className="text-gray-400 mt-2">Explore the store to save your favorite grocery items items here.</p>
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
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-bold px-2 py-1 bg-red-600 rounded">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                {/* Details Section */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">
                        {item.name}
                      </h2>
                      {/* Delete Button */}
                      <button 
                        onClick={() => removeFromFavorites(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-gray-50"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{item.weight}</p>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    {/* Price in PKR */}
                    <span className="text-xl font-bold text-gray-900">
                      Rs. {item.price}
                    </span>

                    {/* Add to Cart Button */}
                    <button 
                      disabled={!item.inStock}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        item.inStock 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
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