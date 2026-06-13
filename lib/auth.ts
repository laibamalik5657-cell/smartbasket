import { randomBytes, createHash } from "crypto";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
};

export type SafeUser = Omit<User, "passwordHash" | "passwordSalt">;

/**
 * In-memory user store for the prototype. Data is lost when the dev server or
 * production runtime restarts. Replace with a real database for production.
 */
const users = new Map<string, User>();

function hashPassword(password: string, salt: string): string {
  return createHash("sha256").update(salt + password).digest("hex");
}

export function createUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): SafeUser {
  const normalizedEmail = email.trim().toLowerCase();
  const salt = randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);
  const id = randomBytes(12).toString("hex");

  const user: User = {
    id,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    passwordHash,
    passwordSalt: salt,
    createdAt: new Date().toISOString(),
  };

  users.set(normalizedEmail, user);
  return sanitizeUser(user);
}

export function findUserByEmail(email: string): User | undefined {
  return users.get(email.trim().toLowerCase());
}

export function verifyPassword(user: User, password: string): boolean {
  return hashPassword(password, user.passwordSalt) === user.passwordHash;
}

export function sanitizeUser(user: User): SafeUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export function seedDemoUser(): void {
  // Ensure a predictable demo account exists for manual testing.
  if (!findUserByEmail("demo@smartbasket.com")) {
    createUser("Demo", "User", "demo@smartbasket.com", "password123");
  }
}
