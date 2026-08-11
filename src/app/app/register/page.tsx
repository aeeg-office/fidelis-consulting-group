"use client";

import { useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Loader2, CheckCircle, Search, X } from "lucide-react";

const ROLES = [
  { value: "teacher", label: "School-linked Teacher" },
  { value: "independent_teacher", label: "Independent Teacher" },
] as const;

interface School {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
}

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "teacher",
    schoolId: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // School search
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolResults, setSchoolResults] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isSearchingSchool, setIsSearchingSchool] = useState(false);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const searchSchools = useCallback(async (query: string) => {
    setSchoolQuery(query);
    if (query.length < 2) {
      setSchoolResults([]);
      setShowSchoolDropdown(false);
      return;
    }

    setIsSearchingSchool(true);
    try {
      const res = await fetch(`/api/schools/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSchoolResults(data.schools ?? []);
        setShowSchoolDropdown(data.schools?.length > 0);
      }
    } catch {
      // silently fail — school lookup is optional
    } finally {
      setIsSearchingSchool(false);
    }
  }, []);

  const selectSchool = (school: School) => {
    setSelectedSchool(school);
    setFormData((prev) => ({ ...prev, schoolId: school.id }));
    setSchoolQuery(school.name);
    setShowSchoolDropdown(false);
  };

  const clearSchool = () => {
    setSelectedSchool(null);
    setFormData((prev) => ({ ...prev, schoolId: "" }));
    setSchoolQuery("");
    setSchoolResults([]);
  };

  const validateForm = (): string | null => {
    if (!formData.fullName.trim()) return "Full name is required.";
    if (!formData.email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Invalid email format.";
    if (formData.password.length < 8) return "Password must be at least 8 characters.";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
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
            schoolId: formData.schoolId || undefined,
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
    },
    [formData]
  );

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
                <div className="grid grid-cols-2 gap-3">
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

              {/* School Lookup */}
              <div>
                <label
                  htmlFor="schoolSearch"
                  className="block text-sm font-medium text-charcoal mb-1.5"
                >
                  School <span className="text-charcoal-light font-normal">(optional)</span>
                </label>
                <div className="relative">
                  {selectedSchool ? (
                    <div className="flex items-center h-11 px-4 rounded-md border border-border bg-ivory/50 text-sm text-charcoal">
                      <span className="flex-1 truncate">{selectedSchool.name}</span>
                      <button
                        type="button"
                        onClick={clearSchool}
                        className="text-charcoal-light hover:text-charcoal ml-2"
                        aria-label="Clear school selection"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        id="schoolSearch"
                        type="text"
                        value={schoolQuery}
                        onChange={(e) => searchSchools(e.target.value)}
                        placeholder="Search for your school..."
                        className="w-full h-11 pl-10 pr-4 rounded-md border border-border bg-white text-charcoal placeholder:text-charcoal-light/50 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
                    </div>
                  )}

                  {/* School dropdown */}
                  {showSchoolDropdown && schoolResults.length > 0 && (
                    <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {schoolResults.map((school) => (
                        <button
                          key={school.id}
                          type="button"
                          onClick={() => selectSchool(school)}
                          className="w-full text-left px-4 py-3 text-sm text-charcoal hover:bg-ivory transition-colors border-b border-border-light last:border-b-0"
                        >
                          <span className="font-medium">{school.name}</span>
                          {school.city && (
                            <span className="text-charcoal-light ml-1">
                              — {school.city}
                              {school.country ? `, ${school.country}` : ""}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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