import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getPrincipal } from "@/lib/principal";
import { canApproveSchools } from "@/lib/workspace-policy";

/** GET /api/admin/schools — list all school tenants with status (platform admin). */
export async function GET() {
  const principal = await getPrincipal();
  if (!principal) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canApproveSchools(principal)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const schools = await prisma.school.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      country: true,
      city: true,
      status: true,
      email: true,
      teacherCount: true,
      createdAt: true,
      _count: { select: { users: true, departments: true } },
    },
  });

  return NextResponse.json({ schools });
}

/**
 * POST /api/admin/schools — create a school tenant and provision its first
 * school_admin from an explicit invited payload. Platform admin only.
 * Public registration can never reach this path.
 */
export async function POST(request: NextRequest) {
  const principal = await getPrincipal();
  if (!principal) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canApproveSchools(principal)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const country = typeof body.country === "string" ? body.country.trim() : null;
  const city = typeof body.city === "string" ? body.city.trim() : null;
  const password = typeof body.password === "string" ? body.password : "";
  const schoolAdminName = typeof body.schoolAdminName === "string" ? body.schoolAdminName.trim() : "";

  if (!name || !email || !slug || !schoolAdminName || !password) {
    return NextResponse.json({ error: "name, email, slug, schoolAdminName and password are required." }, { status: 400 });
  }
  if (password.length < 12) {
    return NextResponse.json({ error: "The school administrator password must be at least 12 characters." }, { status: 400 });
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Slug may only contain lowercase letters, digits and hyphens." }, { status: 400 });
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return NextResponse.json({ error: "A user with that email already exists." }, { status: 409 });
  }
  const existingSlug = await prisma.school.findUnique({ where: { slug } });
  if (existingSlug) {
    return NextResponse.json({ error: "A school with that slug already exists." }, { status: 409 });
  }

  const schoolAdminRole = await prisma.role.findUnique({ where: { name: "school_admin" } });
  if (!schoolAdminRole) {
    return NextResponse.json({ error: "Required role is not configured." }, { status: 500 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const school = await tx.school.create({
      data: { name, slug, email, country, city, status: "approved", teacherCount: 0 },
    });

    const admin = await tx.user.create({
      data: {
        email,
        passwordHash,
        fullName: schoolAdminName,
        schoolId: school.id,
        isActive: true,
        emailVerified: new Date(),
      },
    });

    await tx.userRole.create({
      data: { userId: admin.id, roleId: schoolAdminRole.id, schoolId: school.id, assignedBy: principal.userId },
    });

    await tx.auditLog.create({
      data: {
        userId: principal.userId,
        schoolId: school.id,
        action: "school.created",
        entityType: "School",
        entityId: school.id,
        metadata: { provisionedAdmin: admin.id },
      },
    });

    return { school };
  });

  return NextResponse.json({ school: result.school }, { status: 201 });
}
