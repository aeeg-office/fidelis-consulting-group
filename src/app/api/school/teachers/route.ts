import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getPrincipal } from "@/lib/principal";
import { canProvisionTeacher } from "@/lib/workspace-policy";
import { recordAudit } from "@/lib/audit";

/**
 * POST /api/school/teachers — provision a school-linked teacher account within
 * the caller's own school tenant. Only a school_admin of that exact school (or
 * a platform admin) may provision. Never reachable by public registration.
 */
export async function POST(request: NextRequest) {
  const principal = await getPrincipal();
  if (!principal) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!principal.schoolId || !canProvisionTeacher(principal, principal.schoolId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const departmentId = typeof body.departmentId === "string" ? body.departmentId : null;
  const jobTitle = typeof body.jobTitle === "string" ? body.jobTitle.trim() : null;
  const subject = typeof body.subject === "string" ? body.subject.trim() : null;

  if (!fullName || !email || !password) {
    return NextResponse.json({ error: "fullName, email and password are required." }, { status: 400 });
  }
  if (password.length < 12) {
    return NextResponse.json({ error: "The teacher password must be at least 12 characters." }, { status: 400 });
  }

  // Department (if supplied) must belong to the same school tenant.
  if (departmentId) {
    const dept = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!dept || dept.schoolId !== principal.schoolId) {
      return NextResponse.json({ error: "Department not found in this school." }, { status: 400 });
    }
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "A user with that email already exists." }, { status: 409 });
  }

  const teacherRole = await prisma.role.findUnique({ where: { name: "teacher" } });
  if (!teacherRole) {
    return NextResponse.json({ error: "Required role is not configured." }, { status: 500 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        schoolId: principal.schoolId,
        departmentId,
        jobTitle,
        subject,
        isActive: true,
        emailVerified: new Date(),
      },
    });

    await tx.userRole.create({
      data: {
        userId: user.id,
        roleId: teacherRole.id,
        schoolId: principal.schoolId,
        assignedBy: principal.userId,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: principal.userId,
        schoolId: principal.schoolId,
        action: "user.provisioned.teacher",
        entityType: "User",
        entityId: user.id,
        metadata: { departmentId, jobTitle, subject },
      },
    });

    return user;
  });

  return NextResponse.json(
    { message: "Teacher provisioned successfully.", userId: result.id },
    { status: 201 },
  );
}
