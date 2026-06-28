import { connectToDatabase } from "@/lib/mongodb";
import { Order, IOrder, toPlainOrder } from "@/models/Order";
import { getAuthUser } from "@/lib/auth";
import { createOrderSchema } from "@/schema";

/** Delivery fee rule — free over Rs. 500 (and on an empty subtotal). */
function shippingFor(subtotal: number): number {
  return subtotal > 500 || subtotal === 0 ? 0 : 50;
}

// POST /api/orders — place an order for the signed-in user.
export async function POST(request: Request) {
  const authUser = getAuthUser(request);
  if (!authUser) {
    return Response.json(
      { success: false, message: "Please sign in to place an order." },
      { status: 401 },
    );
  }

  await connectToDatabase();

  try {
    const body = await request.json();
    const result = createOrderSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return Response.json(
        { success: false, message: firstError?.message ?? "Invalid input." },
        { status: 400 },
      );
    }

    const { items, payment, customer } = result.data;

    // Recompute totals server-side from the (validated) item prices.
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = shippingFor(subtotal);
    const total = subtotal + shipping;

    const doc = await Order.create({
      userId: authUser.id,
      items,
      subtotal,
      shipping,
      total,
      payment,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        city: customer.city.trim(),
        area: customer.area.trim(),
        address: customer.address.trim(),
      },
    });

    return Response.json(
      { success: true, order: toPlainOrder(doc as unknown as IOrder) },
      { status: 201 },
    );
  } catch {
    return Response.json(
      { success: false, message: "Invalid request body." },
      { status: 400 },
    );
  }
}

// GET /api/orders — list the signed-in user's orders, newest first.
export async function GET(request: Request) {
  const authUser = getAuthUser(request);
  if (!authUser) {
    return Response.json(
      { success: false, message: "Unauthorized." },
      { status: 401 },
    );
  }

  try {
    await connectToDatabase();
    const docs = await Order.find({ userId: authUser.id })
      .sort({ createdAt: -1 })
      .lean<IOrder[]>();
    return Response.json(
      { success: true, orders: docs.map(toPlainOrder) },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/orders failed", error);
    return Response.json(
      { success: false, message: "Failed to load orders." },
      { status: 500 },
    );
  }
}
