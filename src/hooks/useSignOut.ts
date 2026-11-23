'use client';

import { useState } from 'react';
import { signOutWithAuthApi } from '@/lib/auth-sign-out';

/**
 * Prefer rendering ConfirmDialog in the UI (see SignOutButton).
 * `signOutWithConfirm` is a no-op flag pattern — use dialog state instead of window.confirm.
 */
export const useSignOut = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return {
    signOut: signOutWithAuthApi,
    confirmOpen,
    setConfirmOpen,
    requestSignOut: () => setConfirmOpen(true),
    confirmSignOut: () => {
      setConfirmOpen(false);
      void signOutWithAuthApi();
    },
  };
};
