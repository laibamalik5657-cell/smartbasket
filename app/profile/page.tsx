"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isAxiosError } from "axios";
import { LogOut, Pencil, User as UserIcon } from "lucide-react";

import apiClient from "@/lib/axios";
import { useStore } from "@/lib/store";
import { userFromToken } from "@/lib/decode-jwt";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, setUser, setToken, clearUser } = useStore();

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  function handleLogout() {
    clearUser();
    router.push("/");
  }

  function startEditing() {
    if (!user) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setMessage(null);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setMessage(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!firstName.trim() || !lastName.trim()) {
      setMessage({ type: "error", text: "First and last name are required." });
      return;
    }

    setSaving(true);
    try {
      const { data } = await apiClient.patch(
        "/user",
        { firstName: firstName.trim(), lastName: lastName.trim() },
        { headers: { Authorization: `Bearer ${token ?? ""}` } },
      );
      if (data?.token) {
        setToken(data.token);
        setUser(userFromToken(data.token) ?? data.user ?? null);
      } else if (data?.user) {
        setUser(data.user);
      }
      setEditing(false);
      setMessage({ type: "success", text: "Profile updated." });
    } catch (err) {
      const text = isAxiosError(err)
        ? err.response?.data?.message || "Failed to update profile."
        : "Something went wrong. Please try again.";
      setMessage({ type: "error", text });
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto text-center bg-card rounded-2xl shadow-sm border border-border p-12">
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Please sign in to view your profile.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-card rounded-2xl shadow-sm border border-border p-8">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
              <UserIcon className="h-7 w-7" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          {!editing && (
            <button
              type="button"
              onClick={startEditing}
              aria-label="Edit profile"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-brand hover:text-brand"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          )}
        </div>

        {message && (
          <div
            className={`mt-6 rounded-lg px-3 py-2 text-sm ${
              message.type === "error"
                ? "bg-red-50 text-red-600"
                : "bg-green-50 text-green-600"
            }`}
          >
            {message.text}
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSave} className="py-6 space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="firstName"
                className="text-sm text-muted-foreground"
              >
                First name
              </label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="lastName"
                className="text-sm text-muted-foreground"
              >
                Last name
              </label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm text-muted-foreground">
                Email
              </label>
              <Input
                id="email"
                value={user.email}
                disabled
                className="cursor-not-allowed opacity-60"
              />
              <p className="text-xs text-muted-foreground">
                Email can&apos;t be changed.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground hover:bg-surface disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <dl className="py-6 space-y-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">First name</dt>
              <dd className="font-medium text-foreground">{user.firstName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Last name</dt>
              <dd className="font-medium text-foreground">{user.lastName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium text-foreground">{user.email}</dd>
            </div>
          </dl>
        )}

        {!editing && (
          <div className="flex gap-3 border-t border-border pt-6">
            <Link
              href="/my-orders"
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground hover:border-brand hover:text-brand"
            >
              My Orders
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/20"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
