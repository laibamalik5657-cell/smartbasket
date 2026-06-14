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

        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="w-11 h-11 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center font-bold text-lg text-gray-600 hover:bg-gray-50 cursor-pointer active:scale-95 transition-all"
          >
            ←
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="w-11 h-11 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center font-bold text-lg text-gray-600 hover:bg-gray-50 cursor-pointer active:scale-95 transition-all"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-auto pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((c) => (
          <a
            key={c._id}
            href={`/ShopByCategory?category=${c.slug}`}
            className="min-w-[140px] flex-shrink-0 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-border text-center hover:shadow-md transition-shadow"
          >
            <div
              className={`flex h-16 w-16 mx-auto items-center justify-center rounded-full text-3xl ${c.tint}`}
            >
              <img
                src={c.emoji}
                alt={c.name}
                className="h-10 w-10 object-contain"
              />
            </div>
            <h3 className="mt-3 font-semibold text-gray-800 text-sm">
              {c.name}
            </h3>
          </a>
        ))}
      </div>
    </section>
  );
}
