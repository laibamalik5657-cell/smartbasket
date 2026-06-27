import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { forgotPasswordSchema } from "@/schema";
import { sendPasswordResetEmail } from "@/lib/email";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// Trusted, server-controlled base URL for the reset link. Never derive this
// from the request (Host header) — a spoofed host would poison the link and
// leak the reset token to an attacker's domain.
const APP_URL = (process.env.APP_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  "",
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return Response.json(
        { success: false, message: firstError?.message ?? "Invalid input." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const email = result.data.email.trim().toLowerCase();
    const user = await User.findOne({ email });

    // Only act if the account exists, but always return the same response below
    // so attackers can't enumerate registered emails.
    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      // Store only a hash — a DB leak shouldn't yield usable reset tokens.
      user.resetToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
      user.resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await user.save();

      const link = `${APP_URL}/reset-password?token=${rawToken}`;
      await sendPasswordResetEmail(email, link);
    }

    return Response.json(
      {
        success: true,
        message: "If an account exists, a password reset link has been sent.",
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
