'use client';

import React, { FC, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

const Layout: FC<Props> = ({ children }) => {
  return <div className="relative h-full min-h-0 w-full overflow-hidden">{children}</div>;
};

export default Layout;
