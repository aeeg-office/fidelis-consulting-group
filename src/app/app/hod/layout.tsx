import { requireAnyRole } from "@/lib/authorization";

/**
 * HOD workspace guard: only an HOD (or platform admin) may access /app/hod.
 * Unauthorized users are redirected server-side.
 */
export default async function HodWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAnyRole(["hod", "admin"]);
  return <>{children}</>;
}
