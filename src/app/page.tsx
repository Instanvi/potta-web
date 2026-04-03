'use client';
import React, { useContext } from 'react';
import {
  Inbox as InboxIcon,
  Bell,
} from 'lucide-react';

import RootLayout from './(routes)/layout';
import { ContextData } from '@potta/components/providers/DataProvider';

// Refactored Components
import { DashboardHeader } from './component/DashboardHeader';
import { QuickActions } from './component/QuickActions';
import { InboxFeed } from './component/InboxFeed';
import { NotificationFeed } from './component/NotificationFeed';
import { PortfolioGrid } from './component/PortfolioGrid';

const WelcomePage = () => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const context = useContext(ContextData);

  if (!mounted) {
    return (
      <RootLayout>
        <div className={`${context?.layoutMode === 'sidebar' ? 'pl-16' : 'pl-0'} p-6 space-y-8 bg-white min-h-screen animate-pulse`}>
           <div className="w-full h-32 bg-slate-50 rounded-lg"></div>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className={`${context?.layoutMode === 'sidebar' ? 'pl-16' : 'pl-0'} p-6 space-y-8 bg-white min-h-screen`}>
        
        {/* Header & Stats */}
        <DashboardHeader />

        {/* Action Bar */}
        <div className="pb-6 border-b border-slate-100">
          <QuickActions />
        </div>

        {/* Feed Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          <InboxFeed />
          <NotificationFeed />
        </div>

        {/* All Applications Section */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4 px-1">All Applications</h2>
          <PortfolioGrid />
        </section>

      </div>
    </RootLayout>
  );
};

export default WelcomePage;
