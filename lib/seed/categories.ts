import { connectToDatabase } from "@/lib/mongodb";
import { Category, ICategory } from "@/lib/models/Category";

export const defaultCategories: Pick<
  ICategory,
  "name" | "emoji" | "tint" | "slug" | "order"
>[] = [
  { name: "Vegetables", emoji: "/dashboard/carrots.png", tint: "bg-red-50", slug: "vegetables", order: 1 },
  { name: "Fruits", emoji: "/dashboard/apple.png", tint: "bg-green-50", slug: "fruits", order: 2 },
  { name: "Dairy", emoji: "/dashboard/milk-bottle.png", tint: "bg-blue-50", slug: "dairy", order: 3 },
  { name: "Bakery", emoji: "/dashboard/white-bread.png", tint: "bg-amber-50", slug: "bakery", order: 4 },
  { name: "Meat", emoji: "/dashboard/chicken.png", tint: "bg-rose-50", slug: "meat", order: 5 },
  { name: "Beverages", emoji: "/dashboard/drink.png", tint: "bg-orange-50", slug: "beverages", order: 6 },
  { name: "Snacks", emoji: "/dashboard/popcorn.png", tint: "bg-yellow-50", slug: "snacks", order: 7 },
  { name: "Frozen", emoji: "/dashboard/ice-cream.png", tint: "bg-sky-50", slug: "frozen", order: 8 },
];

export async function seedCategories(): Promise<void> {
  await connectToDatabase();

  const count = await Category.countDocuments();
  if (count > 0) {
    return;
  }

  await Category.insertMany(defaultCategories);
}
