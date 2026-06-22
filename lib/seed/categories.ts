import { connectToDatabase } from "../mongodb";
import { Category, ICategory } from "../../models/Category";

export const defaultCategories: Pick<
  ICategory,
  "name" | "image" | "tint" | "slug" | "order" | "count"
>[] = [
  {
    name: "Fresh Vegetables",
    image:
      "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400&q=80",
    tint: "bg-green-50",
    slug: "fresh-vegetables",
    order: 1,
    count: "45+ Items",
  },
  {
    name: "Fruits",
    image:
      "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80",
    tint: "bg-green-50",
    slug: "fruits",
    order: 2,
    count: "45+ Items",
  },
  {
    name: "Milk and Dairy",
    image:
      "https://pictures.grocerapps.com/lgthumb/grocerapp-dairy-66a9feeaa78cd.jpeg",
    tint: "bg-red-50",
    slug: "milk-and-dairy",
    order: 3,
    count: "30+ Items",
  },
  {
    name: "Masalas & Herbs",
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80",
    tint: "bg-red-50",
    slug: "masalas-herbs",
    order: 4,
    count: "30+ Items",
  },
  {
    name: "Oil & Ghee",
    image:
      "https://pictures.grocerapps.com/lgthumb/grocerapp-edible-oils-ghee-68c4652344104.png",
    tint: "bg-amber-50",
    slug: "oil-ghee",
    order: 5,
    count: "15+ Items",
  },
  {
    name: "Bakery & Bread",
    image:
      "https://pictures.grocerapps.com/lgthumb/grocerapp-breakfast-essentials-6596947720406.jpeg",
    tint: "bg-yellow-50",
    slug: "bakery-bread",
    order: 6,
    count: "25+ Items",
  },
  {
    name: "Sauces & Pastes",
    image:
      "https://pictures.grocerapps.com/lgthumb/grocerapp-sauces-olives-pickles-61e954aba83be.jpeg",
    tint: "bg-rose-50",
    slug: "sauces-pastes",
    order: 7,
    count: "22+ Items",
  },
  {
    name: "Tapal Tea & Coffee",
    image:
      "https://qne.com.pk/cdn/shop/collections/tea_and_coffee_ffeb20f1-b6c0-4139-96c7-38f349af2b6e.png?v=1731251238&width=1100",
    tint: "bg-orange-50",
    slug: "tea-coffee",
    order: 8,
    count: "20+ Items",
  },
  {
    name: "Cold Drinks & Juices",
    image:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80",
    tint: "bg-sky-50",
    slug: "cold-drinks-juices",
    order: 9,
    count: "35+ Items",
  },
  {
    name: "Snacks",
    image:
      "https://pictures.grocerapps.com/lgthumb/grocerapp-instant-food-61eaf560b6744.jpeg",
    tint: "bg-red-100",
    slug: "snacks",
    order: 10,
    count: "10+ Items",
  },
  {
    name: "Body & Hair Care",
    image:
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80",
    tint: "bg-blue-50",
    slug: "body-hair-care",
    order: 11,
    count: "25+ Items",
  },
  {
    name: "Home Cleaning Essentials",
    image:
      "https://pictures.grocerapps.com/lgthumb/grocerapp-home-care-671371cd5d0b1.jpeg",
    tint: "bg-blue-50",
    slug: "home-cleaning",
    order: 12,
    count: "25+ Items",
  },
  {
    name: "Health & Wellness",
    image:
      "https://pictures.grocerapps.com/lgthumb/grocerapp-otc-wellness-61eab733c1ec4.jpeg",
    tint: "bg-blue-50",
    slug: "health-wellness",
    order: 13,
    count: "25+ Items",
  },
];

export async function resetAndSeedCategories(): Promise<void> {
  await connectToDatabase();
  await Category.deleteMany({});
  await Category.insertMany(defaultCategories);
}
