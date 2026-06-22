import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import { User, IUser } from "@/models/User";
import { loginSchema } from "@/schema";

// Require a real secret — never fall back to a hardcoded default (forgeable tokens).
// Generate one with `openssl rand -base64 48` and set JWT_SECRET in the environment.
// Resolved at module load so a missing secret fails fast at startup, not per-request.
const JWT_SECRET: string = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET must be set");
  }
  return secret;
})();
const JWT_EXPIRES_IN = "7d";

export async function POST(request: Request) {
  await connectToDatabase();

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

    const userInfo = {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };

    const token = jwt.sign(userInfo, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return Response.json(
      {
        success: true,
        message: "Signed in successfully.",
        token,
        user: {
          ...userInfo,
          createdAt:
            user.createdAt instanceof Date
              ? user.createdAt.toISOString()
              : new Date(user.createdAt).toISOString(),
        },
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
