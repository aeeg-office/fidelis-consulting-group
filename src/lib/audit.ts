import type { PrismaClient } from "@prisma/client";

export interface AuditInput {
  action: string;
  entityType?: string;
  entityId?: string;
  actorUserId?: string | null;
  schoolId?: string | null;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Write a tamper-evident, tenant-tagged audit record for a privileged action.
 * All role, tenant, approval, and provisioning transitions must be audited.
 */
export async function recordAudit(prisma: PrismaClient, input: AuditInput): Promise<void> {
  await prisma.auditLog.create({
    data: {
      action: input.action,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      userId: input.actorUserId ?? null,
      schoolId: input.schoolId ?? null,
      oldValues: (input.oldValues ?? {}) as object,
      newValues: (input.newValues ?? {}) as object,
      metadata: (input.metadata ?? {}) as object,
    },
  });
}
