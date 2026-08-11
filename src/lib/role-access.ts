export type RoleLike = { name: string };

export function hasAnyRole(
  roles: readonly RoleLike[] | undefined,
  allowedRoles: readonly string[],
): boolean {
  return Boolean(roles?.some((role) => allowedRoles.includes(role.name)));
}
