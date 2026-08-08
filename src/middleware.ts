import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicAppPaths = [
  "/app/login",
  "/app/register",
  "/app/forgot-password",
  "/app/reset-password",
  "/app/verify-email",
];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Allow public app paths without authentication
  if (publicAppPaths.some((path) => nextUrl.pathname === path || nextUrl.pathname.startsWith(path + "/"))) {
    return NextResponse.next();
  }

  // Protect all other /app/* routes
  if (!isLoggedIn) {
    const loginUrl = new URL("/app/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/app/:path*"],
};