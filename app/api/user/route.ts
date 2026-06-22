import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import { User, IUser } from "@/models/User";
import { updateProfileSchema } from "@/schema";

// Resolved at module load so a missing secret fails fast at startup, not per-request.
const JWT_SECRET: string = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET must be set");
  }
  return secret;
})();
const JWT_EXPIRES_IN = "7d";

export async function PATCH(request: Request) {
  await connectToDatabase();

  // Authenticate via the Bearer JWT (the only session we have).
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  let userId: string;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id?: string };
    if (!payload.id) throw new Error("Missing subject");
    userId = payload.id;
  } catch {
    return Response.json(
      { success: false, message: "Unauthorized." },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return Response.json(
        { success: false, message: firstError?.message ?? "Invalid input." },
        { status: 400 },
      );
    }

    const { firstName, lastName } = result.data;

    const updated = await User.findByIdAndUpdate(
      userId,
      { firstName: firstName.trim(), lastName: lastName.trim() },
      { new: true },
    ).lean<IUser>();

    if (!updated) {
      return Response.json(
        { success: false, message: "User not found." },
        { status: 404 },
      );
    }

    // Re-issue the token so its name claims (and the navbar/profile) stay in sync.
    const userInfo = {
      id: updated._id.toString(),
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
    };
    const newToken = jwt.sign(userInfo, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return Response.json(
      {
        success: true,
        message: "Profile updated.",
        token: newToken,
        user: userInfo,
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
