import { requireAnyRole } from "@/lib/authorization";

export default async function AdminDashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAnyRole(["admin"]);
  return children;
}
