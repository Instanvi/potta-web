'use client';
import React from 'react';
import OverviewMetrics from './TreasuryOverviewMetrics';
import OverviewCharts from './TreasuryOverviewCharts';
import OverviewQuickActions from './TreasuryOverviewQuickActions';
import OverviewSkeleton from './TreasuryOverviewSkeleton';
import AccountReceivablesDashboard from './AccountReceivablesDashboard';
import AccountPayablesDashboard from './AccountPayablesDashboard';
import TreasuryMainDashboard from './TreasuryMainDashboard';
import { useBills } from '../../account_payables/bills/new/hooks/useBills';

interface TreasuryOverviewProps {
  type?: 'ap' | 'ar' | 'treasury'; // 'ap' for Account Payables, 'ar' for Account Receivables, 'treasury' for main treasury
}

const TreasuryOverview: React.FC<TreasuryOverviewProps> = ({ type }) => {
  const { data: billsData, isLoading } = useBills({});
  const bills = billsData?.data || [];

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  // For main Treasury dashboard (default or explicit treasury type)
  if (!type || type === 'treasury') {
    return <TreasuryMainDashboard type="treasury" />;
  }

  // For Account Receivables, use the new dashboard
  if (type === 'ar') {
    return <AccountReceivablesDashboard type={type} />;
  }

  // For Account Payables, use the new dashboard
  if (type === 'ap') {
    return <AccountPayablesDashboard type={type} />;
  }

  // For Account Payables, use the original overview (fallback)
  return (
    <div className="p-3">
      <OverviewMetrics bills={bills} type={type} />
      <OverviewCharts bills={bills} type={type} />
      <OverviewQuickActions bills={bills} type={type} />
    </div>
  );
};

export default TreasuryOverview;
