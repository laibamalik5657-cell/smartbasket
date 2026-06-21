import bcrypt from "bcrypt";
import { connectToDatabase } from "@/lib/mongodb";
import { User, IUser } from "@/models/User";
import { loginSchema } from "@/schema";

const SALT_ROUNDS = 12;

function sanitizeUser(user: IUser) {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    createdAt:
      user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : new Date(user.createdAt).toISOString(),
  };
}

// Ensure the demo account exists so the demo credentials always work.
async function seedDemoUser() {
  const demoEmail = "demo@smartbasket.com";
  const existing = await User.findOne({ email: demoEmail }).lean<IUser>();
  if (!existing) {
    await User.create({
      firstName: "Demo",
      lastName: "User",
      email: demoEmail,
      passwordHash: await bcrypt.hash("password123", SALT_ROUNDS),
    });
  }
}

export async function POST(request: Request) {
  await connectToDatabase();
  await seedDemoUser();

  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return Response.json(
        { success: false, message: firstError?.message ?? "Invalid input." },
        { status: 400 },
      );
    }

    const { email, password } = result.data;
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).lean<IUser>();

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return Response.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 },
      );
    }

    return Response.json(
      {
        success: true,
        message: "Signed in successfully.",
        user: sanitizeUser(user),
      },
      { status: 200 },
    );
  } catch {
    return Response.json(
      { success: false, message: "Invalid request body." },
      { status: 400 },
    );
  }
}
