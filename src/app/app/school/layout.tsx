import { requireAnyRole } from "@/lib/authorization";

/**
 * School workspace guard: only school_admin (or platform admin) may access
 * /app/school. Unauthorized users are redirected server-side.
 */
export default async function SchoolWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAnyRole(["school_admin", "admin"]);
  return <>{children}</>;
}
