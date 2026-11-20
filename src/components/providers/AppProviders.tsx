'use client';

import { SessionProvider } from 'next-auth/react';
import { DataProvider } from './DataProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { HeroUIProvider } from '@heroui/react';
import { SessionTokenSync } from '@potta/components/auth/session-token-sync';
import { AuthContextHydrator } from '@potta/components/auth/auth-context-hydrator';
import { useState } from 'react';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <SessionTokenSync />
      <AuthContextHydrator />
      <QueryClientProvider client={queryClient}>
        <DataProvider>
          <HeroUIProvider>
            <Toaster position="top-center" richColors closeButton />
            {children}
          </HeroUIProvider>
        </DataProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
