import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Credentials authentication requires signed JWT sessions in Auth.js v5.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/app/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return null;
        }

        if (!user.isActive || !user.emailVerified) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          image: user.avatarUrl ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        const existingUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isActive: true, emailVerified: true },
        });

        if (!existingUser || !existingUser.isActive || !existingUser.emailVerified) {
          return false;
        }

        // Update last login timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
      }

      return true;
    },
    async session({ session, token }) {
      const userId = token.sub;
      if (session.user && userId) {
        const sessionUser = session.user as typeof session.user & { roles: { name: string; displayName: string }[] };
        sessionUser.id = userId;

        // Fetch user roles for the session
        const userRoles = await prisma.userRole.findMany({
          where: { userId },
          include: {
            role: {
              select: { name: true, displayName: true },
            },
          },
        });

        sessionUser.roles = userRoles.map((ur) => ({
          name: ur.role.name,
          displayName: ur.role.displayName ?? ur.role.name,
        }));
      }

      return session;
    },
  },
});