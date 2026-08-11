import { auth } from "@/lib/auth";
import { hasAnyRole } from "@/lib/role-access";
import { redirect } from "next/navigation";

export async function requireAnyRole(allowedRoles: readonly string[]) {
  const session = await auth();
  if (!session?.user?.id) redirect("/app/login");
  if (!hasAnyRole(session.user.roles, allowedRoles)) redirect("/app/dashboard");
  return session;
}
