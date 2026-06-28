import { connectToDatabase } from "@/lib/mongodb";
import { User, IUser } from "@/models/User";
import { getAuthUser, signToken } from "@/lib/auth";
import { updateProfileSchema } from "@/schema";

export async function PATCH(request: Request) {
  await connectToDatabase();

  // Authenticate via the Bearer JWT (the only session we have).
  const authUser = getAuthUser(request);
  if (!authUser) {
    return Response.json(
      { success: false, message: "Unauthorized." },
      { status: 401 },
    );
  }
  const userId = authUser.id;

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
      role: updated.role ?? "user",
    };
    const newToken = signToken(userInfo);

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
