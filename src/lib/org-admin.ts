/** Normalize role labels: "Org Admin" / "ORG_ADMIN" / "org_admin" -> "orgadmin". */
export function normalizeRoleKey(role?: string | null): string {
  if (!role) return '';
  return role.toLowerCase().replace(/[\s_-]+/g, '');
}

export function isAdminRoleName(role?: string | null): boolean {
  const key = normalizeRoleKey(role?.trim());
  if (!key) return false;
  if (['orgadmin', 'organizationadmin', 'superadmin', 'owner', 'admin'].includes(key)) {
    return true;
  }
  return (
    key.includes('orgadmin') ||
    key.includes('organizationadmin') ||
    key.includes('superadmin') ||
    key.endsWith('owner')
  );
}

export function hasAdminRole(role?: string | null, roleNames: string[] = []): boolean {
  return isAdminRoleName(role) || roleNames.some((name) => isAdminRoleName(name));
}

/** Detect ORG_ADMIN / owner / admin from /session/permissions roles. */
export function isOrgAdminFromRoles(
  roleNames: string[] = [],
  roles: Array<{ id?: string; name?: string | null } | null | undefined> = [],
): boolean {
  if (roleNames.some((name) => isAdminRoleName(name))) return true;
  return roles.some((role) => !!role && (isAdminRoleName(role.name) || isAdminRoleName(role.id)));
}
