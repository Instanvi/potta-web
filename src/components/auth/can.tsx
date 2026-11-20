'use client';

import React, { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthContextStore } from '@/store/use-auth-context-store';
import { hasAnyPermission } from '@/lib/permissions';
import { hasAdminRole } from '@/lib/org-admin';

interface CanProps {
  /** e.g. resource="Invoice" action="create"; with several actions, any one grants access. */
  resource: string;
  action: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/** Renders children only when the user holds the permission (org admins always pass). */
export function Can({ resource, action, children, fallback = null }: CanProps) {
  const { canAccess } = useCan();
  return <>{canAccess(resource, action) ? children : fallback}</>;
}

export function useCan() {
  const { data: session } = useSession();
  const permissions = useAuthContextStore((s) => s.permissions);
  const roleNames = useAuthContextStore((s) => s.roleNames);
  const user = session?.user;

  const canAccess = useCallback(
    (resource: string, action: string | string[]): boolean => {
      if (!user) return false;
      if (hasAdminRole(user.role, roleNames)) return true;
      return hasAnyPermission(permissions, resource, Array.isArray(action) ? action : [action]);
    },
    [user, roleNames, permissions],
  );

  const canAccessAll = useCallback(
    (resource: string, actions: string[]): boolean => {
      if (!user) return false;
      if (hasAdminRole(user.role, roleNames)) return true;
      const allowed = permissions[resource];
      return !!allowed && actions.every((a) => allowed.includes(a));
    },
    [user, roleNames, permissions],
  );

  return { canAccess, canAccessAll, user, permissions };
}
