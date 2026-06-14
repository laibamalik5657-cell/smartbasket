import { randomBytes, createHash } from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { User, IUser } from "@/lib/models/User";

export type SafeUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
};


function hashPassword(password: string, salt: string): string {
  return createHash("sha256").update(salt + password).digest("hex");
}

export async function createUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<SafeUser> {
  await connectToDatabase();

  const normalizedEmail = email.trim().toLowerCase();
  const salt = randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);

  const user = await User.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    passwordHash,
    passwordSalt: salt,
  });

  return sanitizeUser(user);
}

export async function findUserByEmail(
  email: string
): Promise<IUser | null> {
  await connectToDatabase();
  return User.findOne({ email: email.trim().toLowerCase() }).lean<IUser>();
}

export function verifyPassword(user: IUser, password: string): boolean {
  return hashPassword(password, user.passwordSalt) === user.passwordHash;
}

export function sanitizeUser(user: IUser): SafeUser {
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

export async function seedDemoUser(): Promise<void> {
  await connectToDatabase();

  const demoEmail = "demo@smartbasket.com";
  const existing = await findUserByEmail(demoEmail);

  if (!existing) {
    await createUser("Demo", "User", demoEmail, "password123");
  }
}
