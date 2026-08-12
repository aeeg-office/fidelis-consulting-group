import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { validatePublicRegistration } from "@/lib/public-registration";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Brute-force/abuse protection keyed by client IP.
    const ipKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = rateLimit(`register:${ipKey}`, 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 },
      );
    }

    const registration = validatePublicRegistration(await request.json());
    if (!registration.ok) {
      return NextResponse.json({ error: registration.error }, { status: 400 });
    }
    if (process.env.EMAIL_VERIFICATION_DELIVERY_CONFIGURED !== "true") {
      return NextResponse.json(
        { error: "Self-registration is temporarily unavailable while email verification delivery is configured." },
        { status: 503 },
      );
    }

    const { fullName, email, password, role } = registration.value;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 },
      );
    }

    const [passwordHash, roleRecord] = await Promise.all([
      bcrypt.hash(password, 12),
      prisma.role.findUnique({ where: { name: role } }),
    ]);
    if (!roleRecord) {
      return NextResponse.json(
        { error: "Invalid role configuration. Please contact support." },
        { status: 500 },
      );
    }

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName,
          schoolId: null,
          isActive: true,
        },
      });
      await tx.userRole.create({
        data: { userId: newUser.id, roleId: roleRecord.id, schoolId: null },
      });
      return newUser;
    });

    const verificationToken = randomUUID();
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Delivery is enabled only when the explicit configuration gate above is true.
    // Never log verification secrets.
    return NextResponse.json(
      {
        message: "Account created successfully. Please check your email to verify your account.",
        userId: user.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}
