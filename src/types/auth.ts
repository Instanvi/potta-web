export interface PermissionRecord {
  [resource: string]: string[];
}

export interface Role {
  id: string;
  name?: string | null;
  permissions?: PermissionRecord;
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  username?: string | null;
  image?: string | null;
  accessToken?: string;
  refreshToken?: string;
  organization?: Organization;
  hasOrganization?: boolean;
  role?: string;
  roles?: Role[];
  roleNames?: string[];
  hierarchy?: Hierarchy;
  apps?: App[];
  activeApp?: App | null;
  activeAppId?: string | null;
  permissions?: PermissionRecord;
  organizationId?: string;
}

export interface Organization {
  id: string;
  name: string;
  registration_number?: string;
  vat_number?: string;
  region?: string;
  city?: string;
  address?: string;
  phone_number?: string;
  email?: string;
  website?: string;
  description?: string;
  country?: string;
  slug?: string;
  logo?: string | null;
}

export interface Hierarchy {
  assignmentId: string;
  assignmentType: string;
  jobTitle: string | null;
  isActive: boolean;
  location?: { id: string; name: string } | null;
  location_id?: string;
  organizationalStructure?: {
    id: string;
    name: string;
    type?: string;
    level?: number;
    path?: string;
  } | null;
  geographicalUnit?: { id: string; name: string } | null;
  subBusiness?: { id: string; name: string } | null;
  treePosition?: {
    accessControl?: {
      organizationId: string;
      locationId: string | null;
      departmentId: string | null;
      geographicalUnitId: string | null;
      subBusinessId: string | null;
    };
  };
  [key: string]: unknown;
}

export interface OrganizationAssignment {
  id: string;
  assignmentType: string;
  isActive: boolean;
  location: { id: string; name: string } | null;
}

export interface App {
  id: string;
  name?: string;
  status?: string;
  api_key?: string;
  environment?: string;
  appId?: string;
  slug?: string;
  isDefault?: boolean;
  config?: Record<string, unknown> | null;
}

/** Slim POST /get-session (instanvi-auth-starter): identity + active org/app ids only. */
export type GetSessionResponse = {
  session: Record<string, unknown> | null;
  user: User;
  organization: Organization | null;
  activeOrganizationId: string | null;
  activeAppId: string | null;
};

export type SessionPermissionsResponse = {
  roles: Role[];
};

export type SessionHierarchyResponse = {
  hierarchy: Hierarchy | null;
  organizationAssignments: OrganizationAssignment[];
};

export type SessionAppsResponse = {
  apps: App[];
  activeApp: App | null;
  activeAppId: string | null;
};

export type AuthResponse = GetSessionResponse &
  Partial<SessionPermissionsResponse> &
  Partial<SessionHierarchyResponse> &
  Partial<SessionAppsResponse> & {
    accessToken?: string;
    access_token?: string;
    token?: string;
  };

export type AuthSessionResponse = AuthResponse;
