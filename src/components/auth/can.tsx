"use client";

import { useSession } from "next-auth/react";
import React from "react";
import type { Session } from "next-auth";
import { hasPermission, hasAnyPermission } from "@/lib/permissions";

type AuthUser = Session["user"] & {
  permissions?: Record<string, string[]>;
  activeOrganization?: {
    members?: { userId: string; role: string }[];
  };
  role?: string;
};

interface CanProps {
  /**
   * Resource-based permission check.
   * e.g., resource="Employee" action="view"
   */
  resource?: string;
  /**
   * The action(s) to check on the resource.
   * If an array, ANY of the actions will grant access.
   */
  action?: string | string[];
  /**
   * Roles allowed in the active organization.
   * e.g., ['OWNER', 'ORG_ADMIN']
   */
  orgRoles?: string[];
  /**
   * Global roles allowed.
   * e.g., ['SUPER_ADMIN', 'ADMIN']
   */
  roles?: string[];
  /**
   * Content to show if the user has permission.
   */
  children: React.ReactNode;
  /**
   * Content to show if the user does NOT have permission.
   */
  fallback?: React.ReactNode;
}

/**
 * A component that conditionally renders children based on:
 * - Resource/action permissions (granular)
 * - Global roles
 * - Organization roles
 */
export function Can({
  resource,
  action,
  orgRoles,
  roles,
  children,
  fallback = null,
}: CanProps) {
  const { data: session } = useSession();
  const user = session?.user as AuthUser | undefined;

  if (!user) return fallback;

  // 1. Check resource/action-based permissions
  if (resource && action) {
    const permissions = user.permissions;
    const actions = Array.isArray(action) ? action : [action];
    if (hasAnyPermission(permissions, resource, actions)) {
      return <>{children}</>;
    }
  }

  // 2. Check global roles
  if (roles && user.role && roles.includes(user.role)) {
    return <>{children}</>;
  }

  // 3. Check organization roles
  if (orgRoles && user.activeOrganization) {
    const member = user.activeOrganization.members?.find(
      (m) => m.userId === user.id,
    );
    if (member && orgRoles.includes(member.role)) {
      return <>{children}</>;
    }
  }

  // 4. Fallback
  return <>{fallback}</>;
}

/**
 * A hook to check permissions programmatically within components.
 */
export function useCan() {
  const { data: session } = useSession();
  const user = session?.user as AuthUser | undefined;

  const permissions = user?.permissions || null;

  /**
   * Check role-based access (legacy).
   */
  const can = (options: { roles?: string[]; orgRoles?: string[] }) => {
    if (!user) return false;

    if (options.roles && user.role && options.roles.includes(user.role)) return true;

    if (options.orgRoles && user.activeOrganization) {
      const member = user.activeOrganization.members?.find(
        (m) => m.userId === user.id,
      );
      if (member && options.orgRoles.includes(member.role)) return true;
    }

    return false;
  };

  /**
   * Check resource/action-based access (granular).
   */
  const canAccess = (resource: string, action: string | string[]): boolean => {
    if (!user) return false;

    // Super admins bypass permission checks
    if (user.role === "SUPER_ADMIN" || user.role === "admin") return true;

    const actions = Array.isArray(action) ? action : [action];
    return hasAnyPermission(permissions, resource, actions);
  };

  /**
   * Check if the user has ALL specified actions on a resource.
   */
  const canAccessAll = (resource: string, actions: string[]): boolean => {
    if (!user) return false;
    if (user.role === "SUPER_ADMIN" || user.role === "admin") return true;

    if (!permissions) return false;
    const allowed = permissions[resource];
    if (!allowed) return false;
    return actions.every((a) => allowed.includes(a));
  };

  return {
    can,
    canAccess,
    canAccessAll,
    user,
    permissions,
    activeOrg: user?.activeOrganization,
    orgMember: user?.activeOrganization?.members?.find(
      (m) => m.userId === user?.id,
    ),
  };
}
