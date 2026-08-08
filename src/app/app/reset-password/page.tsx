"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "invalid">("idle");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!token) {
        setStatus("invalid");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      setIsLoading(true);

      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Failed to reset password. The link may have expired.");
          setIsLoading(false);
          return;
        }

        setStatus("success");
      } catch {
        setError("Network error. Please try again.");
        setIsLoading(false);
      }
    },
    [token, password, confirmPassword]
  );

  // Invalid or missing token
  if (status === "invalid" || !token) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-error/10 rounded-full mb-6">
          <XCircle className="w-8 h-8 text-error" />
        </div>
        <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-navy mb-3">
          Invalid reset link
        </h2>
        <p className="text-charcoal-light text-sm leading-relaxed mb-6">
          This password reset link is invalid or has expired. Please request a
          new reset link.
        </p>
        <Button
          variant="navy"
          size="md"
          onClick={() => router.push("/app/forgot-password")}
        >
          Request new link
        </Button>
      </div>
    );
  }

  // Success
  if (status === "success") {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-6">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-navy mb-3">
          Password reset successful
        </h2>
        <p className="text-charcoal-light text-sm leading-relaxed mb-6">
          Your password has been updated. You can now sign in with your new
          password.
        </p>
        <Button
          variant="navy"
          size="lg"
          fullWidth
          onClick={() => router.push("/app/login")}
        >
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* New Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-charcoal mb-1.5"
        >
          New password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full h-11 px-4 pr-11 rounded-md border border-border bg-white text-charcoal placeholder:text-charcoal-light/50 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-light hover:text-charcoal transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-charcoal mb-1.5"
        >
          Confirm new password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className="w-full h-11 px-4 pr-11 rounded-md border border-border bg-white text-charcoal placeholder:text-charcoal-light/50 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-light hover:text-charcoal transition-colors"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-error text-sm font-medium">{error}</p>
        </div>
      )}

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
            Resetting password...
          </>
        ) : (
          "Reset password"
        )}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
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
            Set new password
          </h1>
          <p className="text-ivory/70 text-sm">
            Enter your new password below
          </p>
        </div>

        <Card className="bg-white shadow-xl border-0">
          <CardContent className="p-8">
            <Suspense fallback={<div className="text-center text-charcoal-light py-8">Loading...</div>}>
              <ResetPasswordForm />
            </Suspense>

            {/* Back to login */}
            <div className="mt-6 text-center">
              <Link
                href="/app/login"
                className="text-sm font-medium text-navy hover:text-gold transition-colors"
              >
                ← Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}