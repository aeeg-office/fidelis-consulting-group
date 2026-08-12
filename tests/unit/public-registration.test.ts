import { describe, expect, it } from "vitest";
import { validatePublicRegistration } from "../../src/lib/public-registration";

describe("public registration policy", () => {
  const valid = {
    fullName: "Sarah Ahmed",
    email: "SARAH@EXAMPLE.COM ",
    password: "Correct-Horse-9",
    role: "independent_teacher",
  };

  it("normalizes and permits only independent-teacher self-registration", () => {
    expect(validatePublicRegistration(valid)).toEqual({
      ok: true,
      value: {
        fullName: "Sarah Ahmed",
        email: "sarah@example.com",
        password: "Correct-Horse-9",
        role: "independent_teacher",
      },
    });
  });

  it.each([
    [{ ...valid, role: "teacher" }, "School-linked roles require an invitation."],
    [{ ...valid, role: "admin" }, "School-linked roles require an invitation."],
    [{ ...valid, schoolId: "another-school" }, "School-linked roles require an invitation."],
    [{ ...valid, password: "password123" }, "Password must be at least 12 characters and include three character types."],
  ])("rejects unsafe public input: %o", (input, error) => {
    expect(validatePublicRegistration(input)).toEqual({ ok: false, error });
  });
});
