"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";

import { loginSchema, type LoginInput } from "@/schema";
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
import apiClient from "@/lib/axios";
import { saveToken } from "@/lib/utils";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setMessage(null);
    try {
      const { data } = await apiClient.post("/auth/login", values);
      if (data?.token) {
        // The JWT is the whole session — save it, then full-navigate home so
        // the navbar (and everything else) re-reads it. The user is decoded
        // from this token wherever it's needed (see lib/use-auth).
        saveToken(data.token);
      }
      window.location.assign("/");
    } catch (err) {
      const text = isAxiosError(err)
        ? err.response?.data?.message || "Sign in failed."
        : "Something went wrong. Please try again.";
      setMessage({ type: "error", text });
    }
  }

  const loading = form.formState.isSubmitting;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-center">
          Welcome to SmartBasket
        </h1>
        <p className="mt-2 text-center text-gray-500">
          Sign in to continue shopping
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-8 space-y-4"
          >
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
                    <Link
                      href="/forgot-password"
                      className="text-sm text-green-600 hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pr-9"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              className="h-auto w-full rounded-lg bg-green-600 py-3 text-base font-medium text-white hover:bg-green-700"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-green-600 hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
