"use client";
import Image from "next/image";
import React, { useState, useEffect } from 'react';
import { Trash2, ShoppingBasket, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation'; 

interface GroceryItem {
  id: number;
  name: string;
  weight: string;
  price: number;
  image: string;
  inStock: boolean;
}

export default function favouritePage() {
  const router = useRouter();
  const [favourite, setfavourite] = useState<GroceryItem[]>([]);

  // 1. LocalStorage se data load karne ke liye
  useEffect(() => {
    const savedfavourite = localStorage.getItem('smart_basket_favourite');
    if (savedfavourite) {
      try {
        setfavourite(JSON.parse(savedfavourite));
      } catch (e) {
        console.error("Error parsing favorites data", e);
      }
    } else {
      // Agar localStorage khali ho toh yeh default items load honge
      const mockfavourite = [
        { id: 1, name: 'Premium Basmati Rice', weight: '5 Kg', price: 1350, image: 'https://api.milanfoods.com.pk/uploads/Rice_Bag_03_6f18424346.webp', inStock: true },
        { id: 2, name: 'Fresh Farm Eggs', weight: '1 Dozen', price: 320, image: 'https://www.metro-online.pk/_next/image?url=https%3A%2F%2Fprodimages.metro-online.pk%2FProducts%2F1708157456191.jpg&w=3840&q=75', inStock: true },
        { id: 3, name: 'Organic Cooking Oil', weight: '3 Litre', price: 1580, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80', inStock: true },
        { id: 4, name: 'Fresh Red Tomatoes', weight: '1 Kg', price: 180, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6Txv4qZbFTw9npVy6nGrIVel6ElZgPvqtOw&s', inStock: false }
      ];
      setfavourite(mockfavourite);
      localStorage.setItem('smart_basket_favorites', JSON.stringify(mockfavourite));
    }
  }, []);

  // 2. 🟢 Core Functionality: Add ya Remove (Toggle) karne ka updated function
  const togglefavourite = (item: GroceryItem) => {
    const isAlreadyFav = favourite.some(fav => fav.id === item.id);
    let updatedFavs;

    if (isAlreadyFav) {
      // Agar pehle se add hai toh favorites page se foran REMOVE kar do
      updatedFavs = favourite.filter(fav => fav.id !== item.id);
    } else {
      // Agar remove ho chuka tha toh dubara ADD kar do
      updatedFavs = [...favourite, item];
    }

    setfavourite(updatedFavs);
    localStorage.setItem('smart_basket_favourite', JSON.stringify(updatedFavs));
    
    // Custom Event trigger taake agar Navbar counter open ho toh update ho jaye
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-5 mb-8">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Favorites</h1>
            <span className="bg-gray-200 text-gray-800 text-sm font-semibold px-2.5 py-0.5 rounded-full">
              {favourite.length} {favourite.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>
          
          <button 
            onClick={() => router.push('/')} 
            className="text-sm font-medium text-green-600 hover:text-green-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"
          >
            ← Continue Shopping
          </button>
        </div>

        {/* Empty State */}
        {favourite.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-medium text-gray-600">Your favourite list is empty!</p>
            <p className="text-gray-400 mt-2">Explore the store to save your favourite grocery items here.</p>
            <button 
              onClick={() => router.push('/')}
              className="mt-5 inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              Go to Home Page
            </button>
          </div>
        ) : (
          /* Favorites Grid */
          <div className="grid gap-6 md:grid-cols-2">
            {favourite.map((item) => {
              // Yahan check state array se hoga na ke static loop se
              const isFav = favourite.some(fav => fav.id === item.id);

              return (
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
                        
                        <div className="flex items-center gap-1">
                          {/* 🟢 Trash Button (Is par bhi toggle function connect kar diya) */}
                          <button 
                            onClick={() => togglefavourite(item)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-gray-50"
                            title="Remove from favourites"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>

                          {/* 🟢 Toggle Favorite Button (Heart Icon) */}
                          <button 
                            onClick={() => togglefavourite(item)}
                            className="p-1 rounded-lg hover:bg-gray-50 transition-colors"
                            title={isFav ? "Remove from favourite" : "Add to favorites"}
                          >
                            <Heart 
                              className={`w-5 h-5 transition-colors ${
                                isFav ? "text-red-500 fill-red-500" : "text-gray-400"
                              }`} 
                            />
                          </button>
                        </div>
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
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}