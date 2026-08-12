import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrincipal } from "@/lib/principal";
import { canManageSchool } from "@/lib/workspace-policy";

/**
 * GET /api/school/overview — returns the current school_admin's own school
 * profile, departments and teachers. Tenant is derived from the session, never
 * from the client. Denied for anyone outside that school.
 */
export async function GET() {
  const principal = await getPrincipal();
  if (!principal) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!principal.schoolId) {
    return NextResponse.json({ error: "You are not linked to a school tenant." }, { status: 403 });
  }
  if (!canManageSchool(principal, principal.schoolId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const schoolId = principal.schoolId;

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: {
      id: true,
      name: true,
      slug: true,
      country: true,
      city: true,
      status: true,
      email: true,
      phone: true,
      curriculum: true,
      teacherCount: true,
      englishTeacherCount: true,
    },
  });
  if (!school) return NextResponse.json({ error: "School not found." }, { status: 404 });

  const departments = await prisma.department.findMany({
    where: { schoolId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      nameAr: true,
      subject: true,
      teacherCount: true,
      _count: { select: { users: true } },
    },
  });

  const teachers = await prisma.user.findMany({
    where: { schoolId, isActive: true },
    orderBy: { fullName: "asc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      jobTitle: true,
      departmentId: true,
      subject: true,
      lastLoginAt: true,
      userRoles: { select: { role: { select: { name: true } } } },
    },
  });

  return NextResponse.json({ school, departments, teachers });
}
