import { connectToDatabase } from "@/lib/mongodb";
import { Order, IOrder, toPlainOrder } from "@/models/Order";
import { User, IUser } from "@/models/User";
import { requireAdmin } from "@/lib/auth";
import { orderStatusQuerySchema } from "@/schema";

// GET /api/admin/orders?status= — all orders, newest first, with rider name.
export async function GET(request: Request) {
  if (!requireAdmin(request)) {
    return Response.json({ success: false, message: "Forbidden." }, { status: 403 });
  }
  try {
    await connectToDatabase();

    const url = new URL(request.url);
    const parsed = orderStatusQuerySchema.safeParse({
      status: url.searchParams.get("status") ?? undefined,
    });
    const filter = parsed.success && parsed.data.status ? { status: parsed.data.status } : {};

    const docs = await Order.find(filter).sort({ createdAt: -1 }).lean<IOrder[]>();

    // Join rider names in one query.
    const riderIds = [...new Set(docs.filter((o) => o.riderId).map((o) => o.riderId!.toString()))];
    const riders = riderIds.length
      ? await User.find({ _id: { $in: riderIds } }).lean<IUser[]>()
      : [];
    const nameById = new Map(
      riders.map((r) => [r._id.toString(), `${r.firstName} ${r.lastName}`.trim()]),
    );

    const orders = docs.map((o) => {
      const plain = toPlainOrder(o);
      return { ...plain, riderName: plain.riderId ? nameById.get(plain.riderId) ?? null : null };
    });

    return Response.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/orders failed", error);
    return Response.json({ success: false, message: "Failed to load orders." }, { status: 500 });
  }
}
