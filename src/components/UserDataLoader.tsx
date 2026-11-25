'use client';
import { useEffect } from 'react';
import useGetUser from '../app/(routes)/auth/hooks/useGetUser';

interface UserDataLoaderProps {
  children: React.ReactNode;
}

/** Auth bootstrap — no full-page spinner; NextTopLoader covers navigations. */
const UserDataLoader: React.FC<UserDataLoaderProps> = ({ children }) => {
  const { isLoading, error } = useGetUser();

  useEffect(() => {
    if (error) {
      console.error('Failed to load user data:', error);
    }
  }, [error]);

  if (isLoading) {
    return <div className="min-h-screen bg-main-bg" aria-busy="true" aria-live="polite" />;
  }

  return <>{children}</>;
};

export default UserDataLoader;
