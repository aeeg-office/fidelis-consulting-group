"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Bell,
  Globe,
  CreditCard,
  AlertTriangle,
  Trash2,
  CheckCircle,
  ChevronDown,
  Mail,
  MessageSquare,
  Calendar,
  Award,
  TrendingUp,
  Shield,
  X,
} from "lucide-react";

const notificationPreferences = [
  {
    id: "workshop-reminders",
    label: "Workshop Reminders",
    description: "Get notified before upcoming workshops",
    icon: Calendar,
    defaultOn: true,
  },
  {
    id: "certificate-earned",
    label: "Certificate Earned",
    description: "When you earn a new certificate",
    icon: Award,
    defaultOn: true,
  },
  {
    id: "new-workshops",
    label: "New Workshops",
    description: "When new workshops are added to your tracks",
    icon: Bell,
    defaultOn: false,
  },
  {
    id: "ai-tips",
    label: "AI Tool Tips",
    description: "Weekly tips for using AI tools effectively",
    icon: TrendingUp,
    defaultOn: true,
  },
  {
    id: "email-digest",
    label: "Weekly Email Digest",
    description: "Summary of your activity and recommendations",
    icon: Mail,
    defaultOn: false,
  },
];

export default function SettingsPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [notifications, setNotifications] = useState(
    notificationPreferences.reduce(
      (acc, pref) => ({ ...acc, [pref.id]: pref.defaultOn }),
      {} as Record<string, boolean>
    )
  );
  const [interfaceLang, setInterfaceLang] = useState("en");
  const [outputLang, setOutputLang] = useState("en");
  const [saved, setSaved] = useState(false);

  const toggleNotification = (id: string) => {
    setNotifications((prev) => ({ ...prev, [id]: !prev[id] }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteAccount = () => {
    // In a real app, this would call an API
    setShowDeleteConfirm(false);
    setDeleteConfirmText("");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-bold text-navy">
          Account Settings
        </h1>
        <p className="text-charcoal-light mt-1">
          Manage your notifications, language, subscription, and account.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: settings forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notification Preferences */}
          <Card variant="bordered" padding="md">
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-navy">
                    Notification Preferences
                  </h2>
                  <p className="text-sm text-charcoal-light mt-0.5">
                    Choose what updates you&apos;d like to receive.
                  </p>
                </div>
                {saved && (
                  <span className="flex items-center gap-1 text-xs text-success font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Saved
                  </span>
                )}
              </div>
              <div className="space-y-1 divide-y divide-border">
                {notificationPreferences.map((pref) => (
                  <div
                    key={pref.id}
                    className="flex items-center justify-between py-3 first:pt-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-ivory shrink-0">
                        <pref.icon className="w-4 h-4 text-navy" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-charcoal">
                          {pref.label}
                        </p>
                        <p className="text-xs text-charcoal-light">
                          {pref.description}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notifications[pref.id]}
                      onClick={() => toggleNotification(pref.id)}
                      className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-navy/20 ${
                        notifications[pref.id]
                          ? "bg-gold"
                          : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
                          notifications[pref.id]
                            ? "translate-x-4"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Language Settings */}
          <Card variant="bordered" padding="md">
            <CardContent>
              <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-navy mb-4">
                Language Settings
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1.5">
                    Interface Language
                  </label>
                  <p className="text-xs text-charcoal-light mb-2">
                    Platform buttons, menus, and navigation.
                  </p>
                  <div className="relative">
                    <select
                      value={interfaceLang}
                      onChange={(e) => setInterfaceLang(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy text-charcoal appearance-none cursor-pointer"
                    >
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1.5">
                    Output Language
                  </label>
                  <p className="text-xs text-charcoal-light mb-2">
                    AI content, materials, and certificates.
                  </p>
                  <div className="relative">
                    <select
                      value={outputLang}
                      onChange={(e) => setOutputLang(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy text-charcoal appearance-none cursor-pointer"
                    >
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="navy" size="md">
                  <Globe className="w-4 h-4" />
                  Save Language Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Subscription + Danger zone */}
        <div className="space-y-6">
          {/* Subscription Info */}
          <Card variant="bordered" padding="md">
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-gold/10">
                  <CreditCard className="w-5 h-5 text-gold" />
                </div>
                <h2 className="text-lg font-[family-name:var(--font-heading)] font-bold text-navy">
                  Subscription
                </h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-charcoal-light">Plan</span>
                  <span className="text-sm font-semibold text-navy">Educator Pro</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-charcoal-light">Status</span>
                  <span className="text-xs font-medium text-success bg-success/10 rounded-full px-2.5 py-0.5">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-charcoal-light">Billing</span>
                  <span className="text-sm text-charcoal">$29 / month</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-charcoal-light">Next Payment</span>
                  <span className="text-sm text-charcoal">Sep 1, 2026</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-charcoal-light">AI Call Limit</span>
                  <span className="text-sm text-charcoal">500 / month</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Button variant="navy" size="sm" fullWidth>
                  Upgrade Plan
                </Button>
                <Button variant="ghost" size="sm" fullWidth>
                  View Billing History
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card
            variant="bordered"
            padding="md"
            className="border-error/30"
          >
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-error/10">
                  <AlertTriangle className="w-5 h-5 text-error" />
                </div>
                <h2 className="text-lg font-[family-name:var(--font-heading)] font-bold text-error">
                  Danger Zone
                </h2>
              </div>
              <p className="text-sm text-charcoal-light mb-4">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>

              {!showDeleteConfirm ? (
                <Button
                  variant="danger"
                  size="md"
                  fullWidth
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </Button>
              ) : (
                <div className="space-y-3 p-4 bg-error/5 rounded-lg border border-error/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-error">
                        Are you absolutely sure?
                      </p>
                      <p className="text-xs text-charcoal-light mt-1">
                        This action cannot be undone. All your data — workshops,
                        certificates, AI history, and profile — will be permanently
                        deleted.
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal mb-1.5">
                      Type &quot;DELETE&quot; to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder='Type "DELETE"'
                      className="w-full px-3.5 py-2 text-sm bg-white border border-error/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-error/20 focus:border-error text-charcoal placeholder:text-charcoal-light/60"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      size="md"
                      fullWidth
                      disabled={deleteConfirmText !== "DELETE"}
                      onClick={handleDeleteAccount}
                    >
                      <Trash2 className="w-4 h-4" />
                      Permanently Delete
                    </Button>
                    <Button
                      variant="secondary"
                      size="md"
                      fullWidth
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}