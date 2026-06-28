"use client";

import { useState } from "react";
import { Heart, Minus, Plus, ShoppingBasket } from "lucide-react";
import { useStore, type Product } from "@/lib/store";

export default function ProductActions({
  product,
  inStock,
}: {
  product: Product;
  inStock: boolean;
}) {
  const { addToCart, toggleFavourite, isFavourite } = useStore();
  const [qty, setQty] = useState(1);
  const fav = isFavourite(product.id);

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-lg border border-border">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="flex h-10 w-10 items-center justify-center text-foreground hover:text-brand"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-10 text-center text-sm font-medium">{qty}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => setQty((q) => q + 1)}
          className="flex h-10 w-10 items-center justify-center text-foreground hover:text-brand"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        disabled={!inStock}
        onClick={() => addToCart(product, qty)}
        className="flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
      >
        <ShoppingBasket className="h-4 w-4" />
        Add to Cart
      </button>

      <button
        type="button"
        aria-label="Toggle favourite"
        onClick={() => toggleFavourite(product)}
        className={`flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:text-brand ${
          fav ? "text-red-500" : "text-foreground"
        }`}
      >
        <Heart className={`h-4 w-4 ${fav ? "fill-red-500" : ""}`} />
      </button>
    </div>
  );
}
