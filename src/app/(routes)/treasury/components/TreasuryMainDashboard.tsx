'use client';
import React from 'react';
import { Calendar, TrendingDown, Building, CreditCard } from 'lucide-react';

// Import modular components
import TreasuryHeader from './TreasuryHeader';
import TreasuryMetrics from './TreasuryMetrics';
import CashFlowSummary from './CashFlowSummary';
import LiquidityMetrics from './LiquidityMetrics';
import CashFlowChart from './CashFlowChart';
import AccountsBreakdown from './AccountsBreakdown';
import RecentTransactions from './RecentTransactions';

interface TreasuryMainDashboardProps {
  type?: 'treasury';
}

const TreasuryMainDashboard: React.FC<TreasuryMainDashboardProps> = ({
  type = 'treasury',
}) => {
  // Mock data for Treasury dashboard
  const cashFlowData = {
    totalCash: 2450000,
    cashIn: 1850000,
    cashOut: 1200000,
    netCashFlow: 650000,
    cashFlowPercentage: 35,
  };

  const liquidityMetrics = {
    currentRatio: 2.4,
    quickRatio: 1.8,
    cashRatio: 0.9,
    workingCapital: 1850000,
  };

  const cashFlowChartData = [
    { month: 'Jan', cashIn: 1200000, cashOut: 800000, net: 400000 },
    { month: 'Feb', cashIn: 1400000, cashOut: 900000, net: 500000 },
    { month: 'Mar', cashIn: 1600000, cashOut: 1100000, net: 500000 },
    { month: 'Apr', cashIn: 1800000, cashOut: 1200000, net: 600000 },
    { month: 'May', cashIn: 1700000, cashOut: 1300000, net: 400000 },
    { month: 'Jun', cashIn: 1850000, cashOut: 1200000, net: 650000 },
  ];

  const accountsBreakdown = [
    {
      name: 'Accounts Receivable',
      value: 921294,
      color: '#3B82F6',
      percentage: 37.6,
    },
    {
      name: 'Accounts Payable',
      value: 685000,
      color: '#EF4444',
      percentage: 28.0,
    },
    {
      name: 'Cash & Equivalents',
      value: 2450000,
      color: '#15803d',
      percentage: 100.0,
    },
    {
      name: 'Short-term Investments',
      value: 850000,
      color: '#F59E0B',
      percentage: 34.7,
    },
  ];

  const treasuryMetrics = [
    {
      name: 'Days Cash on Hand',
      value: 45,
      change: '+3',
      trend: 'up' as const,
      icon: Calendar,
    },
    {
      name: 'Cash Conversion Cycle',
      value: 28,
      change: '-2',
      trend: 'down' as const,
      icon: TrendingDown,
    },
    {
      name: 'Debt-to-Equity Ratio',
      value: 0.35,
      change: '-0.05',
      trend: 'down' as const,
      icon: Building,
    },
    {
      name: 'Interest Coverage Ratio',
      value: 8.2,
      change: '+0.3',
      trend: 'up' as const,
      icon: CreditCard,
    },
  ];

  const recentTransactions = [
    {
      id: 'TXN-001',
      type: 'Payment Received',
      amount: 150000,
      party: 'TechCorp Solutions',
      date: '2024-01-15',
      status: 'completed' as const,
    },
    {
      id: 'TXN-002',
      type: 'Vendor Payment',
      amount: -85000,
      party: 'Office Supplies Co.',
      date: '2024-01-14',
      status: 'completed' as const,
    },
    {
      id: 'TXN-003',
      type: 'Investment Maturity',
      amount: 200000,
      party: 'Treasury Bonds',
      date: '2024-01-13',
      status: 'completed' as const,
    },
    {
      id: 'TXN-004',
      type: 'Loan Payment',
      amount: -120000,
      party: 'Business Bank',
      date: '2024-01-12',
      status: 'pending' as const,
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-3 space-y-6">
      {/* Header Section */}
      <TreasuryHeader
        totalCash={cashFlowData.totalCash}
        formatCurrency={formatCurrency}
      />

      {/* Key Metrics Section */}
      <TreasuryMetrics
        metrics={treasuryMetrics}
        formatCurrency={formatCurrency}
      />

      {/* Cash Flow & Liquidity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowSummary data={cashFlowData} formatCurrency={formatCurrency} />
        <LiquidityMetrics
          data={liquidityMetrics}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Cash Flow Chart Section */}
      <CashFlowChart data={cashFlowChartData} formatCurrency={formatCurrency} />

      {/* Accounts Breakdown & Recent Transactions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AccountsBreakdown
          data={accountsBreakdown}
          formatCurrency={formatCurrency}
        />
        <RecentTransactions
          transactions={recentTransactions}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
};

export default TreasuryMainDashboard;
