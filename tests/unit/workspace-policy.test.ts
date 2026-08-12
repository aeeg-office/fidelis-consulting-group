import { describe, expect, it } from "vitest";
import {
  canApproveSchools,
  canCreateDepartment,
  canManagePlatformUsers,
  canManageSchool,
  canProvisionTeacher,
  canViewDepartment,
  hasAnyRole,
  hasRole,
  workspaceLandingPath,
  type Principal,
} from "../../src/lib/workspace-policy";

function principal(overrides: Partial<Principal> = {}): Principal {
  return {
    userId: "u1",
    schoolId: null,
    departmentId: null,
    roles: [],
    ...overrides,
  };
}

const schoolA = "school-a";
const schoolB = "school-b";

describe("workspace landing policy", () => {
  it("sends an anonymous principal to login", () => {
    expect(workspaceLandingPath(undefined)).toBe("/app/login");
  });

  it("sends each role to its dedicated workspace", () => {
    expect(workspaceLandingPath(principal({ roles: [{ name: "admin" }] }))).toBe("/app/dashboard/admin");
    expect(workspaceLandingPath(principal({ roles: [{ name: "school_admin" }] }))).toBe("/app/school");
    expect(workspaceLandingPath(principal({ roles: [{ name: "hod" }] }))).toBe("/app/hod");
    expect(workspaceLandingPath(principal({ roles: [{ name: "teacher" }] }))).toBe("/app/dashboard/teacher");
    expect(workspaceLandingPath(principal({ roles: [{ name: "independent_teacher" }] }))).toBe("/app/dashboard/teacher");
    expect(workspaceLandingPath(principal({ roles: [{ name: "workshop_participant" }] }))).toBe("/app");
  });
});

describe("platform-admin-only capabilities", () => {
  it("only the platform admin can approve or create schools", () => {
    expect(canApproveSchools(principal({ roles: [{ name: "admin" }] }))).toBe(true);
    expect(canApproveSchools(principal({ roles: [{ name: "school_admin" }] }))).toBe(false);
    expect(canApproveSchools(principal({ roles: [{ name: "hod" }] }))).toBe(false);
    expect(canApproveSchools(undefined)).toBe(false);
  });

  it("only the platform admin can manage platform users", () => {
    expect(canManagePlatformUsers(principal({ roles: [{ name: "admin" }] }))).toBe(true);
    expect(canManagePlatformUsers(principal({ roles: [{ name: "school_admin" }] }))).toBe(false);
  });
});

describe("school tenant boundary", () => {
  it("allows a school_admin to manage their own school only", () => {
    const sa = principal({ schoolId: schoolA, roles: [{ name: "school_admin" }] });
    expect(canManageSchool(sa, schoolA)).toBe(true);
    expect(canManageSchool(sa, schoolB)).toBe(false);
    expect(canCreateDepartment(sa, schoolA)).toBe(true);
    expect(canProvisionTeacher(sa, schoolA)).toBe(true);
  });

  it("denies non-school-admins tenant management even with a valid school id", () => {
    const teacher = principal({ schoolId: schoolA, roles: [{ name: "teacher" }] });
    expect(canManageSchool(teacher, schoolA)).toBe(false);
    expect(canProvisionTeacher(teacher, schoolA)).toBe(false);
  });

  it("rejects tenant management without a school id", () => {
    const sa = principal({ roles: [{ name: "school_admin" }] });
    expect(canManageSchool(sa, null)).toBe(false);
  });

  it("lets a platform admin manage any school tenant", () => {
    const admin = principal({ roles: [{ name: "admin" }] });
    expect(canManageSchool(admin, schoolA)).toBe(true);
    expect(canManageSchool(admin, schoolB)).toBe(true);
  });
});

describe("department visibility", () => {
  const deptA = { id: "dept-1", schoolId: schoolA };
  const deptB = { id: "dept-2", schoolId: schoolB };

  it("lets a platform admin view any department", () => {
    expect(canViewDepartment(principal({ roles: [{ name: "admin" }] }), deptA)).toBe(true);
  });

  it("lets a school_admin view departments of their own school only", () => {
    const sa = principal({ schoolId: schoolA, roles: [{ name: "school_admin" }] });
    expect(canViewDepartment(sa, deptA)).toBe(true);
    expect(canViewDepartment(sa, deptB)).toBe(false);
  });

  it("lets an HOD view only their own department", () => {
    const hod = principal({ departmentId: "dept-1", roles: [{ name: "hod" }] });
    expect(canViewDepartment(hod, deptA)).toBe(true);
    expect(canViewDepartment(hod, deptB)).toBe(false);
  });

  it("denies teachers who cannot view any department data", () => {
    const teacher = principal({ schoolId: schoolA, roles: [{ name: "teacher" }] });
    expect(canViewDepartment(teacher, deptA)).toBe(false);
  });
});

describe("role helpers", () => {
  it("hasRole and hasAnyRole behave for multiple roles", () => {
    const multi = principal({ roles: [{ name: "hod" }, { name: "teacher" }] });
    expect(hasRole(multi, "hod")).toBe(true);
    expect(hasRole(multi, "admin")).toBe(false);
    expect(hasAnyRole(multi, ["admin", "teacher"])).toBe(true);
  });
});
