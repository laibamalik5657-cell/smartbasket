"use client";

import Link from "next/link";
import { useStore, type Product } from "@/lib/store";

export interface FeaturedProduct extends Product {
  slug: string;
  tag?: string;
}

export default function ProductCard({ product }: { product: FeaturedProduct }) {
  const { addToCart, toggleFavourite, isFavourite } = useStore();
  const fav = isFavourite(product.id);

  const storeProduct: Product = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    unit: product.unit,
  };

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-white p-4 transition-shadow hover:shadow-md"
    >
      <div className="relative flex aspect-square w-full items-center justify-center rounded-xl bg-white overflow-hidden">
        {product.tag && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-brand shadow-sm">
            {product.tag}
          </span>
        )}
        <button
          aria-label={`Favourite ${product.name}`}
          onClick={(e) => {
            stop(e);
            toggleFavourite(storeProduct);
          }}
          className={`absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm hover:text-brand ${
            fav ? "text-red-500" : "text-foreground"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill={fav ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="h-20 w-20" src={product.image} alt={product.name} />
      </div>
      <div className="mt-3 flex flex-1 flex-col">
        <h3 className="text-sm font-semibold text-foreground">{product.name}</h3>
        <p className="text-xs text-muted">In stock</p>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-base font-bold text-gray-900">
            Rs.{product.price}
            {product.unit && (
              <span className="ml-1 text-xs font-normal text-muted">{product.unit}</span>
            )}
          </p>
          <button
            onClick={(e) => {
              stop(e);
              addToCart(storeProduct);
            }}
            className="flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Add
          </button>
        </div>
      </div>
    </Link>
  );
}
