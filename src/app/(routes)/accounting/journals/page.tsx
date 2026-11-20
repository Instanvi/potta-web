'use client';
import React from 'react';
import RootLayout from '../../layout';
import TableComponents from './components/table';
import Filter from './components/filters';

const JournalsPage = () => {
  return (
    <RootLayout>
      <div className="pl-10 pr-5">
        <div className="p-6">
          <Filter />
          <TableComponents />
        </div>
      </div>
    </RootLayout>
  );
};

export default JournalsPage;
