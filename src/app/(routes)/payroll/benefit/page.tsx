'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import RootLayout from '../../layout';

// Use dynamic import with ssr: false to ensure the component only renders on the client
const TableBenefit = dynamic(() => import('./components/table'), {
  ssr: false,
});

const Benefit = () => {
  return (
    <RootLayout>
      <TableBenefit />
    </RootLayout>
  );
};

export default Benefit;
