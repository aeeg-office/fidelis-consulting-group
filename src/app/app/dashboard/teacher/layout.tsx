import { requireAnyRole } from "@/lib/authorization";

export default async function TeacherDashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAnyRole(["admin", "school_admin", "hod", "teacher", "independent_teacher"]);
  return children;
}
