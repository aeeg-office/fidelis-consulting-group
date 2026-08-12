import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Principal } from "@/lib/workspace-policy";

/**
 * Resolve the authenticated principal's tenant-scoped identity from the
 * database (never from client-supplied fields). Returns null when there is no
 * valid session or the account is inactive/unverified. schoolId and
 * departmentId are authoritative from the persisted User row.
 */
export async function getPrincipal(): Promise<Principal | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, schoolId: true, departmentId: true, isActive: true, emailVerified: true },
  });
  if (!user || !user.isActive || !user.emailVerified) return null;

  const roles = (session.user as { roles?: { name: string }[] }).roles ?? [];

  return {
    userId: user.id,
    schoolId: user.schoolId,
    departmentId: user.departmentId,
    roles,
  };
}
