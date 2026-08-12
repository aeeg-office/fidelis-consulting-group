import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrincipal } from "@/lib/principal";
import { canCreateDepartment } from "@/lib/workspace-policy";
import { recordAudit } from "@/lib/audit";

/** GET /api/school/departments — list the current school's departments (scoped). */
export async function GET() {
  const principal = await getPrincipal();
  if (!principal) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!principal.schoolId || !canCreateDepartment(principal, principal.schoolId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const departments = await prisma.department.findMany({
    where: { schoolId: principal.schoolId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, nameAr: true, subject: true, teacherCount: true },
  });

  return NextResponse.json({ departments });
}

/**
 * POST /api/school/departments — create a department within the current
 * school tenant. Only a school_admin of that exact school (or platform admin)
 * may create departments. Creates an Assignment audit event.
 */
export async function POST(request: NextRequest) {
  const principal = await getPrincipal();
  if (!principal) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!principal.schoolId || !canCreateDepartment(principal, principal.schoolId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : null;
  if (!name) return NextResponse.json({ error: "Department name is required." }, { status: 400 });

  const existing = await prisma.department.findFirst({
    where: { schoolId: principal.schoolId, name },
  });
  if (existing) {
    return NextResponse.json({ error: "A department with that name already exists." }, { status: 409 });
  }

  const department = await prisma.department.create({
    data: { schoolId: principal.schoolId, name, subject },
  });

  await recordAudit(prisma, {
    action: "department.created",
    entityType: "Department",
    entityId: department.id,
    actorUserId: principal.userId,
    schoolId: principal.schoolId,
    newValues: { name, subject, schoolId: principal.schoolId },
  });

  return NextResponse.json({ department }, { status: 201 });
}
