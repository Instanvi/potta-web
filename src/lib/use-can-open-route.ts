import { useCallback } from 'react';
import { useCan } from '@/components/auth/can';
import { getRoutePermission, satisfiesPermission } from '@/lib/route-permissions';
import { useAuthContextStore } from '@/store/use-auth-context-store';
import { hasAdminRole } from '@/lib/org-admin';

/** Same rule as the route guard: admins open everything, others need the route's permission. */
export function useCanOpenRoute() {
  const { user } = useCan();
  const permissions = useAuthContextStore((s) => s.permissions);
  const roleNames = useAuthContextStore((s) => s.roleNames);
  const isAdmin = hasAdminRole(user?.role, roleNames);

  return useCallback(
    (href: string) => {
      if (isAdmin) return true;
      const check = getRoutePermission(href);
      return !check || satisfiesPermission(permissions, check);
    },
    [isAdmin, permissions]
  );
}
