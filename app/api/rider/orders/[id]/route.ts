import { connectToDatabase } from "@/lib/mongodb";
import { Order, IOrder, toPlainOrder } from "@/models/Order";
import { requireRider } from "@/lib/auth";
import { riderOrderUpdateSchema } from "@/schema";

// PATCH /api/rider/orders/[id] — rider advances their own order:
// assigned → out_for_delivery (picked up) → delivered.
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
    const body = await request.json();
    const result = riderOrderUpdateSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return Response.json(
        { success: false, message: firstError?.message ?? "Invalid input." },
        { status: 400 },
      );
    }
    const target = result.data.status;

    const order = await Order.findById(id);
    if (!order) {
      return Response.json({ success: false, message: "Order not found." }, { status: 404 });
    }
    if (!order.riderId || order.riderId.toString() !== rider.id) {
      return Response.json({ success: false, message: "Not your order." }, { status: 403 });
    }

    const legal =
      (target === "out_for_delivery" && order.status === "assigned") ||
      (target === "delivered" && order.status === "out_for_delivery");
    if (!legal) {
      return Response.json(
        { success: false, message: `Cannot move an order from ${order.status} to ${target}.` },
        { status: 409 },
      );
    }

    order.status = target;
    if (target === "out_for_delivery") {
      order.outForDeliveryAt = new Date();
    }
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
