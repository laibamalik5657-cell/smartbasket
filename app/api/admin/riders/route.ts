import bcrypt from "bcrypt";
import { connectToDatabase } from "@/lib/mongodb";
import { User, IUser } from "@/models/User";
import { requireAdmin } from "@/lib/auth";
import { createRiderSchema } from "@/schema";

const SALT_ROUNDS = 12;

// GET /api/admin/riders — list all rider accounts.
export async function GET(request: Request) {
  if (!requireAdmin(request)) {
    return Response.json({ success: false, message: "Forbidden." }, { status: 403 });
  }
  try {
    await connectToDatabase();
    const riders = await User.find({ role: "rider" })
      .sort({ createdAt: -1 })
      .lean<IUser[]>();
    return Response.json(
      {
        success: true,
        riders: riders.map((r) => ({
          id: r._id.toString(),
          firstName: r.firstName,
          lastName: r.lastName,
          email: r.email,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/admin/riders failed", error);
    return Response.json({ success: false, message: "Failed to load riders." }, { status: 500 });
  }
}

// POST /api/admin/riders — create a rider account.
export async function POST(request: Request) {
  if (!requireAdmin(request)) {
    return Response.json({ success: false, message: "Forbidden." }, { status: 403 });
  }
  await connectToDatabase();
  try {
    const body = await request.json();
    const result = createRiderSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return Response.json(
        { success: false, message: firstError?.message ?? "Invalid input." },
        { status: 400 },
      );
    }

    const { firstName, lastName, email, password } = result.data;
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail }).lean<IUser>();
    if (existing) {
      return Response.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const rider = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
      role: "rider",
    });

    return Response.json(
      {
        success: true,
        rider: {
          id: rider._id.toString(),
          firstName: rider.firstName,
          lastName: rider.lastName,
          email: rider.email,
        },
      },
      { status: 201 },
    );
  } catch {
    return Response.json({ success: false, message: "Invalid request body." }, { status: 400 });
  }
}
