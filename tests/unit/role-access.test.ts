import { describe, expect, it } from "vitest";
import { hasAnyRole } from "../../src/lib/role-access";

describe("role route access", () => {
  it("permits a matching role", () => {
    expect(hasAnyRole([{ name: "teacher", displayName: "Teacher" }], ["teacher", "hod"])).toBe(true);
  });

  it("does not let a query parameter or unrelated role become authorization", () => {
    expect(hasAnyRole([{ name: "independent_teacher", displayName: "Independent Teacher" }], ["admin"])).toBe(false);
    expect(hasAnyRole([], ["teacher"])).toBe(false);
  });
});
