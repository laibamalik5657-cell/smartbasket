import jwt from "jsonwebtoken";

// Require a real secret — never fall back to a hardcoded default (forgeable
// tokens). Generate one with `openssl rand -base64 48` and set JWT_SECRET in
// the environment. Resolved at module load so a missing secret fails fast at
// startup, not per-request.
const JWT_SECRET: string = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET must be set");
  }
  return secret;
})();
const JWT_EXPIRES_IN = "7d";

/** The claims we sign into every token (kept in sync with lib/decode-jwt). */
export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "admin" | "rider";
}

/** Sign a 7-day token for a user. */
export function signToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Read and verify the Bearer token on a request. Returns the user claims, or
 * `null` if the header is missing or the token is invalid/expired. Use this in
 * any protected route handler:
 *
 *   const user = getAuthUser(request);
 *   if (!user) return Response.json({ ... }, { status: 401 });
 */
export function getAuthUser(request: Request): AuthUser | null {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  try {
    // Legacy tokens issued before `role` existed verify fine but lack the
    // claim — default it so the returned object always conforms to AuthUser.
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser & {
      role?: AuthUser["role"];
    };
    return payload.id ? { ...payload, role: payload.role ?? "user" } : null;
  } catch {
    return null;
  }
}

/** Like getAuthUser, but only returns the user when they are an admin. */
export function requireAdmin(request: Request): AuthUser | null {
  const user = getAuthUser(request);
  return user && user.role === "admin" ? user : null;
}

/** Like getAuthUser, but only returns the user when they are a rider. */
export function requireRider(request: Request): AuthUser | null {
  const user = getAuthUser(request);
  return user && user.role === "rider" ? user : null;
}
