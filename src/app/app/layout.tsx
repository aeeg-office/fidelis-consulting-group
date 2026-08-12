"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession, SessionProvider } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Bot,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  User,
  School,
  Shield,
  ChevronsLeft,
  ChevronsRight,
  Bell,
} from "lucide-react";

const authPages = [
  "/app/login",
  "/app/register",
  "/app/forgot-password",
  "/app/reset-password",
  "/app/verify-email",
];

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayoutInner({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAuthPage = authPages.some(
    (path) => pathname && (pathname === path || pathname.startsWith(path + "/"))
  );

  // For auth pages, render children without the app chrome
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = useCallback(async () => {
    setUserMenuOpen(false);
    await signOut({ redirectTo: "/app/login" });
  }, []);

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/app") return pathname === "/app";
    return pathname.startsWith(href);
  };

  const userRoles = session?.user?.roles?.map((r) => r.name) ?? [];
  const isAdmin = userRoles.includes("admin");
  const isSchoolAdmin = userRoles.includes("school_admin");
  const isHod = userRoles.includes("hod");
  const isTeacher = userRoles.includes("teacher") || userRoles.includes("independent_teacher");

  const mainItems = [
    { label: "Dashboard", href: "/app", icon: LayoutDashboard },
    { label: "AI Tools", href: "/app/tools", icon: Bot },
    { label: "Workshops", href: "/app/workshops", icon: BookOpen },
  ];
  const workspaceItems = [
    ...(isSchoolAdmin || isAdmin
      ? [{ label: "School", href: "/app/school", icon: School }]
      : []),
    ...(isHod || isAdmin
      ? [{ label: "Department", href: "/app/hod", icon: BookOpen }]
      : []),
    ...(isTeacher || isSchoolAdmin || isHod
      ? [{ label: "My Profile", href: "/app/profile", icon: User }]
      : []),
    ...(isAdmin ? [{ label: "School Approvals", href: "/app/dashboard/admin/schools", icon: Shield }] : []),
  ];
  const adminGroup = workspaceItems.length > 0
    ? [{ section: isAdmin ? "Platform" : "Workspace", items: workspaceItems }]
    : [];
  const sidebarItems = [
    { section: "Main", items: mainItems },
    ...adminGroup,
    { section: "Account", items: [{ label: "Settings", href: "/app/settings", icon: Settings }] },
  ];

  return (
    <div className="min-h-screen bg-ivory">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-navy text-white transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-16",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center h-16 px-4 border-b border-white/10">
          <Link href="/app" className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-9 h-9 bg-gold rounded-lg flex items-center justify-center">
              <span className="text-navy font-[family-name:var(--font-heading)] font-bold text-lg">
                F
              </span>
            </div>
            {sidebarOpen && (
              <span className="font-[family-name:var(--font-heading)] font-bold text-lg truncate">
                Fidelis
              </span>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              "ml-auto flex-shrink-0 p-1.5 rounded-md text-ivory/60 hover:text-white hover:bg-white/10 transition-colors",
              sidebarOpen ? "block" : "hidden"
            )}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
          {sidebarItems.map((group) => (
            <div key={group.section}>
              {sidebarOpen && (
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-ivory/40 mb-2">
                  {group.section}
                </p>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                        isActive(item.href)
                          ? "bg-gold/20 text-gold"
                          : "text-ivory/70 hover:text-white hover:bg-white/10",
                        !sidebarOpen && "justify-center px-2"
                      )}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {sidebarOpen && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar expand toggle (collapsed state) */}
        {!sidebarOpen && (
          <div className="p-2 border-t border-white/10">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-full p-2 rounded-md text-ivory/60 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
              aria-label="Expand sidebar"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      {/* Main content area */}
      <div
        className={cn(
          "transition-all duration-300",
          sidebarOpen ? "lg:ml-64" : "lg:ml-16"
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-navy hover:bg-ivory rounded-md"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden md:block" />

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Notifications placeholder */}
              <button
                className="p-2 text-charcoal-light hover:text-navy hover:bg-ivory rounded-md transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
              </button>

              {/* User menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-ivory transition-colors"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 bg-navy rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {userInitials}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-charcoal max-w-[120px] truncate">
                    {session?.user?.name ?? "User"}
                  </span>
                  <ChevronDown className="hidden md:block w-4 h-4 text-charcoal-light" />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-charcoal truncate">
                        {session?.user?.name}
                      </p>
                      <p className="text-xs text-charcoal-light truncate mt-0.5">
                        {session?.user?.email}
                      </p>
                    </div>

                    {session?.user?.roles && session.user.roles.length > 0 && (
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-xs font-medium text-charcoal-light uppercase tracking-wider mb-1">
                          Roles
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {session.user.roles.map((role) => (
                            <span
                              key={role.name}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gold/10 text-navy"
                            >
                              {role.displayName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <Link
                      href="/app/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal hover:bg-ivory transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile settings
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SessionProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </SessionProvider>
  );
}