/**
 * Consultancy CRM rules built on the existing ContactInquiry record. Pure
 * validation for lead creation and pipeline/note updates, so client payloads
 * can never set arbitrary statuses or forge associations.
 */

export const CRM_PIPELINE_STATUSES = [
  "new",
  "qualified",
  "contacted",
  "proposal",
  "won",
  "lost",
] as const;

export type CrmStatus = (typeof CRM_PIPELINE_STATUSES)[number];

export function isCrmStatus(value: string): value is CrmStatus {
  return (CRM_PIPELINE_STATUSES as readonly string[]).includes(value);
}

export type LeadCreateResult =
  | { ok: true; value: { name: string; email: string; company: string | null; message: string; status: CrmStatus } }
  | { ok: false; error: string };

export function parseLeadCreate(body: Record<string, unknown>): LeadCreateResult {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  const company = typeof body.company === "string" ? body.company.trim().slice(0, 200) : null;
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 5000) : "";
  const status = typeof body.status === "string" ? body.status : "new";

  if (!name) return { ok: false, error: "Name is required." };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "A valid email is required." };
  }
  if (!isCrmStatus(status)) {
    return { ok: false, error: "Invalid pipeline status." };
  }
  return { ok: true, value: { name, email, company, message, status } };
}

export type LeadUpdateResult =
  | { ok: true; value: { status?: CrmStatus; notes?: string; company?: string | null } }
  | { ok: false; error: string };

export function parseLeadUpdate(body: Record<string, unknown>): LeadUpdateResult {
  let status: CrmStatus | undefined;
  if (typeof body.status === "string") {
    if (!isCrmStatus(body.status)) {
      return { ok: false, error: "Invalid pipeline status." };
    }
    status = body.status;
  }
  const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 5000) : undefined;
  const company = typeof body.company === "string" ? body.company.trim().slice(0, 200) : undefined;

  return { ok: true, value: { status, notes, company } };
}
