import { describe, expect, it } from "vitest";
import { decideEnrollment } from "../../src/lib/workshop-enrollment";

describe("workshop enrollment rules", () => {
  it("allows a new participant when there is capacity", () => {
    expect(decideEnrollment(30, 12, false, true)).toEqual({ ok: true });
  });

  it("denies when the cohort is full (at capacity)", () => {
    expect(decideEnrollment(12, 12, false, true)).toEqual({ ok: false, error: "at_capacity" });
    expect(decideEnrollment(12, 15, false, true)).toEqual({ ok: false, error: "at_capacity" });
  });

  it("treats null maxParticipants as unlimited", () => {
    expect(decideEnrollment(null, 500, false, true)).toEqual({ ok: true });
  });

  it("denies duplicate enrollment", () => {
    expect(decideEnrollment(30, 5, true, true)).toEqual({ ok: false, error: "already_enrolled" });
  });

  it("denies registration for unpublished workshops", () => {
    expect(decideEnrollment(30, 5, false, false)).toEqual({ ok: false, error: "not_published" });
  });
});
