import { connectToDatabase } from "@/lib/mongodb";
import { Product, IProduct } from "@/models/Product";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const params = new URL(request.url).searchParams;
    const category = params.get("category");
    const q = params.get("q");

    const query: Record<string, unknown> = {};
    if (category && category !== "All") {
      query.category = category;
    }
    if (q && q.trim()) {
      // Escape regex metacharacters so user input can't break (or abuse) the query.
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.name = { $regex: escaped, $options: "i" };
    }

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
    console.error("GET /api/products failed", error);
    return Response.json(
      { success: false, message: "Failed to load products." },
      { status: 500 },
    );
  }
}
