import { createUser, findUserByEmail, seedDemoUser } from "@/lib/auth";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  await seedDemoUser();

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
    const normalizedEmail = email.toLowerCase();

    if (await findUserByEmail(normalizedEmail)) {
      return Response.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const user = await createUser(firstName, lastName, normalizedEmail, password);

    return Response.json(
      {
        success: true,
        message: "Account created successfully.",
        user,
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
