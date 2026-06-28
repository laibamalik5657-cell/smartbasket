import { connectToDatabase } from "../mongodb";
import { Product, IProduct } from "../../models/Product";

type SeedProduct = Pick<
  IProduct,
  | "name" | "slug" | "price" | "unit" | "image" | "category"
  | "description" | "tag" | "oldPrice" | "discount" | "rating" | "order"
>;

export const defaultProducts: SeedProduct[] = [
  // --- from the home page ---
  { name: "Bananas", slug: "bananas", price: 250, unit: "/ dozen", image: "/products/bananas.png", category: "Fruits", tag: "Fresh", order: 1, description: "Sweet, ripe bananas picked at peak freshness — a quick, potassium-rich snack." },
  { name: "Bread", slug: "bread", price: 180, unit: "/ 1 pack", image: "/products/white-bread.png", category: "Bakery & Bread", tag: "Best Seller", order: 2, description: "Soft, freshly baked white bread — perfect for sandwiches and breakfast toast." },
  { name: "Milk", slug: "milk", price: 220, unit: "/ 1L", image: "/products/milk.png", category: "Milk and Dairy", tag: "Daily", order: 3, description: "Fresh full-cream milk, rich and creamy for tea, coffee, and cereal." },
  { name: "Flour", slug: "flour", price: 1100, unit: "/ 10 kg", image: "/products/flour.png", category: "Bakery & Bread", tag: "Bakery", order: 4, description: "Fine all-purpose flour milled for everyday rotis, breads, and baking." },
  { name: "Rice", slug: "rice", price: 400, unit: "/ 1 kg", image: "/products/rice.png", category: "Staples", tag: "Seasonal", order: 5, description: "Long-grain rice with a fragrant aroma — fluffy and separate when cooked." },
  { name: "Eggs", slug: "eggs", price: 350, unit: "/ 1 dozen", image: "/products/eggs.png", category: "Milk and Dairy", tag: "Organic", order: 6, description: "Farm-fresh eggs, a dozen of protein-packed goodness for any meal." },
  { name: "Cooking Oil", slug: "cooking-oil", price: 520, unit: "/ 1 kg", image: "/products/oil.png", category: "Oil & Ghee", tag: "Pantry", order: 7, description: "Light, healthy cooking oil suitable for frying, sautéing, and everyday cooking." },
  { name: "Chips", slug: "chips", price: 60, unit: "/ 1 pack", image: "/products/milk.png", category: "Snacks", tag: "Fresh", order: 8, description: "Crispy, lightly salted potato chips — the perfect crunchy snack." },

  // --- from the see-more page (with discount/rating fields) ---
  { name: "Dalda Banaspati Ghee Polybag", slug: "dalda-banaspati-ghee", price: 525, unit: "1 Kg", image: "/products/seemore-1.jpg", category: "Oil & Ghee", oldPrice: 560, discount: "6% OFF", rating: 4.8, order: 9, description: "Pakistan's trusted banaspati ghee for rich, flavourful cooking and frying." },
  { name: "Nestlé MilkPak Cream", slug: "nestle-milkpak-cream", price: 190, unit: "200 ml", image: "/products/seemore-2.jpg", category: "Milk and Dairy", oldPrice: 210, discount: "10% OFF", rating: 4.9, order: 10, description: "Thick, smooth dairy cream to top desserts, curries, and festive dishes." },
  { name: "Tapal Danedar Tea Family Pack", slug: "tapal-danedar-tea", price: 670, unit: "430 g", image: "/products/seemore-3.jpg", category: "Tapal Tea & Coffee", oldPrice: 720, discount: "Rs. 50 Save", rating: 4.7, order: 11, description: "Bold, granular black tea that brews a strong, aromatic cup every time." },
  { name: "National Iodized Salt", slug: "national-iodized-salt", price: 70, unit: "800 g", image: "/products/seemore-4.jpg", category: "Staples", oldPrice: 85, discount: "17% OFF", rating: 4.5, order: 12, description: "Pure iodized table salt for seasoning and everyday cooking essentials." },
  { name: "Dawn Bread Regular", slug: "dawn-bread-regular", price: 240, unit: "Large", image: "/products/seemore-5.jpg", category: "Bakery & Bread", oldPrice: 260, discount: "Rs. 20 Save", rating: 4.6, order: 13, description: "Fresh, fluffy large loaf — soft slices ideal for breakfast and snacks." },
  { name: "Shan Biryani Masala Double Pack", slug: "shan-biryani-masala", price: 160, unit: "100 g", image: "/products/seemore-6.jpg", category: "Masalas & Herbs", oldPrice: 180, discount: "11% OFF", rating: 4.9, order: 14, description: "Authentic biryani spice blend for a perfectly balanced, aromatic biryani." },
];

export async function resetAndSeedProducts(): Promise<void> {
  await connectToDatabase();
  await Product.deleteMany({});
  await Product.insertMany(defaultProducts);
}
