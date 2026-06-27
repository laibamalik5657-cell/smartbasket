import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Order, IOrder, toPlainOrder } from "@/models/Order";
import { getAuthUser } from "@/lib/auth";

// GET /api/orders/[id] — fetch one order, but only if it belongs to the caller.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authUser = getAuthUser(request);
  if (!authUser) {
    return Response.json(
      { success: false, message: "Unauthorized." },
      { status: 401 },
    );
  }

  const { id } = await params;

  // Avoid a CastError on a malformed id — treat it as not found.
  if (!mongoose.isValidObjectId(id)) {
    return Response.json(
      { success: false, message: "Order not found." },
      { status: 404 },
    );
  }

  try {
    await connectToDatabase();
    const doc = await Order.findOne({
      _id: id,
      userId: authUser.id,
    }).lean<IOrder>();

    if (!doc) {
      return Response.json(
        { success: false, message: "Order not found." },
        { status: 404 },
      );
    }

    return Response.json(
      { success: true, order: toPlainOrder(doc) },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/orders/[id] failed", error);
    return Response.json(
      { success: false, message: "Failed to load order." },
      { status: 500 },
    );
  }
}
