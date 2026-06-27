"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/axios";
import { getToken } from "@/lib/utils";
import { useAuthUser } from "@/lib/use-auth";
import { useAuthGet } from "@/lib/use-api";

type Rider = { id: string; firstName: string; lastName: string; email: string };

export default function AdminRidersPage() {
  const user = useAuthUser();
  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center bg-card rounded-2xl border border-border p-12">
          <h1 className="text-2xl font-bold text-foreground">Admins only</h1>
          <Link href="/" className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">Riders</h1>
        <AddRiderForm />
        <Suspense fallback={<p className="mt-8 text-muted-foreground">Loading riders…</p>}>
          <RidersList />
        </Suspense>
      </div>
    </div>
  );
}

function AddRiderForm() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await apiClient.post("/admin/riders", form, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      window.location.reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to add rider.";
      setError(message);
      setSubmitting(false);
    }
  }

  const field = (key: keyof typeof form, label: string, type = "text") => (
    <label className="block">
      <span className="text-sm text-muted-foreground">{label}</span>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
        required
      />
    </label>
  );

  return (
    <form onSubmit={onSubmit} className="mt-6 bg-card rounded-2xl border border-border p-5 space-y-3">
      <h2 className="font-semibold text-foreground">Add a rider</h2>
      <div className="grid grid-cols-2 gap-3">
        {field("firstName", "First name")}
        {field("lastName", "Last name")}
      </div>
      {field("email", "Email", "email")}
      {field("password", "Temp password", "password")}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {submitting ? "Adding…" : "Add rider"}
      </button>
    </form>
  );
}

function RidersList() {
  const data = useAuthGet<{ riders: Rider[] }>("/admin/riders");
  const riders = data?.riders ?? [];
  return (
    <div className="mt-6 space-y-2">
      {riders.length === 0 ? (
        <p className="text-muted-foreground">No riders yet.</p>
      ) : (
        riders.map((r) => (
          <div key={r.id} className="bg-card rounded-xl border border-border p-4 flex justify-between">
            <span className="font-medium text-foreground">{r.firstName} {r.lastName}</span>
            <span className="text-sm text-muted-foreground">{r.email}</span>
          </div>
        ))
      )}
    </div>
  );
}
