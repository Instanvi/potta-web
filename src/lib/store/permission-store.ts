import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PermissionRecord, Role, Hierarchy, AuthSessionResponse, Organization } from "@/types/auth";
import { consolidatePermissions } from "@/lib/services/permission-agrigator";

interface PermissionState {
  session: AuthSessionResponse | null;
  permissions: PermissionRecord;
  hierarchy: Hierarchy | null;
  organizationId: string | null;
  activeOrganization: Organization | null;
  locationId: string | null;
  assignmentId: string | null;
  departmentId: string | null;
  geoUnitId: string | null;
  subBusinessId: string | null;
  roleNames: string[];
  setSession: (data: AuthSessionResponse | null) => void;
  setPermissions: (permissions: PermissionRecord) => void;
  setPermissionsFromRoles: (roles: Role[]) => void;
  setHierarchy: (hierarchy: Hierarchy | null) => void;
  setOrganization: (org: Organization | null) => void;
  setOrganizationId: (orgId: string | null) => void;
  clearPermissions: () => void;
  hasPermission: (resource: string, action: string) => boolean;
}

export const usePermissionStore = create<PermissionState>()(
  persist(
    (set, get) => ({
      session: null,
      permissions: {},
      hierarchy: null,
      organizationId: null,
      activeOrganization: null,
      locationId: null,
      assignmentId: null,
      departmentId: null,
      geoUnitId: null,
      subBusinessId: null,
      roleNames: [],
      setSession: (data: AuthSessionResponse | null) => {
        if (!data) {
          get().clearPermissions();
          return;
        }

        set({ session: data });

        const { organization, roles, user, hierarchy } = data;

        if (organization) {
          set({
            activeOrganization: organization,
            organizationId: organization.id,
          });
        }

        if (roles) {
          set({
            permissions: consolidatePermissions(roles),
            roleNames: roles.map((r) => r.name),
          });
        } else if (user?.permissions) {
          set({ permissions: user.permissions });
        }

        if (hierarchy) {
          get().setHierarchy(hierarchy);
        }
      },
      setPermissions: (permissions) => set({ permissions }),
      setPermissionsFromRoles: (roles) =>
        set({
          permissions: consolidatePermissions(roles),
          roleNames: roles.map((r) => r.name),
        }),
      setOrganization: (activeOrganization) =>
        set({
          activeOrganization,
          organizationId: activeOrganization?.id || null,
        }),
      setOrganizationId: (organizationId) => set({ organizationId }),
      setHierarchy: (hierarchy) => {
        if (!hierarchy) {
          set({
            hierarchy: null,
            locationId: null,
            assignmentId: null,
            departmentId: null,
            geoUnitId: null,
            subBusinessId: null,
          });
          return;
        }

        const locationId = hierarchy?.location?.id || hierarchy?.location_id || null;
        const assignmentId = hierarchy?.assignmentId || null;
        const departmentId =
          hierarchy?.organization_structure?.id ||
          hierarchy?.organizational_structure_id ||
          null;
        const geoUnitId = 
          hierarchy?.geo_unit?.id || 
          hierarchy?.geographical_unit_id || 
          null;
        const subBusinessId = 
          hierarchy?.sub_business?.id || 
          hierarchy?.sub_business_id || 
          null;

        set({
          hierarchy,
          locationId,
          assignmentId,
          departmentId,
          geoUnitId,
          subBusinessId,
        });
      },
      clearPermissions: () =>
        set({
          session: null,
          permissions: {},
          hierarchy: null,
          organizationId: null,
          activeOrganization: null,
          locationId: null,
          assignmentId: null,
          departmentId: null,
          geoUnitId: null,
          subBusinessId: null,
          roleNames: [],
        }),
      hasPermission: (resource, action) => {
        const permissions = get().permissions;
        if (!permissions) return false;

        const resourcePermissions = permissions[resource] || [];
        return (
          resourcePermissions.includes(action) ||
          resourcePermissions.includes("*")
        );
      },
    }),
    {
      name: "permissions-storage",
    },
  ),
);
