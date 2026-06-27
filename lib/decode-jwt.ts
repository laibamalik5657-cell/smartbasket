/**
 * Client-safe JWT decoding.
 *
 * This only base64url-decodes the token payload to read the user claims — it
 * does NOT verify the signature (verification needs the server secret). Use it
 * purely to read who the current user is from a token already obtained from the
 * backend; never trust it for authorization decisions.
 */

import type { User } from "@/lib/store";

/** Claims we sign into the token in `app/api/auth/login/route.ts`. */
export interface JwtPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: "user" | "admin" | "rider";
  iat?: number;
  exp?: number;
}

/** Base64url-decode a single JWT segment to a UTF-8 string (browser + node). */
function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  if (typeof atob === "function") {
    // Browser: decode then fix UTF-8 multibyte characters.
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  // Node / SSR fallback.
  return Buffer.from(padded, "base64").toString("utf-8");
}

/** Decode the payload of a JWT. Returns null if the token is malformed. */
export function decodeJwt(token: string): JwtPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(parts[1])) as JwtPayload;
    return payload;
  } catch {
    return null;
  }
}

/** True if the token has an `exp` claim that is in the past. */
export function isJwtExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now();
}

/** Map a decoded token to the store's `User` shape, or null if invalid. */
export function userFromToken(token: string): User | null {
  const payload = decodeJwt(token);
  if (!payload?.id || !payload.email) return null;
  return {
    id: payload.id,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    role: payload.role ?? "user",
  };
}
