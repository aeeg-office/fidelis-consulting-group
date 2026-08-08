"use client";

import { useState, useCallback, Suspense } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password. Please try again.",
  default: "An unexpected error occurred. Please try again.",
};

function getErrorMessage(error?: string | null): string {
  if (!error) return "";
  return ERROR_MESSAGES[error] ?? ERROR_MESSAGES.default;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");
  const callbackUrl = searchParams?.get("callbackUrl") ?? "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState(getErrorMessage(error));

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError("");

      if (!email.trim() || !password.trim()) {
        setFormError("Please enter your email and password.");
        return;
      }

      setIsLoading(true);

      try {
        const result = await signIn("credentials", {
          email: email.toLowerCase().trim(),
          password,
          redirect: false,
        });

        if (result?.error) {
          setFormError(getErrorMessage(result.error));
          setIsLoading(false);
          return;
        }

        if (result?.ok) {
          router.push(callbackUrl);
          router.refresh();
        }
      } catch {
        setFormError(ERROR_MESSAGES.default);
        setIsLoading(false);
      }
    },
    [email, password, callbackUrl, router]
  );

  return (
    <>
      {/* Error */}
      {formError && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-error text-sm font-medium">{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-charcoal mb-1.5"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@school.com"
            className="w-full h-11 px-4 rounded-md border border-border bg-white text-charcoal placeholder:text-charcoal-light/50 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-charcoal mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full h-11 px-4 pr-11 rounded-md border border-border bg-white text-charcoal placeholder:text-charcoal-light/50 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-light hover:text-charcoal transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Forgot password */}
        <div className="flex justify-end">
          <Link
            href="/app/forgot-password"
            className="text-sm font-medium text-gold-dark hover:text-gold transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="navy"
          fullWidth
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      {/* Register link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-charcoal-light">
          Don&apos;t have an account?{" "}
          <Link
            href="/app/register"
            className="font-semibold text-navy hover:text-gold transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gold rounded-xl mb-4">
            <span className="text-navy font-[family-name:var(--font-heading)] font-bold text-2xl">
              F
            </span>
          </div>
          <h1 className="text-3xl font-[family-name:var(--font-heading)] font-bold text-white mb-2">
            Welcome back
          </h1>
          <p className="text-ivory/70 text-sm">
            Sign in to your Fidelis account
          </p>
        </div>

        <Card className="bg-white shadow-xl border-0">
          <CardContent className="p-8">
            <Suspense fallback={<div className="py-8 text-center text-charcoal-light">Loading...</div>}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>

        {/* Back to main site */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-ivory/60 hover:text-gold transition-colors"
          >
            ← Back to Fidelis website
          </Link>
        </div>
      </div>
    </div>
  );
}