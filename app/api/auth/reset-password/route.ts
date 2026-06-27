import crypto from "crypto";
import bcrypt from "bcrypt";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { resetPasswordSchema } from "@/schema";

const SALT_ROUNDS = 12;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return Response.json(
        { success: false, message: firstError?.message ?? "Invalid input." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const { token, password } = result.data;
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetToken: tokenHash,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return Response.json(
        { success: false, message: "This reset link is invalid or has expired." },
        { status: 400 },
      );
    }

    user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    // Consume the token so the link can't be reused.
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return Response.json(
      { success: true, message: "Password updated. You can now sign in." },
      { status: 200 },
    );
  } catch {
    return Response.json(
      { success: false, message: "Invalid request body." },
      { status: 400 },
    );
  }
}
