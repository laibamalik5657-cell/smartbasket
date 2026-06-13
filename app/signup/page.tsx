"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { signupFormSchema, type SignupFormInput, type RegisterInput } from "@/lib/validations/auth";

const perks = [
  "20% off your first order",
  "Free same-day delivery over $40",
  "Save addresses, favourites and recipes",
  "Early access to seasonal drops",
];

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const form = useForm<SignupFormInput>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      agreed: false,
    },
  });

  async function onSubmit(values: SignupFormInput) {
    setLoading(true);
    setMessage(null);

    const payload: RegisterInput = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: "error", text: data.message || "Account creation failed." });
      } else {
        setMessage({ type: "success", text: "Account created successfully." });
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
              Join SmartBasket and shop fresher.
            </h2>
            <p className="mt-3 max-w-sm text-white/85">
              A free account unlocks faster checkout, personalised picks, and a
              welcome coupon for your first delivery.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {perks.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px]">
                    ✓
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-white/70">
            &ldquo;SmartBasket changed our weekly grocery run.&rdquo; — Aisha, customer since 2024
          </p>
        </div>

        <div className="flex items-center">
          <div className="w-full rounded-3xl border border-border bg-white p-8 shadow-sm sm:p-10">
            <h1 className="text-2xl font-bold sm:text-3xl">Create an account</h1>
            <p className="mt-1 text-sm text-muted">
              Already have one?{" "}
              <Link href="/login" className="font-medium text-brand hover:underline">
                Sign in
              </Link>
            </p>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <button className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:border-brand hover:text-brand">
                <span>🔍</span> Sign up with Google
              </button>
              <button className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:border-brand hover:text-brand">
                <span></span> Sign up with Apple
              </button>
            </div>

            <div className="my-6 flex items-center gap-3 text-xs text-muted">
              <span className="h-px flex-1 bg-border" />
              or with your email
              <span className="h-px flex-1 bg-border" />
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="Maya" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="Chen" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="At least 8 characters" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="agreed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal text-muted">
                          I agree to the <Link href="/" className="underline">Terms</Link> and{" "}
                          <Link href="/" className="underline">Privacy Policy</Link>.
                        </FormLabel>
                        <FormMessage />
                      </div>
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
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </Form>

            <p className="mt-6 text-center text-xs text-muted">
              We will send a verification email to confirm your address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
