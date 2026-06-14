"use client";

import React, { useRef, useState, useEffect } from "react";
import { Heart } from "lucide-react";

interface GroceryCategory {
  id: number; // Array index ya unique id mapping ke liye
  name: string;
  image: string;
  tint: string;
  count: string;
  price: number; // Favorites system ke liye required ha
  weight: string; // Favorites system ke liye required ha
  inStock: boolean;
}

export default function ShopByCategorySlider() {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [favorites, setFavorites] = useState<GroceryCategory[]>([]);

  // 100% Real Pakistani Grocery Products Data with Required Fields for Favorites
  const categories: GroceryCategory[] = [
    { 
      id: 101,
      name: "Fresh Vegetables & Fruits", 
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&q=80", 
      tint: "bg-green-50", 
      count: "45+ Items",
      price: 250,
      weight: "Mixed Pack",
      inStock: true
    },
    { 
      id: 102,
      name: "Shan Masalas & Herbs", 
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&q=80", 
      tint: "bg-red-50", 
      count: "30+ Items",
      price: 110,
      weight: "1 Pack",
      inStock: true
    }, 
    { 
      id: 103,
      name: "Dalda Oil & Ghee", 
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80", 
      tint: "bg-amber-50", 
      count: "15+ Items",
      price: 560,
      weight: "1 Litre",
      inStock: true
    },
    { 
      id: 104,
      name: "Dawn Bakery & Bread", 
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80", 
      tint: "bg-yellow-50", 
      count: "25+ Items",
      price: 140,
      weight: "Large Size",
      inStock: true
    },
    { 
      id: 105,
      name: "National Sauces & Pastes", 
      image: "https://images.unsplash.com/photo-1607305387299-a3d9611cd46f?w=500&q=80", 
      tint: "bg-rose-50", 
      count: "22+ Items",
      price: 230,
      weight: "500g",
      inStock: true
    },
    { 
      id: 106,
      name: "Tapal Tea & Coffee", 
      image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&q=80", 
      tint: "bg-orange-50", 
      count: "20+ Items",
      price: 450,
      weight: "430g Tea Bag",
      inStock: true
    },
    { 
      id: 107,
      name: "Gourmet Cold Drinks & Juices", 
      image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80", 
      tint: "bg-sky-50", 
      count: "35+ Items",
      price: 120,
      weight: "1.5 Litre",
      inStock: true
    },
    { 
      id: 108,
      name: "Rooh Afza & Summer Drinks", 
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80", 
      tint: "bg-red-100", 
      count: "10+ Items",
      price: 380,
      weight: "800ml Bottle",
      inStock: true
    },
    { 
      id: 109,
      name: "Home Cleaning Essentials", 
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80", 
      tint: "bg-blue-50", 
      count: "25+ Items",
      price: 650,
      weight: "1 Pack",
      inStock: true
    }
  ];

  // 1. Initial Load: Favorites read karein localStorage se
  useEffect(() => {
    const savedFavorites = localStorage.getItem("smart_basket_favorites");
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error("Error parsing favorites inside slider", e);
      }
    }
  }, []);

  // 2. Core Logic: Add / Remove functionality
  const toggleFavorite = (e: React.MouseEvent, category: GroceryCategory) => {
    e.stopPropagation(); // Slider item card click se arrow navigation crash na kare
    
    const isAlreadyFav = favorites.some((fav) => fav.id === category.id);
    let updatedFavs;

    if (isAlreadyFav) {
      updatedFavs = favorites.filter((fav) => fav.id !== category.id);
    } else {
      updatedFavs = [...favorites, category];
    }

    setFavorites(updatedFavs);
    localStorage.setItem("smart_basket_favorites", JSON.stringify(updatedFavs));
    
    // Global Event trigger taake Navbar counter update ho sake instant
    window.dispatchEvent(new Event("storage"));
  };

  // Smooth Slider Scroll Logic
  const scroll = (direction: "left" | "right") => {
    const slider = sliderRef.current;
    if (!slider) return;

    const scrollAmount = slider.clientWidth * 0.75;
    slider.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header with Slider Control Arrows */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              Explore Smart Basket&apos;s premium Pakistani products. Slide to view all!
            </p>
          </div>
          
          {/* Navigation Arrows for Slider */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center font-bold text-xl text-gray-600 hover:bg-gray-50 cursor-pointer active:scale-95 transition-all"
              aria-label="Scroll left"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center font-bold text-xl text-gray-600 hover:bg-gray-50 cursor-pointer active:scale-95 transition-all"
              aria-label="Scroll right"
            >
              →
            </button>
          </div>
        </div>

        {/* Horizontal Slider Track */}
        <div 
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto pb-6 scroll-smooth scrollbar-hide"
          style={{
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {/* Hide default scrollbars visually */}
          <style jsx global>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {categories.map((category) => {
            // Check karein ke card favorites array mein save ha ya nahi
            const isFav = favorites.some((fav) => fav.id === category.id);

            return (
              <div
                key={category.id}
                className="flex-shrink-0 w-[240px] sm:w-[280px] group cursor-pointer bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center justify-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative"
              >
                {/* 🟢 Clickable Heart Icon (Top-Right of Card) */}
                <button
                  type="button"
                  onClick={(e) => toggleFavorite(e, category)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-50/80 backdrop-blur-sm shadow-sm hover:bg-gray-100 transition-colors"
                  title={isFav ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      isFav ? "text-red-500 fill-red-500" : "text-gray-400"
                    }`}
                  />
                </button>

                {/* BIGGER Image Container */}
                <div className={`w-36 h-36 sm:w-40 sm:h-40 rounded-full flex items-center justify-center mb-5 ${category.tint} overflow-hidden transition-transform group-hover:scale-105 shadow-inner`}>
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                {/* Product Details */}
                <h3 className="font-bold text-gray-800 text-sm sm:text-base group-hover:text-green-600 transition-colors line-clamp-1 w-full px-2">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-400 mt-2 font-medium bg-gray-50 inline-block px-3 py-1 rounded-full">
                  {category.count}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}