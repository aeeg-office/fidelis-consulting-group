import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrincipal } from "@/lib/principal";
import { canViewDepartment } from "@/lib/workspace-policy";

/**
 * GET /api/hod/department — returns the HOD's own department plus the teachers
 * in it. Tenant and department come from the session, never the client.
 */
export async function GET() {
  const principal = await getPrincipal();
  if (!principal) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!principal.departmentId) {
    return NextResponse.json({ error: "You are not assigned to a department." }, { status: 403 });
  }

  const department = await prisma.department.findUnique({
    where: { id: principal.departmentId },
    select: { id: true, name: true, nameAr: true, subject: true, schoolId: true, teacherCount: true },
  });
  if (!department) return NextResponse.json({ error: "Department not found." }, { status: 404 });

  if (!canViewDepartment(principal, department)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const teachers = await prisma.user.findMany({
    where: { departmentId: department.id, isActive: true },
    orderBy: { fullName: "asc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      jobTitle: true,
      subject: true,
      lastLoginAt: true,
    },
  });

  return NextResponse.json({ department, teachers });
}
