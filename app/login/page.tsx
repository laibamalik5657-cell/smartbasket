"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: "error", text: data.message || "Sign in failed." });
      } else {
        setMessage({ type: "success", text: "Signed in successfully." });
        router.push("/");
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-brand-light via-white to-white">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
        <div className="hidden flex-col justify-between rounded-3xl bg-brand p-10 text-white lg:flex">
          <div>
            <Link href="/" className="flex items-center gap-2 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M3 6h18l-2 13H5L3 6z" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </span>
              <span className="text-lg font-bold">SmartBasket</span>
            </Link>
            <h2 className="mt-12 text-3xl font-bold leading-tight">
              Welcome back. Your basket is waiting.
            </h2>
            <p className="mt-3 max-w-sm text-white/85">
              Pick up where you left off — your favourites, addresses, and saved
              orders are all one click away.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {["🍓", "🥑", "🥖", "🥕", "🧀", "🍇"].map((e, i) => (
              <span
                key={i}
                className="flex h-16 items-center justify-center rounded-xl bg-white/10 text-3xl backdrop-blur"
              >
                {e}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-full rounded-3xl border border-border bg-white p-8 shadow-sm sm:p-10">
            <h1 className="text-2xl font-bold sm:text-3xl">Sign in</h1>
            <p className="mt-1 text-sm text-muted">
              New here?{" "}
              <Link href="/signup" className="font-medium text-brand hover:underline">
                Create an account
              </Link>
            </p>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <button className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:border-brand hover:text-brand">
                <span>🔍</span> Continue with Google
              </button>
              <button className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:border-brand hover:text-brand">
                <span></span> Continue with Apple
              </button>
            </div>

            <div className="my-6 flex items-center gap-3 text-xs text-muted">
              <span className="h-px flex-1 bg-border" />
              or sign in with email
              <span className="h-px flex-1 bg-border" />
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link href="/forgot-password" className="text-xs font-medium text-brand hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input type="checkbox" className="h-4 w-4 rounded border-border accent-brand" />
                  Remember me on this device
                </label>
                {message && (
                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      message.type === "error"
                        ? "bg-red-50 text-red-600"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    {message.text}
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Form>

            <p className="mt-6 text-center text-xs text-muted">
              By signing in you agree to our{" "}
              <Link href="/" className="underline">Terms</Link> and{" "}
              <Link href="/" className="underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
