import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrincipal } from "@/lib/principal";
import { canManagePlatformUsers } from "@/lib/workspace-policy";
import { parseLeadUpdate } from "@/lib/crm";
import { recordAudit } from "@/lib/audit";

/**
 * PATCH /api/crm/leads/[id] — update a lead's pipeline status / notes / company.
 * Platform admin only; every transition is audited.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const principal = await getPrincipal();
  if (!principal) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManagePlatformUsers(principal)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseLeadUpdate(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const lead = await prisma.contactInquiry.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });

  const prevStatus = lead.status;
  const updated = await prisma.contactInquiry.update({
    where: { id },
    data: {
      ...(parsed.value.status ? { status: parsed.value.status } : {}),
      ...(parsed.value.company !== undefined ? { company: parsed.value.company } : {}),
      ...(parsed.value.notes ? { metadata: { ...(lead.metadata as object), note: parsed.value.notes } } : {}),
    },
  });

  await recordAudit(prisma, {
    action: "crm.lead.updated",
    entityType: "ContactInquiry",
    entityId: id,
    actorUserId: principal.userId,
    oldValues: { status: prevStatus },
    newValues: { status: updated.status },
  });

  return NextResponse.json({ lead: updated });
}
