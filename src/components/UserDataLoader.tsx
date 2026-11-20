'use client';
import { useEffect } from 'react';
import useGetUser from '../app/(routes)/auth/hooks/useGetUser';
import { PageLoader } from '@potta/components/ui/loaders';

interface UserDataLoaderProps {
  children: React.ReactNode;
}

const UserDataLoader: React.FC<UserDataLoaderProps> = ({ children }) => {
    // This will load user data and update context, but only when this component mounts
  const { isLoading, error } = useGetUser();

  useEffect(() => {
    if (error) {
      console.error('Failed to load user data:', error);
    }
  }, [error]);

  // Show loading state while user data is being fetched
  if (isLoading) {
    return <PageLoader />;
  }

  // Once user data is loaded, render children
  return <>{children}</>;
};

export default UserDataLoader;
