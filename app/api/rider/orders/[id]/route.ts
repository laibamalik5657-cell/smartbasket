import { connectToDatabase } from "@/lib/mongodb";
import { Order, IOrder, toPlainOrder } from "@/models/Order";
import { requireRider } from "@/lib/auth";

// PATCH /api/rider/orders/[id] — mark the rider's own assigned order delivered.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const rider = requireRider(request);
  if (!rider) {
    return Response.json({ success: false, message: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  await connectToDatabase();

  try {
    const order = await Order.findById(id);
    if (!order) {
      return Response.json({ success: false, message: "Order not found." }, { status: 404 });
    }
    if (!order.riderId || order.riderId.toString() !== rider.id) {
      return Response.json({ success: false, message: "Not your order." }, { status: 403 });
    }
    if (order.status !== "assigned") {
      return Response.json(
        { success: false, message: `Cannot deliver an order that is ${order.status}.` },
        { status: 409 },
      );
    }

    order.status = "delivered";
    await order.save();
    return Response.json(
      { success: true, order: toPlainOrder(order as unknown as IOrder) },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH /api/rider/orders/[id] failed", error);
    return Response.json({ success: false, message: "Invalid request." }, { status: 400 });
  }
}
