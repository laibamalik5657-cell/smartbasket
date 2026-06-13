import { forgotPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return Response.json(
        { success: false, message: firstError?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    // This is a prototype: no real email is sent. Always return the same
    // message so attackers cannot enumerate registered email addresses.
    return Response.json(
      {
        success: true,
        message: "If an account exists, a password reset link has been sent.",
      },
      { status: 200 }
    );
  } catch {
    return Response.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }
}
