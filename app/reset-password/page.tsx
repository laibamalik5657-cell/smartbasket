"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";

import {
  resetPasswordFormSchema,
  type ResetPasswordFormInput,
} from "@/schema";
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

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const form = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordFormInput) {
    setMessage(null);
    try {
      await apiClient.post("/auth/reset-password", {
        token,
        password: values.password,
      });
      setMessage({
        type: "success",
        text: "Password updated. Redirecting to sign in…",
      });
      router.push("/login");
    } catch (err) {
      const text = isAxiosError(err)
        ? err.response?.data?.message || "Reset failed."
        : "Something went wrong. Please try again.";
      setMessage({ type: "error", text });
    }
  }

  const loading = form.formState.isSubmitting;

  if (!token) {
    return (
      <div className="w-full rounded-3xl border border-border bg-white p-8 shadow-sm sm:p-10">
        <h1 className="text-2xl font-bold sm:text-3xl">Invalid reset link</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This link is missing its token. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full rounded-3xl border border-border bg-white p-8 shadow-sm sm:p-10">
      <h1 className="text-2xl font-bold sm:text-3xl">Choose a new password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter and confirm your new password below.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...field}
                  />
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
            className="w-full rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update password"}
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-linear-to-br from-brand-light via-white to-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-12 sm:px-6 lg:px-8">
        <Suspense
          fallback={<p className="text-center text-muted-foreground">Loading…</p>}
        >
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
