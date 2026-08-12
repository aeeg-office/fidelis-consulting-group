/**
 * Central role policy and tenant-scoping rules for role workspaces.
 *
 * These functions are pure (no I/O) so the authorization spine is unit-testable
 * in isolation from the database. Every protected workspace/route derives its
 * tenant from the authenticated principal, never from a client-supplied ID.
 */

export type RoleName = string;

export interface PrincipalRole {
  name: string;
}

export interface Principal {
  userId: string;
  schoolId: string | null;
  departmentId: string | null;
  roles: PrincipalRole[];
}

export interface DepartmentRef {
  id: string;
  schoolId: string | null;
}

export function hasRole(principal: Principal | undefined, role: RoleName): boolean {
  return Boolean(principal?.roles.some((r) => r.name === role));
}

export function hasAnyRole(principal: Principal | undefined, roles: readonly RoleName[]): boolean {
  return Boolean(principal?.roles.some((r) => roles.includes(r.name)));
}

export const PLATFORM_ADMIN = "admin";

/**
 * Central login-landing policy: where a signed-in user should be sent based on
 * their roles. School-linked and platform roles get their dedicated workspace;
 * everyone else lands on the app home.
 */
export function workspaceLandingPath(principal: Principal | undefined): string {
  if (!principal) return "/app/login";
  if (hasRole(principal, PLATFORM_ADMIN)) return "/app/dashboard/admin";
  if (hasRole(principal, "school_admin")) return "/app/school";
  if (hasRole(principal, "hod")) return "/app/hod";
  if (hasAnyRole(principal, ["teacher", "independent_teacher"])) return "/app/dashboard/teacher";
  return "/app";
}

/** Only the platform admin may approve or create school tenants. */
export function canApproveSchools(principal: Principal | undefined): boolean {
  return hasRole(principal, PLATFORM_ADMIN);
}

/** Only the platform admin may manage platform users/roles globally. */
export function canManagePlatformUsers(principal: Principal | undefined): boolean {
  return hasRole(principal, PLATFORM_ADMIN);
}

/**
 * A principal may manage a school's operational data (profile, departments,
 * teacher provisioning) when they are the platform admin OR a school_admin who
 * belongs to that exact school. This is the tenant boundary: a school_admin can
 * never act on another school's ID.
 */
export function canManageSchool(principal: Principal | undefined, schoolId: string | null): boolean {
  if (!principal) return false;
  if (!schoolId) return false;
  if (hasRole(principal, PLATFORM_ADMIN)) return true;
  return hasRole(principal, "school_admin") && principal.schoolId === schoolId;
}

/** Alias for readability at the service layer. */
export function canProvisionTeacher(principal: Principal | undefined, schoolId: string | null): boolean {
  return canManageSchool(principal, schoolId);
}

export function canCreateDepartment(principal: Principal | undefined, schoolId: string | null): boolean {
  return canManageSchool(principal, schoolId);
}

/**
 * A principal may view a department's data when they are a platform admin, a
 * school_admin of the department's school, or the HOD whose department is that
 * exact department. This prevents an HOD from reading another department and a
 * school_admin of one school from reading another school's department.
 */
export function canViewDepartment(
  principal: Principal | undefined,
  department: DepartmentRef,
): boolean {
  if (!principal) return false;
  if (hasRole(principal, PLATFORM_ADMIN)) return true;
  if (hasRole(principal, "school_admin")) {
    return Boolean(department.schoolId && department.schoolId === principal.schoolId);
  }
  if (hasRole(principal, "hod")) {
    return Boolean(principal.departmentId && principal.departmentId === department.id);
  }
  return false;
}

/**
 * A teacher may see only their own records and, when school-linked, their own
 * school/department context. Teachers never manage or approve anything.
 */
export function canViewOwnProfile(principal: Principal | undefined): boolean {
  return Boolean(principal?.userId);
}
