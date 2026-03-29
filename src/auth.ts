import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
import { User, Role, AuthResponse } from "./types/auth";
import axios from "axios";

const pruneData = (data: unknown) => {
  if (!data) return data;
  const pruned = JSON.parse(JSON.stringify(data));
  const removeKeys = ["createdAt", "updatedAt", "deletedAt", "emailVerified", "banned", "banReason", "banExpires", "is_active", "isActive"];
  
  const traverse = (obj: unknown) => {
    if (Array.isArray(obj)) {
      obj.forEach(traverse);
    } else if (obj && typeof obj === "object") {
      const record = obj as Record<string, unknown>;
      removeKeys.forEach(key => delete record[key]);
      Object.values(record).forEach(traverse);
    }
  };
  
  traverse(pruned);
  return pruned;
};

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Credentials({
      id: "session-sync",
      name: "Session Sync",
      credentials: {
        token: { label: "Token", type: "text" },
        organizationId: { label: "Organization ID", type: "text" },
        userJSON: { label: "User JSON", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null;

        try {
          let userFromLogin: User | undefined;
          let resData: AuthResponse | null = null;
          const accessToken = credentials.token as string;

          // Optimization: If user info was passed in the secure payload, use it directly
          if (credentials.userJSON) {
            try {
              resData = JSON.parse(credentials.userJSON as string) as AuthResponse;
              userFromLogin = resData?.user;
            } catch (e) {
              console.error("Failed to parse userJSON:", e);
            }
          }

          // Fallback to fetch session if user info is missing
          if (!userFromLogin) {
            const authApiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://10.32.205.91:3000/api";
            const userResponse = await axios.post(
              `${authApiUrl}/get-session`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${credentials.token}`,
                },
              },
            );

            resData = (userResponse.data.data || userResponse.data) as AuthResponse;
            userFromLogin = resData?.user;
          }

          if (!userFromLogin) {
            return null;
          }

          // Map data using the verified response structure
          const organization = resData?.organization;
          const roles = resData?.roles || userFromLogin?.roles || [];
          
          // Ensure roles are unique by ID
          const uniqueRoles = Array.from(
            new Map(roles.map((r) => [r.id, r])).values()
          );

          const roleNames: string[] = [];
          const permissions: Record<string, string[]> = {};
          
          uniqueRoles.forEach(role => {
            if (role.name) roleNames.push(role.name);
            const rolePerms = role.permissions;
            if (rolePerms && typeof rolePerms === "object") {
              Object.entries(rolePerms).forEach(([resource, actions]) => {
                const actionsArray = Array.isArray(actions) ? actions : [];
                if (actionsArray.length > 0) {
                  if (!permissions[resource]) permissions[resource] = [];
                  permissions[resource] = Array.from(new Set([...permissions[resource], ...actionsArray]));
                }
              });
            }
          });

          const user: User = {
            id: userFromLogin.id,
            email: userFromLogin.email,
            name: userFromLogin.name || userFromLogin.username || userFromLogin.email,
            image: userFromLogin.image,
            accessToken: accessToken,
            api_user: (userFromLogin as any).api_user,
            api_password: (userFromLogin as any).api_password,
            organization: pruneData(organization) || (userFromLogin as any).organization,
            role: userFromLogin.role,
            roles: uniqueRoles.map(r => ({ id: r.id, name: r.name })),
            roleNames,
            permissions,
            hierarchy: pruneData(resData?.hierarchy),
            apps: (resData?.apps || []).map(a => ({ id: a.id, name: a.name, environment: a.environment })),
            activeApp: resData?.activeApp ? { id: resData.activeApp.id, name: resData.activeApp.name, environment: resData.activeApp.environment } : null,
            activeAppId: resData?.activeAppId,
            hasOrganization: userFromLogin.hasOrganization,
          };

          return user;
        } catch (error) {
          console.error("Session sync error in potta during authorize:", error);
          return null;
        }
      },
    }),
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;

        try {
          const authApiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://10.32.205.91:3000/api";
          const loginResponse = await axios.post(`${authApiUrl}/auth/sign-in`, {
            email,
            password,
          });

          const loginData = loginResponse.data.data as AuthResponse;

          const userFromLogin = loginData?.user;
          const accessToken =
            loginData?.access_token ||
            loginData?.session?.token ||
            loginData?.token ||
            loginData?.accessToken;

          if (!accessToken || !userFromLogin) {
            throw new Error("Access token or user not found in login response");
          }

          const roles = loginData.roles || userFromLogin?.roles || [];
          const uniqueRoles = Array.from(
            new Map(roles.map((r: Role) => [r.id, r])).values(),
          );

          const roleNames: string[] = [];
          const permissions: Record<string, string[]> = {};
          
          uniqueRoles.forEach(role => {
            if (role.name) roleNames.push(role.name);
            const rolePerms = role.permissions;
            if (rolePerms && typeof rolePerms === "object") {
              Object.entries(rolePerms).forEach(([resource, actions]) => {
                const actionsArray = Array.isArray(actions) ? actions : [];
                if (actionsArray.length > 0) {
                  if (!permissions[resource]) permissions[resource] = [];
                  permissions[resource] = Array.from(new Set([...permissions[resource], ...actionsArray]));
                }
              });
            }
          });

          const user: User = {
            id: userFromLogin.id,
            email: userFromLogin.email,
            name: userFromLogin.name || userFromLogin.username || userFromLogin.email,
            image: userFromLogin.image,
            accessToken: accessToken,
            api_user: (userFromLogin as any).api_user,
            api_password: (userFromLogin as any).api_password,
            organization: pruneData(userFromLogin.organization),
            role: userFromLogin.role,
            hasOrganization: userFromLogin.hasOrganization,
            roles: uniqueRoles.map(r => ({ id: r.id, name: r.name })),
            roleNames,
            permissions,
            hierarchy: pruneData(loginData.hierarchy),
            apps: (loginData.apps || []).map(a => ({ id: a.id, name: a.name, environment: a.environment })),
            activeApp: loginData.activeApp ? { id: loginData.activeApp.id, name: loginData.activeApp.name, environment: loginData.activeApp.environment } : null,
            activeAppId: loginData.activeAppId,
          };

          return user;
        } catch (error) {
          console.error("Sign-in error in potta:", error);
          return null;
        }
      },
    }),
  ],
});
