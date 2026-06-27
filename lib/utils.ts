import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/* --- Auth token (JWT) storage ----------------------------------------------
 * The signed-in user lives entirely in a JWT we keep in localStorage: save it
 * on login, read it wherever we need the user (decode with lib/decode-jwt),
 * and delete it on logout. Plain functions — call them only on the client. */
const TOKEN_KEY = "smartbasket:token"

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function deleteToken() {
  localStorage.removeItem(TOKEN_KEY)
}
