import { useQuery } from '@tanstack/react-query';
import { getMe } from '../api';
import { useContext, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ContextData } from '@potta/components/providers/DataProvider';

interface UserSession {
  expiresAt: string;
  token: string;
  createdAt: string;
  updatedAt: string;
  ipAddress: string;
  userAgent: string;
  userId: string;
  id: string;
}

interface User {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  username: string;
  email: string;
  isEmailVerified: boolean;
  role: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  image: string | null;
  bio: string | null;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  twoFactorBackupCodes: string[] | null;
}

interface Organization {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  slug: string;
  logo: string;
  metadata: {
    industry: string;
  };
}

interface Branch {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  address: string;
  organization: Organization;
}

interface Member {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  userId: string;
  role: {
    id: string;
    name: string;
    organizationId: string;
    branchId: string | null;
    permissions: {
      GROUP: Array<{
        name: string;
        properties: Array<{
          name: string;
          actions: string[];
        }>;
      }>;
      appNAME: string;
    };
  };
  teamId: string | null;
}

interface WhoAmIResponse {
  user: {
    session: UserSession;
    user: User;
    organization: {
      id: string;
      name: string;
      slug: string;
      logo?: string;
      metadata?: {
        industry?: string;
      };
    };
    roles: Array<{
      id: string;
      name: string;
      permissions: any;
    }>;
    hierarchy: {
      position: string;
      organization_structure: any;
      location: {
        id: string;
        location_name: string;
        address: string;
        longitude: string;
        latitude: string;
      };
      department: {
        id: string;
        name: string;
        type: string;
        level: number;
        path: string;
      };
      assignmentType: string;
      isActive: boolean;
      treePosition: any;
    };
    locationContext?: {
      id: string;
      orgId: string;
      locationId: string;
      departmentId: string;
      geoUnitId: string;
      subBusinessId: string;
      hierarchyPath: string;
      locationName: string;
      departmentName: string;
      geoUnitName: string;
      subBusinessName: string;
      contextType: string;
      metadata: any;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
}

// Bypass routes that should not call the whoami endpoint
const BYPASS_AUTH_ROUTES = [
  '/vendor-portal',
  '/vendor-portal/kyc/verify',
  '/vendor-portal/rfqs',
  // Add more routes here as needed
];

const useGetUser = () => {
  const context = useContext(ContextData);
  const hasUpdatedContext = useRef(false);
  const pathname = usePathname();

  // Check if we're in dev mode
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

  // Check if we're on a bypass route
  const isBypassRoute = pathname
    ? BYPASS_AUTH_ROUTES.some((route) => pathname.includes(route))
    : false;

  // Check if we're on organigram page (special case - no whoami calls)
  const isOrganigramPage = pathname ? pathname.includes('/organigram') : false;

  const { data, isLoading, error } = useQuery({
    queryKey: ['whoami'],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    enabled: !devMode && !isBypassRoute && !isOrganigramPage, // Disable the query in dev mode, on bypass routes, and on organigram page
  });

  // Update context with user information when data is available
  useEffect(() => {
    if (
      (devMode || isBypassRoute || isOrganigramPage) &&
      context &&
      !hasUpdatedContext.current
    ) {
      // In dev mode, on bypass routes, or on organigram page, provide dummy data
      console.log(
        `useGetUser: ${
          devMode
            ? 'DEV MODE'
            : isBypassRoute
            ? 'BYPASS ROUTE'
            : 'ORGANIGRAM PAGE'
        } active – providing dummy user data`
      );

      const dummyCompanyInfo = {
        // Company/Organization Information
        companyName: 'Instanvi Inc',
        companyEmail: 'dev@instanvi.com',
        companyAddress: 'Quartre-etage, bonaberi, Douala',
        companyPhone: '+237 123 456 789',
        companyLogo: 'https://instanvi.com/logo.png',

        // User Information
        userFirstName: 'Dev',
        userLastName: 'User',
        userEmail: 'dev@instanvi.com',
        userRole: 'developer',
        userUsername: 'devuser',
        userPhone: '+237 123 456 789',
        userImage: null,
        userBio: 'Development user',
        userIsEmailVerified: true,
        userTwoFactorEnabled: false,

        // Branch Information
        branchName: 'Headquarters',
        branchAddress: 'Quartre-etage, bonaberi, Douala',
        branchId: 'dev-branch-id',

        // Organization Information
        organizationName: 'Instanvi Inc',
        organizationSlug: 'instanvi-inc',
        organizationLogo: 'https://instanvi.com/logo.png',
        organizationIndustry: 'Tech',
        organizationId: 'e2a76342-c606-4604-abf1-39f52583b311', // Real org ID from whoami

        // Session Information
        sessionToken: 'dev-session-token',
        sessionExpiresAt: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        sessionUserId: 'dev-user-id',

        // User Permissions (dummy permissions)
        userPermissions: [
          {
            roleName: 'Developer',
            roleId: 'dev-role-id',
            permissions: {
              GROUP: [
                {
                  name: 'General',
                  properties: [
                    {
                      name: 'invoices',
                      actions: ['create', 'read', 'update', 'delete'],
                    },
                    {
                      name: 'customers',
                      actions: ['create', 'read', 'update', 'delete'],
                    },
                  ],
                },
              ],
              appNAME: 'potta',
            },
            teamId: 'dev-team-id',
          },
        ],

        // Full user data for advanced usage
        fullUserData: {
          session: {
            token: 'dev-session-token',
            expiresAt: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            userId: 'dev-user-id',
          },
          user: {
            firstName: 'Dev',
            lastName: 'User',
            email: 'dev@instanvi.com',
            role: 'developer',
          },
          branch: {
            name: 'Headquarters',
            address: 'Quartre-etage, bonaberi, Douala',
            organization: {
              name: 'Instanvi Inc',
              logo: 'https://instanvi.com/logo.png',
            },
          },
          hierarchy: {
            location: {
              id: '1ebff621-ee8b-48c9-97df-d724e8e950e9', // Real location ID from whoami
              city: 'Douala',
              state: 'Littoral',
              country: 'Cameroon',
              address: '123 Main Street, Douala',
            },
            department: {
              id: '00fac61d-b006-4c7e-9d6f-fde2de58a87d', // Real department ID from whoami
              name: 'Executive',
            },
          },
          members: [],
          // Add locationContext for dummy data
          locationContextId: {
            id: '861e7b4e-fd9c-45cd-b7e5-80faec551c54',
            orgId: 'e2a76342-c606-4604-abf1-39f52583b311',
            locationId: '1ebff621-ee8b-48c9-97df-d724e8e950e9',
            departmentId: '00fac61d-b006-4c7e-9d6f-fde2de58a87d',
            geoUnitId: '3cf38e02-aab8-4068-8067-1f3f7c0c32ed',
            subBusinessId: '6293ac2b-18e8-4a13-936b-b629694b5e0d',
            hierarchyPath: 'L.D.G.B',
            locationName: 'Instanvi Headquarters',
            departmentName: 'Executive',
            geoUnitName: 'Littoral Region',
            subBusinessName: 'Core Technology',
            contextType: 'PRIMARY',
            metadata: {
              userPosition: 'Chief Executive Officer',
              assignmentType: 'PRIMARY',
            },
            isActive: true,
            createdAt: '2025-10-03T14:59:26.705Z',
            updatedAt: '2025-10-03T14:59:26.705Z',
          },
        },
      };

      // Update context with dummy user data
      context.setData((prevData: any) => {
        const newData = {
          ...prevData,
          ...dummyCompanyInfo,
        };
        console.log('Updated context with dummy user data:', newData);
        console.log('Hierarchy in context:', newData.fullUserData?.hierarchy);
        return newData;
      });

      hasUpdatedContext.current = true;
    } else if (data && context && !hasUpdatedContext.current) {
      const userData = data as WhoAmIResponse;

      // Extract comprehensive company and user information from the user data
      const companyInfo = {
        // Company/Organization Information
        companyName: userData.user.organization?.name || 'Unknown Company',
        companyEmail: userData.user.user?.email || 'No email',
        companyAddress:
          userData.user.hierarchy?.location?.address || 'No address',
        companyPhone: userData.user.user?.phone || 'No phone',
        companyLogo: userData.user.organization?.logo || null,

        // User Information
        userFirstName: userData.user.user?.firstName || 'Unknown',
        userLastName: userData.user.user?.lastName || 'User',
        userEmail: userData.user.user?.email || 'No email',
        userRole: userData.user.user?.role || 'user',
        userUsername: userData.user.user?.username || 'unknown',
        userPhone: userData.user.user?.phone || null,
        userImage: userData.user.user?.image || null,
        userBio: userData.user.user?.bio || null,
        userIsEmailVerified: userData.user.user?.isEmailVerified || false,
        userTwoFactorEnabled: userData.user.user?.twoFactorEnabled || false,

        // Branch Information (from hierarchy)
        branchName:
          userData.user.hierarchy?.department?.name || 'Unknown Department',
        branchAddress:
          userData.user.hierarchy?.location?.address || 'No address',
        branchId: userData.user.hierarchy?.department?.id || null,

        // Organization Information
        organizationName:
          userData.user.organization?.name || 'Unknown Organization',
        organizationSlug: userData.user.organization?.slug || 'unknown',
        organizationLogo: userData.user.organization?.logo || null,
        organizationIndustry:
          userData.user.organization?.metadata?.industry || null,
        organizationId: userData.user.organization?.id || null,

        // Session Information
        sessionToken: userData.user.session?.token || null,
        sessionExpiresAt: userData.user.session?.expiresAt || null,
        sessionUserId: userData.user.session?.userId || null,

        // User Permissions (from roles array)
        userPermissions:
          userData.user.roles?.map((role) => ({
            roleName: role.name,
            roleId: role.id,
            permissions: role.permissions || {},
            teamId: null,
          })) || [],

        // Full user data for advanced usage
        fullUserData: {
          ...userData.user,
          // Add location information if available
          hierarchy: userData.user.hierarchy
            ? {
                ...userData.user.hierarchy,
                location: {
                  ...userData.user.hierarchy.location,
                  city:
                    userData.user.hierarchy.location?.location_name ||
                    'Default City',
                },
              }
            : {
                location: {
                  id:
                    (userData.user as any).locationContext?.locationId ||
                    'default-location-id',
                  city:
                    (userData.user as any).locationContext?.locationName ||
                    'Default City',
                  state: 'Default State',
                  country: 'Default Country',
                  address:
                    (userData.user as any).locationContext?.locationName ||
                    'Default Address',
                },
                department: {
                  id:
                    (userData.user as any).locationContext?.departmentId ||
                    'default-department-id',
                  name:
                    (userData.user as any).locationContext?.departmentName ||
                    'Default Department',
                },
              },
          // Add locationContext from who am i response
          locationContextId: userData.user.locationContext || null,
        },
      };

      // Update context with user/company information
      context.setData((prevData: any) => {
        const newData = {
          ...prevData,
          ...companyInfo,
        };
        console.log('Updated context with user data:', newData);
        console.log('Hierarchy in context:', newData.fullUserData?.hierarchy);
        return newData;
      });

      // Mark that we've updated the context
      hasUpdatedContext.current = true;
    }
  }, [data, devMode, isBypassRoute, isOrganigramPage]); // Remove context from dependencies to prevent infinite loop

  console.log('Context:', context?.data);
  console.log('Hierarchy in context:', context?.data?.fullUserData?.hierarchy);

  return {
    data:
      devMode || isBypassRoute || isOrganigramPage
        ? undefined
        : (data as WhoAmIResponse | undefined),
    isLoading: devMode || isBypassRoute || isOrganigramPage ? false : isLoading,
    error: devMode || isBypassRoute || isOrganigramPage ? null : error,
  };
};

export default useGetUser;
