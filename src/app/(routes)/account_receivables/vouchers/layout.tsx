'use client';
import React, { FC, ReactNode } from 'react';
import RootLayout from '../../layout';
import NextUiProvider from '@potta/app/(routes)/account_receivables/invoice/components/provider';

interface Props {
  children: ReactNode;
}

const InvoiceLayout: FC<Props> = ({ children }) => {
  return (
    <NextUiProvider>
      <RootLayout>{children}</RootLayout>
    </NextUiProvider>
  );
};
export default InvoiceLayout;
