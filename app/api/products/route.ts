import { connectToDatabase } from "@/lib/mongodb";
import { Product, IProduct } from "@/models/Product";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const category = new URL(request.url).searchParams.get("category");
    const query =
      category && category !== "All" ? { category } : {};
    const docs = await Product.find(query).sort({ order: 1 }).lean<IProduct[]>();
    const products = docs.map((p) => ({
      id: p.slug,
      slug: p.slug,
      name: p.name,
      price: p.price,
      unit: p.unit ?? "",
      image: p.image,
      category: p.category ?? "",
      description: p.description,
      tag: p.tag ?? "",
      oldPrice: p.oldPrice ?? null,
      discount: p.discount ?? "",
      rating: p.rating ?? null,
      inStock: p.inStock,
    }));
    return Response.json({ success: true, products }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    return Response.json({ success: false, message }, { status: 500 });
  }
}
