import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import { Product, IProduct } from "@/models/Product";
import ProductActions from "./product-actions";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await connectToDatabase();
  const doc = await Product.findOne({ slug }).lean<IProduct>();
  if (!doc) notFound();

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-4xl">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-brand">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/items/see-more" className="hover:text-brand">
            Products
          </Link>{" "}
          / <span className="text-foreground">{doc.name}</span>
        </nav>

        <div className="grid gap-8 rounded-2xl border border-border bg-card p-6 sm:p-8 md:grid-cols-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface">
            <Image
              src={doc.image}
              alt={doc.name}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-contain p-6"
            />
          </div>

          <div className="flex flex-col">
            {doc.category && (
              <span className="text-xs font-medium uppercase tracking-wide text-brand">
                {doc.category}
              </span>
            )}
            <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
              {doc.name}
            </h1>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                Rs. {doc.price}
                {doc.unit && (
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {doc.unit}
                  </span>
                )}
              </span>
              {doc.oldPrice ? (
                <span className="text-sm text-muted-foreground line-through">
                  Rs. {doc.oldPrice}
                </span>
              ) : null}
            </div>

            <p
              className={`mt-2 text-sm font-medium ${
                doc.inStock ? "text-brand" : "text-red-500"
              }`}
            >
              {doc.inStock ? "In stock" : "Out of stock"}
            </p>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {doc.description}
            </p>

            <ProductActions
              product={{
                id: doc.slug,
                name: doc.name,
                price: doc.price,
                image: doc.image,
                unit: doc.unit ?? "",
                category: doc.category ?? "",
              }}
              inStock={doc.inStock}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
