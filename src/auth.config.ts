import type { NextAuthConfig, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { Role, PermissionRecord, Hierarchy, App, User } from "./types/auth";

const consolidatePermissions = (roles: Role[] = []): { 
  permissions: PermissionRecord;
  roleNames: string[];
} => {
  const permissions: PermissionRecord = {};
  const roleNames: string[] = [];

  roles.forEach((role) => {
    roleNames.push(role.name);
    if (role.permissions) {
      Object.entries(role.permissions).forEach(([resource, actions]) => {
        if (Array.isArray(actions)) {
          if (!permissions[resource]) {
            permissions[resource] = [];
          }
          permissions[resource] = Array.from(
            new Set([...permissions[resource], ...actions]),
          );
        }
      });
    }
  });

  return { permissions, roleNames };
};

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }: { token: JWT; user?: any; trigger?: string; session?: any }) {
      if (
        trigger === "update" &&
        session &&
        typeof session === "object" &&
        "activeApp" in session
      ) {
        token.activeApp = session.activeApp;
      }

      if (user) {
        // Use pre-calculated permissions/roleNames if available
        const hasPermissions = user.permissions && Object.keys(user.permissions).length > 0;
        const consolidated = hasPermissions && user.roleNames 
          ? { permissions: user.permissions as PermissionRecord, roleNames: user.roleNames }
          : consolidatePermissions(user.roles as Role[]);
        
        const { permissions, roleNames } = consolidated;
        token.id = user.id;
        token.username = user.username;
        token.accessToken = user.accessToken;
        token.api_user = user.api_user;
        token.api_password = user.api_password;
        token.organization = user.organization;
        token.role = user.role;
        token.roles = user.roles;
        token.hierarchy = user.hierarchy;
        token.apps = user.apps;
        token.activeApp = user.activeApp;
        token.activeAppId = user.activeAppId;
        token.roleNames = roleNames;
        token.permissions = permissions;
        token.hasOrganization = user.hasOrganization;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).username = token.username;
        (session.user as any).api_user = token.api_user;
        (session.user as any).api_password = token.api_password;
        (session.user as any).organization = token.organization;
        (session.user as any).apps = token.apps;
        (session.user as any).activeApp = token.activeApp;
        (session.user as any).activeAppId = token.activeAppId;
        (session.user as any).role = token.role;
        (session.user as any).roles = token.roles;
        (session.user as any).roleNames = token.roleNames;
        (session.user as any).permissions = token.permissions;
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).hasOrganization = token.hasOrganization;
        (session.user as any).hierarchy = token.hierarchy;

        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  providers: [],
};
