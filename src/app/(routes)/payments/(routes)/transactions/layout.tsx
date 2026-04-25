import RootLayout from '@potta/app/(routes)/layout';
import React, { ReactNode } from 'react';

function layout({ children }: { children: ReactNode }) {
  return <RootLayout>{children}</RootLayout>;
}

export default layout;
