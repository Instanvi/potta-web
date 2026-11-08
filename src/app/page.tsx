'use client';
import React, { useContext } from 'react';
import RootLayout from './(routes)/layout';
import { ContextData } from '@potta/components/providers/DataProvider';

// Refactored Components
import { DashboardHeader } from './component/DashboardHeader';
import { QuickActions } from './component/QuickActions';
import { PortfolioGrid } from './component/PortfolioGrid';
import { NotificationFeed } from './component/NotificationFeed';
import { HomeSkeleton } from './component/HomeSkeleton';

const WelcomePage = () => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const context = useContext(ContextData);

  if (!mounted) {
    return (
      <RootLayout>
        <div className={`${context?.layoutMode === 'sidebar' ? 'pl-16' : 'pl-0'} min-h-full bg-white p-6`}>
          <HomeSkeleton />
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className={`${context?.layoutMode === 'sidebar' ? 'pl-16' : 'pl-0'} min-h-full space-y-8 bg-white p-6`}>
        
        {/* Header & Stats */}
        <DashboardHeader />

        {/* Action Bar */}
        <div className="pb-6 border-b border-slate-100">
          <QuickActions />
        </div>

        <NotificationFeed />

        {/* All Applications Section */}
        <section>
          <h2 className="mb-4 px-1 text-lg text-black">Applications</h2>
          <PortfolioGrid />
        </section>

      </div>
    </RootLayout>
  );
};

export default WelcomePage;
