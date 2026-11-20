import type { PermissionRecord, Role } from '@/types/auth';

/** Merge `{ Resource: [actions] }` maps of every role into one map. */
export function consolidatePermissions(roles: Role[] = []): {
  permissions: PermissionRecord;
  roleNames: string[];
} {
  const permissions: PermissionRecord = {};
  const roleNames: string[] = [];

  for (const role of roles) {
    if (role.name) roleNames.push(role.name);
    else if (role.id) roleNames.push(role.id);
    for (const [resource, actions] of Object.entries(role.permissions ?? {})) {
      if (!Array.isArray(actions)) continue;
      permissions[resource] = Array.from(new Set([...(permissions[resource] ?? []), ...actions]));
    }
  }

  return { permissions, roleNames };
}
