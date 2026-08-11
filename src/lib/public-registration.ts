export type PublicRegistrationInput = {
  fullName?: unknown;
  email?: unknown;
  password?: unknown;
  role?: unknown;
  schoolId?: unknown;
};

export type ValidPublicRegistration = {
  fullName: string;
  email: string;
  password: string;
  role: "independent_teacher";
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isStrongPassword(password: string): boolean {
  const characterTypes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/]
    .filter((pattern) => pattern.test(password)).length;
  return password.length >= 12 && characterTypes >= 3;
}

/**
 * Public registration is deliberately restricted to non-tenant accounts.
 * School roles must be provisioned by an authorized school administrator.
 */
export function validatePublicRegistration(
  input: PublicRegistrationInput,
): { ok: true; value: ValidPublicRegistration } | { ok: false; error: string } {
  if (typeof input.fullName !== "string" || input.fullName.trim().length < 2) {
    return { ok: false, error: "Full name is required (at least 2 characters)." };
  }
  if (typeof input.email !== "string" || !EMAIL_PATTERN.test(input.email.trim())) {
    return { ok: false, error: "A valid email address is required." };
  }
  if (typeof input.password !== "string" || !isStrongPassword(input.password)) {
    return { ok: false, error: "Password must be at least 12 characters and include three character types." };
  }
  if (input.role !== "independent_teacher" || input.schoolId !== undefined && input.schoolId !== null && input.schoolId !== "") {
    return { ok: false, error: "School-linked roles require an invitation." };
  }
  return {
    ok: true,
    value: {
      fullName: input.fullName.trim(),
      email: input.email.toLowerCase().trim(),
      password: input.password,
      role: "independent_teacher",
    },
  };
}
