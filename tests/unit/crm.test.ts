import { describe, expect, it } from "vitest";
import { isCrmStatus, parseLeadCreate, parseLeadUpdate } from "../../src/lib/crm";

describe("CRM lead creation", () => {
  it("accepts a valid lead", () => {
    const r = parseLeadCreate({ name: "Amina", email: " A@B.com ", company: "School X", message: "Hi" });
    expect(r).toEqual({
      ok: true,
      value: { name: "Amina", email: "a@b.com", company: "School X", message: "Hi", status: "new" },
    });
  });

  it.each([
    [{ email: "a@b.com", message: "x" }, "Name is required."],
    [{ name: "A", email: "not-an-email", message: "x" }, "A valid email is required."],
    [{ name: "A", email: "a@b.com", status: "wonky" }, "Invalid pipeline status."],
  ])("rejects invalid lead input %o", (body, error) => {
    expect(parseLeadCreate(body)).toEqual({ ok: false, error });
  });
});

describe("CRM lead update", () => {
  it("accepts a valid pipeline transition and notes", () => {
    expect(parseLeadUpdate({ status: "won", notes: "Signed" })).toEqual({
      ok: true,
      value: { status: "won", notes: "Signed", company: undefined },
    });
  });

  it("rejects an unknown pipeline status", () => {
    expect(parseLeadUpdate({ status: "banana" })).toEqual({ ok: false, error: "Invalid pipeline status." });
  });

  it("recognizes all declared statuses", () => {
    for (const s of ["new", "qualified", "contacted", "proposal", "won", "lost"]) {
      expect(isCrmStatus(s)).toBe(true);
    }
    expect(isCrmStatus("deleted")).toBe(false);
  });
});
