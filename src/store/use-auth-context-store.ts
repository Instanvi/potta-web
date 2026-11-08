import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  GetSessionResponse,
  Hierarchy,
  Organization,
  OrganizationAssignment,
  PermissionRecord,
  Role,
  SessionHierarchyResponse,
  SessionPermissionsResponse,
} from '@/types/auth';
import { consolidatePermissions } from '@/lib/consolidate-permissions';
import { resolveLocationId } from '@/lib/resolve-location';
import { isOrgAdminFromRoles } from '@/lib/org-admin';

/**
 * Single source of truth for the IdP context (organization, location, permissions).
 * Same shape and storage key as payroll-expense-frontend so the apps behave alike.
 */
interface AuthContextState {
  _hasHydrated: boolean;
  sessionReady: boolean;
  organizationId: string | null;
  locationId: string | null;
  organization: Organization | null;
  hierarchy: Hierarchy | null;
  organizationAssignments: OrganizationAssignment[];
  permissions: PermissionRecord;
  roleNames: string[];
  roles: Role[];
  setHasHydrated: (value: boolean) => void;
  setSessionReady: (value: boolean) => void;
  setLocationId: (locationId: string | null) => void;
  clearLocationId: () => void;
  hydrateFromSlimSession: (data: GetSessionResponse) => void;
  hydrateFromPermissions: (data: SessionPermissionsResponse) => void;
  hydrateFromHierarchy: (data: SessionHierarchyResponse) => void;
  resolveAndSetLocation: (opts?: { preferSelected?: boolean }) => void;
  hasPermission: (resource: string, action: string) => boolean;
  clear: () => void;
}

const emptyState = {
  _hasHydrated: false,
  sessionReady: false,
  organizationId: null as string | null,
  locationId: null as string | null,
  organization: null as Organization | null,
  hierarchy: null as Hierarchy | null,
  organizationAssignments: [] as OrganizationAssignment[],
  permissions: {} as PermissionRecord,
  roleNames: [] as string[],
  roles: [] as Role[],
};

function nextLocation(
  state: Pick<AuthContextState, 'locationId' | 'hierarchy' | 'organizationAssignments' | 'roleNames' | 'roles'>,
  preferSelected = true,
): string | null {
  const selected = preferSelected ? state.locationId : null;
  const resolved = resolveLocationId({
    selectedLocationId: selected,
    hierarchy: state.hierarchy,
    organizationAssignments: state.organizationAssignments,
  });
  if (!selected && !resolved && isOrgAdminFromRoles(state.roleNames, state.roles)) {
    return null;
  }
  return resolved;
}

export const useAuthContextStore = create<AuthContextState>()(
  persist(
    (set, get) => ({
      ...emptyState,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      setSessionReady: (value) => set({ sessionReady: value }),
      setLocationId: (locationId) => set({ locationId: locationId?.trim() || null }),
      clearLocationId: () => set({ locationId: null }),
      hydrateFromSlimSession: (data) =>
        set((state) => ({
          organization: data.organization ?? state.organization,
          organizationId: data.activeOrganizationId ?? data.organization?.id ?? state.organizationId,
        })),
      hydrateFromPermissions: (data) => {
        const roles = data.roles ?? [];
        const { permissions, roleNames } = consolidatePermissions(roles);
        set((state) => ({
          permissions: Object.keys(permissions).length ? permissions : state.permissions,
          roleNames: roleNames.length ? roleNames : state.roleNames,
          roles: roles.length ? roles : state.roles,
        }));
      },
      hydrateFromHierarchy: (data) =>
        set((state) => {
          const next = {
            ...state,
            hierarchy: data.hierarchy ?? null,
            organizationAssignments: data.organizationAssignments ?? [],
          };
          return { ...next, locationId: nextLocation(next) };
        }),
      resolveAndSetLocation: (opts) =>
        set((state) => ({ locationId: nextLocation(state, opts?.preferSelected !== false) })),
      hasPermission: (resource, action) => {
        const allowed = get().permissions[resource] ?? [];
        return allowed.includes(action) || allowed.includes('*');
      },
      clear: () => set({ ...emptyState, _hasHydrated: true }),
    }),
    {
      name: 'instanvi-auth-context',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        organizationId: state.organizationId,
        locationId: state.locationId,
        organization: state.organization,
        hierarchy: state.hierarchy,
        organizationAssignments: state.organizationAssignments,
        permissions: state.permissions,
        roleNames: state.roleNames,
        roles: state.roles,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

/** Read locationId outside React (axios interceptor). */
export function getStoredLocationId(): string | null {
  return useAuthContextStore.getState().locationId;
}

/** Read organizationId outside React. */
export function getStoredOrganizationId(): string | null {
  return useAuthContextStore.getState().organizationId;
}
