'use client';
import React from 'react';
import RootLayout from '../../layout';
import APMainDashboard from '../components/APMainDashboard';
import { ContextData } from '@potta/components/providers/DataProvider';

const APDashboardPage = () => {
  const context = React.useContext(ContextData);

  return (
    <RootLayout>
      <div
        className={`${
          context?.layoutMode === 'sidebar' ? 'pl-16' : 'pl-5'
        } bg-gray-50 min-h-[92vh] pr-5 w-full pt-6`}
      >
        <APMainDashboard type="ap" />
      </div>
    </RootLayout>
  );
};

export default APDashboardPage;
