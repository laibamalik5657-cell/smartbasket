"use client";

import Link from "next/link";
import Image from "next/image";

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-lg">

        <h1 className="text-3xl font-bold text-center">
          Welcome to SmartBasket
        </h1>

        <p className="mt-2 text-center text-gray-500">
          Sign in to continue shopping
        </p>

        <form className="mt-8 space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your name"
              className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium">
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-sm text-green-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
            />
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full rounded-lg bg-green-600 py-3 font-medium text-white hover:bg-green-700"
          >
            Sign In
          </button>

        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-gray-300" />
          <span className="text-sm text-gray-500">OR</span>
          <span className="h-px flex-1 bg-gray-300" />
        </div>

        {/* Google Login */}
        <button
          type="button"
          className="flex w-full items-center justify-center gap-3 rounded-lg border p-3 font-medium hover:bg-gray-50"
        >
          <Image
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
            alt="Google"
            width={20}
            height={20}
          />

          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
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