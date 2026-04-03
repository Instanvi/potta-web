import { signOut } from 'next-auth/react';

export const useSignOut = () => {
  
  return {
    signOut,
    signOutWithConfirm: () => {
      if (confirm('Are you sure you want to sign out?')) {
        signOut();
      }
    }
  };
}; 