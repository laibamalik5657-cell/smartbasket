import {
  findUserByEmail,
  sanitizeUser,
  seedDemoUser,
  verifyPassword,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  await seedDemoUser();

  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return Response.json(
        { success: false, message: firstError?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const user = await findUserByEmail(email);

    if (!user || !verifyPassword(user, password)) {
      return Response.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Signed in successfully.",
        user: sanitizeUser(user),
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
