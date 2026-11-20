import { Role } from "@/types/auth";

export const consolidatePermissions = (
  roles: Role[],
): Record<string, string[]> => {
  const permissions: Record<string, string[]> = {};

  roles.forEach((role) => {
    if (role.permissions) {
      Object.entries(role.permissions).forEach(([resource, actions]) => {
        if (Array.isArray(actions)) {
          if (!permissions[resource]) {
            permissions[resource] = [];
          }
          permissions[resource] = Array.from(
            new Set([...permissions[resource], ...actions]),
          );
        }
      });
    }
  });

  return permissions;
};
