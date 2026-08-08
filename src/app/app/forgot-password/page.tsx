"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Loader2, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!email.trim()) {
        setError("Please enter your email address.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email address.");
        return;
      }

      setIsLoading(true);

      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.toLowerCase().trim() }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Something went wrong. Please try again.");
          setIsLoading(false);
          return;
        }

        setSuccess(true);
      } catch {
        setError("Network error. Please check your connection and try again.");
        setIsLoading(false);
      }
    },
    [email]
  );

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
            Reset your password
          </h1>
          <p className="text-ivory/70 text-sm">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <Card className="bg-white shadow-xl border-0">
          <CardContent className="p-8">
            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
                <p className="text-error text-sm font-medium">{error}</p>
              </div>
            )}

            {success ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-6">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-navy mb-3">
                  Check your email
                </h2>
                <p className="text-charcoal-light text-sm leading-relaxed mb-6">
                  If an account exists with{" "}
                  <span className="font-medium text-charcoal">{email}</span>,
                  we&apos;ve sent a password reset link. Please check your inbox
                  (and spam folder) and follow the instructions.
                </p>
                <Button
                  variant="navy"
                  size="md"
                  onClick={() => setSuccess(false)}
                >
                  Send again
                </Button>
              </div>
            ) : (
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
                      Sending reset link...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>
            )}

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