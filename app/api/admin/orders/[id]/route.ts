import { connectToDatabase } from "@/lib/mongodb";
import { Order, IOrder, toPlainOrder } from "@/models/Order";
import { User, IUser } from "@/models/User";
import { requireAdmin } from "@/lib/auth";
import { assignOrderSchema } from "@/schema";

// PATCH /api/admin/orders/[id] — assign a rider or cancel.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requireAdmin(request)) {
    return Response.json({ success: false, message: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  await connectToDatabase();

  try {
    const body = await request.json();
    const result = assignOrderSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return Response.json(
        { success: false, message: firstError?.message ?? "Invalid input." },
        { status: 400 },
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return Response.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    if (result.data.action === "assign") {
      // Legal from pending or assigned (re-assign / swap rider).
      if (order.status !== "pending" && order.status !== "assigned") {
        return Response.json(
          { success: false, message: `Cannot assign an order that is ${order.status}.` },
          { status: 409 },
        );
      }
      const rider = await User.findOne({
        _id: result.data.riderId,
        role: "rider",
      }).lean<IUser>();
      if (!rider) {
        return Response.json({ success: false, message: "Rider not found." }, { status: 400 });
      }
      order.riderId = rider._id;
      order.status = "assigned";
    } else {
      // cancel — legal from pending or assigned.
      if (order.status !== "pending" && order.status !== "assigned") {
        return Response.json(
          { success: false, message: `Cannot cancel an order that is ${order.status}.` },
          { status: 409 },
        );
      }
      order.status = "cancelled";
    }

    await order.save();
    return Response.json(
      { success: true, order: toPlainOrder(order as unknown as IOrder) },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH /api/admin/orders/[id] failed", error);
    return Response.json({ success: false, message: "Invalid request." }, { status: 400 });
  }
}
