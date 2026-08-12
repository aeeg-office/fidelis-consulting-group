/**
 * Pure rules for workshop registration. Capacity and duplicate checks are
 * evaluated server-side against counts read within the same transaction, so a
 * client can never bypass a full cohort or register twice.
 */

export type EnrollmentDecision =
  | { ok: true }
  | { ok: false; error: "already_enrolled" | "at_capacity" | "not_published" };

/**
 * @param maxParticipants workshop.maxParticipants (null = unlimited)
 * @param activeCount     number of currently enrolled participants
 * @param alreadyEnrolled whether this user already holds an enrollment
 * @param isPublished     workshop.isPublished (registration allowed only when published)
 */
export function decideEnrollment(
  maxParticipants: number | null,
  activeCount: number,
  alreadyEnrolled: boolean,
  isPublished: boolean,
): EnrollmentDecision {
  if (!isPublished) return { ok: false, error: "not_published" };
  if (alreadyEnrolled) return { ok: false, error: "already_enrolled" };
  if (maxParticipants !== null && activeCount >= maxParticipants) {
    return { ok: false, error: "at_capacity" };
  }
  return { ok: true };
}
