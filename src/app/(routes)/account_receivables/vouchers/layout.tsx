'use client';
import React, { FC, ReactNode } from 'react';
import RootLayout from '../../layout';
import NextUiProvider from '@potta/app/(routes)/account_receivables/invoice/components/provider';

interface Props {
  children: ReactNode;
}

const InvoiceLayout: FC<Props> = ({ children }) => {
  //   console.log = () => {};
  return (
    <NextUiProvider>
      <RootLayout>
        <div className="w-full ">
          <div className=" w-full overflow-hidden  relative  p-0 ">
            {children}
          </div>
        </div>
      </RootLayout>
    </NextUiProvider>
  );
};
export default InvoiceLayout;
