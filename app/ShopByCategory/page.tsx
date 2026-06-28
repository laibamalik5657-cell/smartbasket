"use client";

import Image from "next/image";
import React, { useRef } from "react";

export default function ShopByCategorySlider() {
  const sliderRef = useRef<HTMLDivElement | null>(null);

  // 100% Real Pakistani Grocery Products Data with Large Images
  const categories = [
    { 
      name: "Fresh Vegetables & Fruits", 
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&q=80", 
      tint: "bg-green-50", 
      count: "45+ Items" 
    },
    { 
      name: "Shan Masalas & Herbs", 
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&q=80", 
      tint: "bg-red-50", 
      count: "30+ Items" 
    }, 
    { 
      name: "Dalda Oil & Ghee", 
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80", 
      tint: "bg-amber-50", 
      count: "15+ Items" 
    },
    { 
      name: "Dawn Bakery & Bread", 
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80", 
      tint: "bg-yellow-50", 
      count: "25+ Items" 
    },
    { 
      name: "National Sauces & Pastes", 
      image: "https://images.unsplash.com/photo-1607305387299-a3d9611cd46f?w=500&q=80", 
      tint: "bg-rose-50", 
      count: "22+ Items" 
    },
    { 
      name: "Tapal Tea & Coffee", 
      image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&q=80", 
      tint: "bg-orange-50", 
      count: "20+ Items" 
    },
    { 
      name: "Gourmet Cold Drinks & Juices", 
      image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80", 
      tint: "bg-sky-50", 
      count: "35+ Items" 
    },
    { 
      name: "Rooh Afza & Summer Drinks", 
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80", 
      tint: "bg-red-100", 
      count: "10+ Items" 
    },
    { 
      name: "Home Cleaning Essentials", 
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80", 
      tint: "bg-blue-50", 
      count: "25+ Items" 
    }
  ];

  // Smooth Slider Scroll Logic
  const scroll = (direction: "left" | "right") => {
    const slider = sliderRef.current;
    if (!slider) return;

    const scrollAmount = slider.clientWidth * 0.75; // 75% scroll per click
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
            msOverflowStyle: 'none',  /* IE and Edge */
            scrollbarWidth: 'none',  /* Firefox */
          }}
        >
          {/* Hide default scrollbars visually */}
          <style jsx global>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {categories.map((category, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[240px] sm:w-[280px] group cursor-pointer bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center justify-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* BIGGER Image Container */}
              <div className={`relative w-36 h-36 sm:w-40 sm:h-40 rounded-full flex items-center justify-center mb-5 ${category.tint} overflow-hidden transition-transform group-hover:scale-105 shadow-inner`}>
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 144px, 160px"
                  className="object-cover"
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
          ))}
        </div>

      </div>
    </section>
  );
}