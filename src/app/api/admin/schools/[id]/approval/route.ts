import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrincipal } from "@/lib/principal";
import { canApproveSchools } from "@/lib/workspace-policy";
import { recordAudit } from "@/lib/audit";

/**
 * POST /api/admin/schools/[id]/approval — approve or reject a school tenant.
 * Platform admin only. State transition is audited.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const principal = await getPrincipal();
  if (!principal) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canApproveSchools(principal)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  let body: { status?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (body.status !== "approved" && body.status !== "rejected") {
    return NextResponse.json({ error: "status must be 'approved' or 'rejected'." }, { status: 400 });
  }

  const school = await prisma.school.findUnique({ where: { id } });
  if (!school) return NextResponse.json({ error: "School not found." }, { status: 404 });

  const previous = school.status;
  const updated = await prisma.school.update({
    where: { id },
    data: { status: body.status },
  });

  await recordAudit(prisma, {
    action: "school.status.changed",
    entityType: "School",
    entityId: id,
    actorUserId: principal.userId,
    schoolId: id,
    oldValues: { status: previous },
    newValues: { status: updated.status },
  });

  return NextResponse.json({ school: updated });
}
