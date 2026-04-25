import { signOutWithAuthApi } from '@/lib/auth-sign-out';

export const useSignOut = () => {
  return {
    signOut: signOutWithAuthApi,
    signOutWithConfirm: () => {
      if (confirm('Are you sure you want to sign out?')) {
        void signOutWithAuthApi();
      }
    },
  };
};
