interface Permission {
  name: string;
  actions: string[];
}

interface PermissionGroup {
  name: string;
  properties: Permission[];
}

interface UserPermissions {
  roleName: string;
  roleId: string;
  permissions: {
    GROUP: PermissionGroup[];
    appNAME: string;
  };
  teamId: string | null;
}

/**
 * Check if user has permission for a specific action on a specific resource
 * @param userPermissions - Array of user permissions from context
 * @param resourceName - Name of the resource (e.g., 'Invoice', 'Customer', 'Employee')
 * @param action - Action to check (e.g., 'create', 'view', 'update', 'delete')
 * @returns boolean indicating if user has permission
 */
export const hasPermission = (
  userPermissions: UserPermissions[],
  resourceName: string,
  action: string
): boolean => {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  return userPermissions.some((member) => {
    const permissions = member.permissions.GROUP;

    return permissions.some((group) => {
      const resource = group.properties.find(
        (prop) => prop.name === resourceName
      );
      return resource?.actions.includes(action) || false;
    });
  });
};

/**
 * Get all permissions for a specific resource
 * @param userPermissions - Array of user permissions from context
 * @param resourceName - Name of the resource
 * @returns Array of allowed actions for the resource
 */
export const getResourcePermissions = (
  userPermissions: UserPermissions[],
  resourceName: string
): string[] => {
  if (!userPermissions || userPermissions.length === 0) {
    return [];
  }

  const allActions: string[] = [];

  userPermissions.forEach((member) => {
    const permissions = member.permissions.GROUP;

    permissions.forEach((group) => {
      const resource = group.properties.find(
        (prop) => prop.name === resourceName
      );
      if (resource) {
        allActions.push(...resource.actions);
      }
    });
  });

  return [...new Set(allActions)]; // Remove duplicates
};

/**
 * Check if user has any role with a specific name
 * @param userPermissions - Array of user permissions from context
 * @param roleName - Name of the role to check
 * @returns boolean indicating if user has the role
 */
export const hasRole = (
  userPermissions: UserPermissions[],
  roleName: string
): boolean => {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  return userPermissions.some((member) => member.roleName === roleName);
};

/**
 * Get all roles the user has
 * @param userPermissions - Array of user permissions from context
 * @returns Array of role names
 */
export const getUserRoles = (userPermissions: UserPermissions[]): string[] => {
  if (!userPermissions || userPermissions.length === 0) {
    return [];
  }

  return userPermissions.map((member) => member.roleName);
};

/**
 * Check if user is an admin (has CEO role or similar admin roles)
 * @param userPermissions - Array of user permissions from context
 * @returns boolean indicating if user is admin
 */
export const isAdmin = (userPermissions: UserPermissions[]): boolean => {
  const adminRoles = ['CEO', 'Admin', 'Administrator', 'Owner'];
  return (
    hasRole(userPermissions, adminRoles) ||
    userPermissions.some((member) => adminRoles.includes(member.roleName))
  );
};
