import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrincipal } from "@/lib/principal";
import { canManagePlatformUsers } from "@/lib/workspace-policy";
import { parseLeadCreate } from "@/lib/crm";
import { recordAudit } from "@/lib/audit";

/** GET /api/crm/leads — list consultancy leads (platform admin). */
export async function GET() {
  const principal = await getPrincipal();
  if (!principal) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManagePlatformUsers(principal)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const leads = await prisma.contactInquiry.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, company: true, message: true, status: true, createdAt: true },
  });

  return NextResponse.json({ leads });
}

/** POST /api/crm/leads — create a consultancy lead from validated input (platform admin). */
export async function POST(request: NextRequest) {
  const principal = await getPrincipal();
  if (!principal) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManagePlatformUsers(principal)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseLeadCreate(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const lead = await prisma.contactInquiry.create({
    data: {
      name: parsed.value.name,
      email: parsed.value.email,
      company: parsed.value.company,
      message: parsed.value.message,
      status: parsed.value.status,
      metadata: { source: "crm", createdBy: principal.userId },
    },
  });

  await recordAudit(prisma, {
    action: "crm.lead.created",
    entityType: "ContactInquiry",
    entityId: lead.id,
    actorUserId: principal.userId,
    metadata: { status: parsed.value.status },
  });

  return NextResponse.json({ lead }, { status: 201 });
}
