import mongoose from "mongoose";
import { resetAndSeedCategories } from "../lib/seed/categories";
import { resetAndSeedProducts } from "../lib/seed/products";

async function main() {
  await resetAndSeedCategories();
  await resetAndSeedProducts();
  console.log("✓ Seeded categories and products.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
