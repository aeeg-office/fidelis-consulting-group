import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrincipal } from "@/lib/principal";
import { decideEnrollment } from "@/lib/workshop-enrollment";
import { recordAudit } from "@/lib/audit";

/**
 * POST /api/workshops/[id]/enroll — register the authenticated user for a
 * published workshop. Capacity and duplicate checks run inside a transaction,
 * so a full cohort cannot be overbooked and a user cannot enroll twice.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const principal = await getPrincipal();
  if (!principal) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const workshop = await prisma.workshop.findUnique({
    where: { id },
    select: { id: true, title: true, isPublished: true, maxParticipants: true },
  });
  if (!workshop) return NextResponse.json({ error: "Workshop not found." }, { status: 404 });

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.workshopEnrollment.findFirst({
      where: { userId: principal.userId, workshopId: id },
    });
    const activeCount = await tx.workshopEnrollment.count({
      where: { workshopId: id, status: { in: ["enrolled", "in_progress"] } },
    });

    const decision = decideEnrollment(
      workshop.maxParticipants,
      activeCount,
      Boolean(existing),
      workshop.isPublished,
    );
    if (!decision.ok) return { decision };

    const enrollment = await tx.workshopEnrollment.create({
      data: { userId: principal.userId, workshopId: id, status: "enrolled", progress: 0 },
    });

    await tx.auditLog.create({
      data: {
        userId: principal.userId,
        schoolId: principal.schoolId,
        action: "workshop.enrolled",
        entityType: "WorkshopEnrollment",
        entityId: enrollment.id,
        metadata: { workshopId: id, workshopTitle: workshop.title },
      },
    });

    return { decision, enrollment };
  });

  if (!result.decision.ok) {
    const reasons: Record<string, number> = {
      already_enrolled: 409,
      at_capacity: 409,
      not_published: 403,
    };
    return NextResponse.json(
      { error: `Enrollment not allowed: ${result.decision.error}.` },
      { status: reasons[result.decision.error] ?? 400 },
    );
  }

  return NextResponse.json({ enrollment: result.enrollment }, { status: 201 });
}
