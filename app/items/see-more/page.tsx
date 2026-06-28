import { connectToDatabase } from "@/lib/mongodb";
import { Product, IProduct } from "@/models/Product";
import FeaturedList, { type SeeMoreProduct } from "./featured-list";

export const dynamic = "force-dynamic";

export default async function FeaturedTodayPage() {
  await connectToDatabase();
  const docs = await Product.find({}).sort({ order: 1 }).lean<IProduct[]>();
  const products: SeeMoreProduct[] = docs.map((p) => ({
    id: p.slug,
    slug: p.slug,
    name: p.name,
    price: p.price,
    oldPrice: p.oldPrice ?? null,
    discount: p.discount ?? "",
    rating: p.rating ?? null,
    image: p.image,
    category: p.category ?? "",
    unit: p.unit ?? "",
  }));

  return <FeaturedList products={products} />;
}
