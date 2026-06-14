"use client";

import { useRef } from "react";

export type Category = {
  _id: string;
  name: string;
  emoji: string;
  tint: string;
  slug: string;
  order: number;
};

interface CategorySliderProps {
  categories: Category[];
}

export default function CategorySlider({ categories }: CategorySliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollAmount = clientWidth * 0.75;
      sliderRef.current.scrollTo({
        left:
          direction === "left"
            ? scrollLeft - scrollAmount
            : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {/* Shop By Category Section - Clean Slider Layout */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Everything your kitchen needs, organised. Slide to view all!
            </p>
          </div>

          {/* Action Navigation Arrows */}
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-11 h-11 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center font-bold text-lg text-gray-600 hover:bg-gray-50 cursor-pointer active:scale-95 transition-all"
            >
              ←
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-11 h-11 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center font-bold text-lg text-gray-600 hover:bg-gray-50 cursor-pointer active:scale-95 transition-all"
            >
              →
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Track */}
        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {categories.map((category) => (
            <div
              key={category._id}
              className="flex-shrink-0 w-[220px] sm:w-[260px] group cursor-pointer bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center justify-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* BIGGER Image Circles */}
              <div
                className={`w-36 h-36 sm:w-40 sm:h-40 rounded-full flex items-center justify-center mb-4 ${category.tint} overflow-hidden transition-transform group-hover:scale-105 shadow-inner`}
              >
                <img
                  src={category.emoji}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Card Details */}
              <h3 className="font-bold text-gray-800 text-sm sm:text-base group-hover:text-green-600 transition-colors line-clamp-1 w-full px-1">
                {category.name}
              </h3>
              <p className="text-xs text-gray-400 mt-2 font-medium bg-gray-50 inline-block px-3 py-1 rounded-full">
                {/* {category.count} */}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
