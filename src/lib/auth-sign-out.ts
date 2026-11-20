"use client";

import { signOut as nextAuthSignOut } from "next-auth/react";
import { authService } from "@/lib/services/auth";
import { usePermissionStore } from "@/lib/store/permission-store";

/**
 * 1) POST to the auth API `/auth/sign-out` (server session invalidation).
 * 2) Reset permission store (persisted org/session/permissions).
 * 3) Then NextAuth.js `signOut` (clear client session / cookies).
 */
export async function signOutWithAuthApi(
  options?: Parameters<typeof nextAuthSignOut>[0],
) {
  try {
    await authService.logout();
  } catch {
    // Still clear local session if the auth API is unreachable
  }
  usePermissionStore.getState().clearPermissions();
  await nextAuthSignOut(options);
}
