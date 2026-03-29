'use client';

import { SessionProvider } from 'next-auth/react';
import { DataProvider } from './DataProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { HeroUIProvider } from '@heroui/react';
import UserDataLoader from '@potta/components/UserDataLoader';
import { ThreadEventsProvider } from './ThreadEventsProvider';
import { useState } from 'react';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000
      }
    }
  }));

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <DataProvider>
          <ThreadEventsProvider>
            <HeroUIProvider>
              <Toaster position="top-center" />
              <UserDataLoader>
                {children}
              </UserDataLoader>
            </HeroUIProvider>
          </ThreadEventsProvider>
        </DataProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
