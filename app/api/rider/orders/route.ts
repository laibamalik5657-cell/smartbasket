import { connectToDatabase } from "@/lib/mongodb";
import { Order, IOrder, toPlainOrder } from "@/models/Order";
import { requireRider } from "@/lib/auth";

// GET /api/rider/orders — orders assigned to the calling rider.
export async function GET(request: Request) {
  const rider = requireRider(request);
  if (!rider) {
    return Response.json({ success: false, message: "Forbidden." }, { status: 403 });
  }
  try {
    await connectToDatabase();
    const docs = await Order.find({
      riderId: rider.id,
      status: { $in: ["assigned", "delivered"] },
    })
      .sort({ createdAt: -1 })
      .lean<IOrder[]>();
    return Response.json({ success: true, orders: docs.map(toPlainOrder) }, { status: 200 });
  } catch (error) {
    console.error("GET /api/rider/orders failed", error);
    return Response.json({ success: false, message: "Failed to load orders." }, { status: 500 });
  }
}
