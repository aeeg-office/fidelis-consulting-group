import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    roles?: { name: string; displayName: string }[];
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      roles: { name: string; displayName: string }[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roles?: { name: string; displayName: string }[];
  }
}