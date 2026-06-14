import { resetAndSeedCategories } from "@/lib/seed/categories";

export async function POST() {
  try {
    await resetAndSeedCategories();
    return Response.json(
      { success: true, message: "Categories seeded successfully." },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    return Response.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
