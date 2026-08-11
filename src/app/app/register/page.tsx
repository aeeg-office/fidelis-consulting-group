"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";

const ROLES = [{ value: "independent_teacher", label: "Independent Teacher" }] as const;

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "independent_teacher",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);


  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };


  const validateForm = (): string | null => {
    if (!formData.fullName.trim()) return "Full name is required.";
    if (!formData.email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Invalid email format.";
    if (formData.password.length < 12) return "Password must be at least 12 characters.";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsLoading(true);

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: formData.fullName.trim(),
            email: formData.email.toLowerCase().trim(),
            password: formData.password,
            role: formData.role,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Registration failed. Please try again.");
          setIsLoading(false);
          return;
        }

        setSuccess(true);
      } catch {
        setError("Network error. Please check your connection and try again.");
        setIsLoading(false);
      }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="bg-white shadow-xl border-0">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-6">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-[family-name:var(--font-heading)] font-bold text-navy mb-3">
                Account created successfully!
              </h2>
              <p className="text-charcoal-light text-sm mb-6 leading-relaxed">
                We&apos;ve sent a verification email to{" "}
                <span className="font-medium text-charcoal">{formData.email}</span>.
                Please check your inbox and follow the link to verify your email
                address before signing in.
              </p>
              <div className="bg-ivory rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-charcoal-light">
                  <span className="font-medium text-charcoal">Didn&apos;t receive the email?</span>
                  <br />
                  Check your spam folder, or try signing in — you may be able to
                  request a new verification link.
                </p>
              </div>
              <Button
                variant="navy"
                size="lg"
                fullWidth
                onClick={() => router.push("/app/login")}
              >
                Go to sign in
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gold rounded-xl mb-4">
            <span className="text-navy font-[family-name:var(--font-heading)] font-bold text-2xl">
              F
            </span>
          </div>
          <h1 className="text-3xl font-[family-name:var(--font-heading)] font-bold text-white mb-2">
            Create your account
          </h1>
          <p className="text-ivory/70 text-sm">
            Join Fidelis and access your teaching tools
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

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-charcoal mb-1.5"
                >
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Dr. Sarah Ahmed"
                  className="w-full h-11 px-4 rounded-md border border-border bg-white text-charcoal placeholder:text-charcoal-light/50 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                />
              </div>

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
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
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
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="At least 8 characters"
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

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-charcoal mb-1.5"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
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

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">
                  I am a...
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {ROLES.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => updateField("role", role.value)}
                      className={cn(
                        "h-12 px-4 rounded-md border-2 text-sm font-medium transition-all duration-200",
                        formData.role === role.value
                          ? "border-gold bg-gold/5 text-navy"
                          : "border-border text-charcoal-light hover:border-navy/30 hover:text-charcoal"
                      )}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="rounded-md bg-ivory p-3 text-sm text-charcoal-light">
                School-linked access is provisioned by your school administrator. This form creates an independent educator account only.
              </p>

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
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            {/* Login link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-charcoal-light">
                Already have an account?{" "}
                <Link
                  href="/app/login"
                  className="font-semibold text-navy hover:text-gold transition-colors"
                >
                  Sign in
                </Link>
              </p>
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