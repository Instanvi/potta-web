"use client"
import React from 'react';
import AssetFilters from './components/filters';
import AssetTable from './components/table';
import RootLayout from '../../layout';

const AssetsPage = () => {
  return (
    <RootLayout>
      <div className="pl-10 pr-5">
        <div className="p-6">
          <AssetFilters />
          <AssetTable />
        </div>
      </div>
    </RootLayout>
  );
};

export default AssetsPage;
