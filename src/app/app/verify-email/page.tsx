"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleVerify = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Verification failed. The link may have expired.");
        setStatus("error");
        setIsLoading(false);
        return;
      }

      setStatus("success");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Has a verification token — show verify button or result
  if (token) {
    if (status === "success") {
      return (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-navy mb-3">
            Email verified!
          </h2>
          <p className="text-charcoal-light text-sm leading-relaxed mb-6">
            Your email address has been successfully verified. You can now
            access all features of your Fidelis account.
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
      <>
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-error text-sm font-medium">{error}</p>
          </div>
        )}

        {status === "error" ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-error/10 rounded-full mb-6">
              <XCircle className="w-8 h-8 text-error" />
            </div>
            <p className="text-charcoal-light text-sm leading-relaxed mb-6">
              The verification link is invalid or has expired. Please sign in to
              request a new verification email.
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
        ) : (
          <div className="text-center">
            <p className="text-charcoal-light text-sm leading-relaxed mb-6">
              Click the button below to verify your email address and activate
              your account.
            </p>
            <Button
              variant="navy"
              size="lg"
              fullWidth
              onClick={handleVerify}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify email address"
              )}
            </Button>
          </div>
        )}
      </>
    );
  }

  // No token — show the notice page
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-6">
        <Mail className="w-8 h-8 text-gold" />
      </div>
      <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-navy mb-3">
        Verify your email
      </h2>
      <p className="text-charcoal-light text-sm leading-relaxed mb-4">
        We&apos;ve sent a verification email to your registered address.
        Please check your inbox and click the verification link to activate your
        account.
      </p>
      <div className="bg-ivory rounded-lg p-4 mb-6 text-left">
        <p className="text-sm text-charcoal-light">
          <span className="font-medium text-charcoal">Didn&apos;t receive the email?</span>
          <br />
          Check your spam or junk folder. The email may take a few minutes to
          arrive. Make sure you used the correct email address when registering.
        </p>
      </div>
      <p className="text-sm text-charcoal-light">
        Already verified?{" "}
        <Link
          href="/app/login"
          className="font-semibold text-navy hover:text-gold transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
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
            Email verification
          </h1>
        </div>

        <Card className="bg-white shadow-xl border-0">
          <CardContent className="p-8">
            <Suspense fallback={<div className="text-center text-charcoal-light py-8">Loading...</div>}>
              <VerifyEmailContent />
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