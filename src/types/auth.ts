export interface PermissionRecord {
  [resource: string]: string[];
}

export interface Role {
  id: string;
  name: string;
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
  api_user?: string;
  api_password?: string;
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
}

export interface Hierarchy {
  assignmentId: string;
  assignmentType: string;
  jobTitle: string;
  isActive: boolean;
  location?: {
    id: string;
    name: string;
  };
  organization_structure?: {
    id: string;
    department_name: string;
    structure_type: string;
    level: number;
    path: string;
  };
  [key: string]: unknown;
}

export interface App {
  id: string;
  name: string;
  status?: string;
  api_key?: string;
  environment?: "PROD" | "SANDBOX" | "ADMIN";
}

export interface AuthResponse {
  session?: {
    id: string;
    token: string;
    userId: string;
    activeOrganizationId: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
    ipAddress?: string;
    userAgent?: string;
  };
  user: User;
  organization?: Organization;
  roles?: Role[];
  hierarchy?: Hierarchy;
  accessToken?: string;
  access_token?: string;
  token?: string;
  apps?: App[];
  activeApp?: App | null;
  activeAppId?: string | null;
}

export interface SignInPayload {
  email: string;
  password?: string;
  callbackUrl?: string;
}

export interface SignUpPayload {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

export interface VerifyEmailPayload {
  token: string;
}
