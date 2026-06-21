import bcrypt from "bcrypt";
import { connectToDatabase } from "@/lib/mongodb";
import { User, IUser } from "@/models/User";
import { registerSchema } from "@/schema";

const SALT_ROUNDS = 12;

export async function POST(request: Request) {
  await connectToDatabase();

  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return Response.json(
        { success: false, message: firstError?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password } = result.data;
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({
      email: normalizedEmail,
    }).lean<IUser>();

    if (existing) {
      return Response.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
    });

    return Response.json(
      {
        success: true,
        message: "Account created successfully.",
        user: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch {
    return Response.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }
}
