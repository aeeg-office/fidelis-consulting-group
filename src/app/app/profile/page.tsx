"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  User,
  Mail,
  Building2,
  BookOpen,
  Globe,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  ChevronDown,
} from "lucide-react";

interface LanguageOption {
  value: string;
  label: string;
}

const languages: LanguageOption[] = [
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
];

export default function ProfilePage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [interfaceLang, setInterfaceLang] = useState("en");
  const [outputLang, setOutputLang] = useState("en");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const user = {
    name: "Sarah Ahmed",
    email: "sarah.ahmed@example.school",
    school: "Dubai International Academy",
    department: "English Department",
    role: "Lead Teacher",
    joined: "January 2026",
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-bold text-navy">
          Profile
        </h1>
        <p className="text-charcoal-light mt-1">
          Manage your personal information and account preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile card */}
        <div className="lg:col-span-1">
          <Card variant="bordered" padding="lg">
            <CardContent className="text-center">
              {/* Avatar */}
              <div className="w-24 h-24 bg-navy rounded-full flex items-center justify-center mx-auto">
                <span className="text-gold text-3xl font-bold font-[family-name:var(--font-heading)]">
                  SA
                </span>
              </div>
              <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-navy mt-4">
                {user.name}
              </h2>
              <p className="text-sm text-charcoal-light mt-1">{user.role}</p>

              <div className="mt-6 space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm text-charcoal-light">
                  <Mail className="w-4 h-4 text-navy/50 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-charcoal-light">
                  <Building2 className="w-4 h-4 text-navy/50 shrink-0" />
                  <span>{user.school}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-charcoal-light">
                  <BookOpen className="w-4 h-4 text-navy/50 shrink-0" />
                  <span>{user.department}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-charcoal-light">
                  <User className="w-4 h-4 text-navy/50 shrink-0" />
                  <span>Member since {user.joined}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit profile form */}
          <Card variant="bordered" padding="md">
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-navy">
                  Personal Information
                </h2>
                {profileSaved && (
                  <span className="flex items-center gap-1 text-xs text-success font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Saved
                  </span>
                )}
              </div>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user.name}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy text-charcoal placeholder:text-charcoal-light/60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={user.email}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy text-charcoal placeholder:text-charcoal-light/60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1.5">
                      School
                    </label>
                    <input
                      type="text"
                      defaultValue={user.school}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy text-charcoal placeholder:text-charcoal-light/60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1.5">
                      Department
                    </label>
                    <input
                      type="text"
                      defaultValue={user.department}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy text-charcoal placeholder:text-charcoal-light/60"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="navy" size="md">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Language preferences */}
          <Card variant="bordered" padding="md">
            <CardContent>
              <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-navy mb-6">
                Language Preferences
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1.5">
                    Interface Language
                  </label>
                  <p className="text-xs text-charcoal-light mb-2">
                    Controls the language of the platform interface.
                  </p>
                  <div className="relative">
                    <select
                      value={interfaceLang}
                      onChange={(e) => setInterfaceLang(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy text-charcoal appearance-none cursor-pointer"
                    >
                      {languages.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1.5">
                    Output Language
                  </label>
                  <p className="text-xs text-charcoal-light mb-2">
                    Language for AI-generated content and materials.
                  </p>
                  <div className="relative">
                    <select
                      value={outputLang}
                      onChange={(e) => setOutputLang(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy text-charcoal appearance-none cursor-pointer"
                    >
                      {languages.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light pointer-events-none" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change password */}
          <Card variant="bordered" padding="md">
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-navy">
                  Change Password
                </h2>
                {passwordSaved && (
                  <span className="flex items-center gap-1 text-xs text-success font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Password updated
                  </span>
                )}
              </div>
              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy text-charcoal placeholder:text-charcoal-light/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-light hover:text-navy"
                      tabIndex={-1}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy text-charcoal placeholder:text-charcoal-light/60"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-light hover:text-navy"
                        tabIndex={-1}
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy text-charcoal placeholder:text-charcoal-light/60"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-light hover:text-navy"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="navy" size="md">
                    <Save className="w-4 h-4" />
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}