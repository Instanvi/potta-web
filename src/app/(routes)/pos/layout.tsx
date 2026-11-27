'use client';
import React, { FC, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

const POSLayout: FC<Props> = ({ children }) => {
  return (
    <div className="w-full h-screen overflow-hidden">
      <div className="w-full h-screen">
        <div className="h-[100vh] w-full overflow-hidden relative p-0">
          {children}
        </div>
      </div>
    </div>
  );
};
export default POSLayout;
