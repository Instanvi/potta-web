'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { DataProvider } from '@potta/components/providers/DataProvider';

const AccountReceivablesLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <DataProvider>
        <Toaster position="top-center" />
        <div>{children}</div>
      </DataProvider>
    </QueryClientProvider>
  );
};

export default AccountReceivablesLayout;
