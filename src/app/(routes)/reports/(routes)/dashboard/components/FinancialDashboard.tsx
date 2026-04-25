'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@potta/components/card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  PiggyBank,
} from 'lucide-react';
import { pottaAnalyticsService } from '../../../../../../services/analyticsService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface FinancialDashboardProps {
  timeGranularity: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  timeGranularity,
}) => {
  const [cashFlowMetrics, setCashFlowMetrics] = React.useState([
    {
      title: 'Opening Cash Balance',
      value: '$0',
      trend: '0% vs Plan',
      isPositive: true,
      icon: DollarSign,
    },
    {
      title: 'Closing Cash Balance',
      value: '$0',
      trend: '0% vs Plan',
      isPositive: true,
      icon: DollarSign,
    },
    {
      title: 'Operating Runway',
      value: '0 months',
      trend: '0% vs Plan',
      isPositive: true,
      icon: TrendingDown,
    },
  ]);

  const [balanceSheetMetrics, setBalanceSheetMetrics] = React.useState([
    {
      title: 'Cash and Equivalents',
      value: '$0',
      trend: '0% vs Plan',
      isPositive: true,
      icon: DollarSign,
    },
    {
      title: 'Total Assets',
      value: '$0',
      trend: '0% vs Plan',
      isPositive: true,
      icon: Building2,
    },
    {
      title: 'Total Equity',
      value: '$0',
      trend: '0% vs Plan',
      isPositive: true,
      icon: PiggyBank,
    },
  ]);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [incomeStatementData, setIncomeStatementData] = React.useState([
    {
      item: 'Revenue',
      actuals: 0,
      budget: 0.077, // 46.6m USD = ~77k FCFA (assuming 1 USD = 600 FCFA)
      variance: 0,
      variancePercent: 0.0,
      isNegative: false,
    },
    {
      item: 'Cost of Sales',
      actuals: 0,
      budget: 0.02, // 11.8m USD = ~20k FCFA
      variance: 0,
      variancePercent: 0.0,
      isNegative: false,
    },
    {
      item: 'Gross Profit',
      actuals: 0,
      budget: 0.058, // 34.8m USD = ~58k FCFA
      variance: 0,
      variancePercent: 0.0,
      isNegative: false,
    },
    {
      item: 'Total Expenses',
      actuals: 0,
      budget: 0.037, // 22.1m USD = ~37k FCFA
      variance: 0,
      variancePercent: 0.0,
      isNegative: false,
      subItems: [
        {
          item: 'R&D',
          actuals: 0,
          budget: 0.009, // 5.2m USD = ~9k FCFA
          variance: 0,
          variancePercent: 0.0,
          isNegative: false,
        },
        {
          item: 'S&M',
          actuals: 0,
          budget: 0.01, // 5.7m USD = ~10k FCFA
          variance: 0,
          variancePercent: 0.0,
          isNegative: false,
        },
        {
          item: 'G&A',
          actuals: 0,
          budget: 0.019, // 11.2m USD = ~19k FCFA
          variance: 0,
          variancePercent: 0.0,
          isNegative: false,
        },
      ],
    },
    {
      item: 'EBITDA',
      actuals: 0,
      budget: 0.021, // 12.7m USD = ~21k FCFA
      variance: 0,
      variancePercent: 0.0,
      isNegative: false,
    },
    {
      item: 'Depreciation and Amortization',
      actuals: 0,
      budget: 0.0004, // 261k USD = ~0.4k FCFA
      variance: 0,
      variancePercent: 0.0,
      isNegative: false,
    },
  ]);

  const [opexData, setOpexData] = React.useState({
    labels: ['Payroll', 'Advertising', 'Software & IT', 'Office Expenses'],
    datasets: [
      {
        data: [0, 0, 0, 0],
        backgroundColor: ['#3b82f6', '#14b8a6', '#eab308', '#22c55e'],
        borderColor: ['#3b82f6', '#14b8a6', '#eab308', '#22c55e'],
        borderWidth: 1,
      },
    ],
  });

  const [cashflowBridgeData, setCashflowBridgeData] = React.useState({
    labels: ['Opening', 'Revenue', 'COGS', 'OPEX', 'Other', 'Closing'],
    datasets: [
      {
        label: 'Cashflow Bridge',
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: [
          '#3b82f6', // Opening - Blue
          '#22c55e', // Revenue - Green
          '#ef4444', // COGS - Red
          '#ef4444', // OPEX - Red
          '#ef4444', // Other - Red
          '#3b82f6', // Closing - Blue
        ],
        borderColor: [
          '#3b82f6',
          '#22c55e',
          '#ef4444',
          '#ef4444',
          '#ef4444',
          '#3b82f6',
        ],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend for cleaner waterfall look
      },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.parsed.y;
            return `${context.label}: ${value >= 0 ? '+' : ''}${Math.abs(
              value
            ).toLocaleString()} FCFA`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { weight: 500, size: 12 } },
      },
      y: {
        grid: { color: '#f3f4f6' },
        ticks: {
          color: '#6b7280',
          font: { weight: 500, size: 12 },
          callback: function (value: any) {
            return `${value.toLocaleString()} FCFA`;
          },
        },
        beginAtZero: false,
        min: 0, // Start from 0 FCFA
        max: 10000, // Go up to 10,000 FCFA for better waterfall visualization
      },
    },
    elements: {
      bar: {
        borderWidth: 0,
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#6b7280',
          font: { weight: 500, size: 12 },
        },
      },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.parsed;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${
              context.label
            }: ${value.toLocaleString()} FCFA (${percentage}%)`;
          },
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    },
  };

  const formatCurrency = (value: number) => {
    if (value >= 1) {
      return `${value.toFixed(1)}m FCFA`;
    } else if (value >= 0.001) {
      return `${(value * 1000).toFixed(0)}k FCFA`;
    } else {
      return `${(value * 1000000).toFixed(0)} FCFA`;
    }
  };

  // Fetch financial data from Finance API
  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Starting to fetch financial data...');

      // Fetch revenue data
      const revenueData = await pottaAnalyticsService.finance.getAnalytics(
        'revenue',
        {
          metrics: ['total_revenue'],
          dimensions: ['time'],
          time_granularity: timeGranularity,
          use_mock_data: true,
        }
      );

      // Fetch COGS data
      const cogsData = await pottaAnalyticsService.finance.getAnalytics(
        'cogs',
        {
          metrics: ['total_cost'],
          dimensions: ['time'],
          time_granularity: timeGranularity,
          use_mock_data: true,
        }
      );

      // Fetch OPEX data
      const opexData = await pottaAnalyticsService.finance.getAnalytics(
        'opex',
        {
          metrics: ['total_opex_amount'],
          dimensions: ['time'],
          time_granularity: timeGranularity,
          use_mock_data: true,
        }
      );

      // Fetch net income data
      const netIncomeData = await pottaAnalyticsService.finance.getAnalytics(
        'net_income',
        {
          metrics: ['net_income_after_tax'],
          dimensions: ['time'],
          time_granularity: timeGranularity,
          use_mock_data: true,
        }
      );

      // Fetch cash equivalent data
      console.log('🔍 Fetching cash equivalent data...');
      const cashData = await pottaAnalyticsService.finance.getAnalytics(
        'cash_equivalent',
        {
          metrics: ['cumulative_balance'],
          dimensions: ['time'],
          time_granularity: timeGranularity,
          use_mock_data: true,
        }
      );
      console.log('💰 Cash equivalent API response:', cashData);

      // Fetch AR balance data
      const arData = await pottaAnalyticsService.finance.getAnalytics(
        'ar_balance',
        {
          metrics: ['customer_running_balance'],
          dimensions: ['time'],
          time_granularity: timeGranularity,
          use_mock_data: true,
        }
      );

      // Fetch AP balance data
      const apData = await pottaAnalyticsService.finance.getAnalytics(
        'ap_balance',
        {
          metrics: ['vendor_running_balance'],
          dimensions: ['time'],
          time_granularity: timeGranularity,
          use_mock_data: true,
        }
      );

      // Process and update metrics with real data
      if (revenueData.data && revenueData.data.length > 0) {
        const currentRevenue =
          revenueData.data[revenueData.data.length - 1]?.total_revenue || 0;
        const previousRevenue =
          revenueData.data[revenueData.data.length - 2]?.total_revenue ||
          currentRevenue;
        const revenueTrend =
          previousRevenue > 0
            ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
            : 0;

        // Update income statement data
        setIncomeStatementData((prev) =>
          prev.map((item) =>
            item.item === 'Revenue'
              ? {
                  ...item,
                  actuals: currentRevenue / 1000000,
                  variance: currentRevenue / 1000000 - item.budget,
                  variancePercent:
                    item.budget > 0
                      ? ((currentRevenue / 1000000 - item.budget) /
                          item.budget) *
                        100
                      : 0,
                  isNegative: currentRevenue / 1000000 < item.budget,
                }
              : item
          )
        );
      }

      if (cogsData.data && cogsData.data.length > 0) {
        const currentCogs =
          cogsData.data[cogsData.data.length - 1]?.total_cost || 0;
        const previousCogs =
          cogsData.data[cogsData.data.length - 2]?.total_cost || currentCogs;
        const cogsTrend =
          previousCogs > 0
            ? ((currentCogs - previousCogs) / previousCogs) * 100
            : 0;

        setIncomeStatementData((prev) =>
          prev.map((item) =>
            item.item === 'Cost of Sales'
              ? {
                  ...item,
                  actuals: currentCogs / 1000000,
                  variance: currentCogs / 1000000 - item.budget,
                  variancePercent:
                    item.budget > 0
                      ? ((currentCogs / 1000000 - item.budget) / item.budget) *
                        100
                      : 0,
                  isNegative: currentCogs / 1000000 > item.budget,
                }
              : item
          )
        );

        // Calculate and update Gross Profit after both Revenue and COGS are available
        if (revenueData.data && revenueData.data.length > 0) {
          const currentRevenue =
            revenueData.data[revenueData.data.length - 1]?.total_revenue || 0;
          const currentCogs =
            cogsData.data[cogsData.data.length - 1]?.total_cost || 0;
          const grossProfit = (currentRevenue - currentCogs) / 1000000;

          setIncomeStatementData((prev) =>
            prev.map((item) =>
              item.item === 'Gross Profit'
                ? {
                    ...item,
                    actuals: grossProfit,
                    variance: grossProfit - item.budget,
                    variancePercent:
                      item.budget > 0
                        ? ((grossProfit - item.budget) / item.budget) * 100
                        : 0,
                    isNegative: grossProfit < item.budget,
                  }
                : item
            )
          );
        }
      }

      if (opexData.data && opexData.data.length > 0) {
        const currentOpex =
          opexData.data[opexData.data.length - 1]?.total_opex_amount || 0;
        const previousOpex =
          opexData.data[opexData.data.length - 2]?.total_opex_amount ||
          currentOpex;
        const opexTrend =
          previousOpex > 0
            ? ((currentOpex - previousOpex) / previousOpex) * 100
            : 0;

        setIncomeStatementData((prev) =>
          prev.map((item) =>
            item.item === 'Total Expenses'
              ? {
                  ...item,
                  actuals: currentOpex / 1000000,
                  variance: currentOpex / 1000000 - item.budget,
                  variancePercent:
                    item.budget > 0
                      ? ((currentOpex / 1000000 - item.budget) / item.budget) *
                        100
                      : 0,
                  isNegative: currentOpex / 1000000 > item.budget,
                }
              : item
          )
        );

        // Update OPEX sub-items with real data
        setIncomeStatementData((prev) =>
          prev.map((item) =>
            item.item === 'Total Expenses'
              ? {
                  ...item,
                  subItems: item.subItems?.map((subItem) => {
                    if (subItem.item === 'R&D') {
                      const rndAmount = (currentOpex * 0.4) / 1000000;
                      return {
                        ...subItem,
                        actuals: rndAmount,
                        variance: rndAmount - subItem.budget,
                        variancePercent:
                          subItem.budget > 0
                            ? ((rndAmount - subItem.budget) / subItem.budget) *
                              100
                            : 0,
                        isNegative: rndAmount > subItem.budget,
                      };
                    } else if (subItem.item === 'S&M') {
                      const smAmount = (currentOpex * 0.25) / 1000000;
                      return {
                        ...subItem,
                        actuals: smAmount,
                        variance: smAmount - subItem.budget,
                        variancePercent:
                          subItem.budget > 0
                            ? ((smAmount - subItem.budget) / subItem.budget) *
                              100
                            : 0,
                        isNegative: smAmount > subItem.budget,
                      };
                    } else if (subItem.item === 'G&A') {
                      const gaAmount = (currentOpex * 0.35) / 1000000;
                      return {
                        ...subItem,
                        actuals: gaAmount,
                        variance: gaAmount - subItem.budget,
                        variancePercent:
                          subItem.budget > 0
                            ? ((gaAmount - subItem.budget) / subItem.budget) *
                              100
                            : 0,
                        isNegative: gaAmount > subItem.budget,
                      };
                    }
                    return subItem;
                  }),
                }
              : item
          )
        );
      }

      if (netIncomeData.data && netIncomeData.data.length > 0) {
        const currentNetIncome =
          netIncomeData.data[revenueData.data.length - 1]
            ?.net_income_after_tax || 0;
        const previousNetIncome =
          netIncomeData.data[revenueData.data.length - 2]
            ?.net_income_after_tax || currentNetIncome;
        const netIncomeTrend =
          previousNetIncome > 0
            ? ((currentNetIncome - previousNetIncome) / previousNetIncome) * 100
            : 0;

        setIncomeStatementData((prev) =>
          prev.map((item) =>
            item.item === 'EBITDA'
              ? {
                  ...item,
                  actuals: currentNetIncome / 1000000,
                  variance: currentNetIncome / 1000000 - item.budget,
                  variancePercent:
                    item.budget > 0
                      ? ((currentNetIncome / 1000000 - item.budget) /
                          item.budget) *
                        100
                      : 0,
                  isNegative: currentNetIncome / 1000000 < item.budget,
                }
              : item
          )
        );
      }

      if (cashData.data && cashData.data.length > 0) {
        console.log('💰 Cash data received:', cashData.data);
        console.log('💰 Cash data length:', cashData.data.length);
        console.log(
          '💰 Last cash entry:',
          cashData.data[cashData.data.length - 1]
        );

        const currentCash =
          cashData.data[cashData.data.length - 1]?.cumulative_balance || 0;
        const previousCash =
          cashData.data[cashData.data.length - 2]?.cumulative_balance ||
          currentCash;

        console.log('💰 Current cash:', currentCash);
        console.log('💰 Previous cash:', previousCash);
        console.log('💰 Current cash in FCFA:', currentCash);

        const cashTrend =
          previousCash > 0
            ? ((currentCash - previousCash) / previousCash) * 100
            : 0;

        // Update cash flow metrics
        setCashFlowMetrics((prev) =>
          prev.map((item) => {
            if (item.title === 'Opening Cash Balance') {
              return {
                ...item,
                value:
                  currentCash > 0
                    ? `${currentCash.toLocaleString()} FCFA`
                    : '0 FCFA',
                trend:
                  currentCash > 0
                    ? `${cashTrend >= 0 ? '↑' : '↓'} ${Math.abs(
                        cashTrend
                      ).toFixed(1)}% vs Plan`
                    : '0% vs Plan',
              };
            } else if (item.title === 'Closing Cash Balance') {
              return {
                ...item,
                value:
                  currentCash > 0
                    ? `${currentCash.toLocaleString()} FCFA`
                    : '0 FCFA',
                trend:
                  currentCash > 0
                    ? `${cashTrend >= 0 ? '↑' : '↓'} ${Math.abs(
                        cashTrend
                      ).toFixed(1)}% vs Plan`
                    : '0% vs Plan',
              };
            } else if (item.title === 'Operating Runway') {
              // Calculate operating runway based on cash and monthly burn rate
              // We'll update this when we have OPEX data
              return {
                ...item,
                value: currentCash > 0 ? '12 months' : '0 months', // Placeholder - will be updated when we have OPEX data
                trend:
                  currentCash > 0
                    ? `${cashTrend >= 0 ? '↑' : '↓'} ${Math.abs(
                        cashTrend
                      ).toFixed(1)}% vs Plan`
                    : '0% vs Plan',
              };
            }
            return item;
          })
        );

        // Update balance sheet metrics
        setBalanceSheetMetrics((prev) =>
          prev.map((item) => {
            if (item.title === 'Cash and Equivalents') {
              return {
                ...item,
                value: `${currentCash.toLocaleString()} FCFA`,
                trend: `${cashTrend >= 0 ? '↑' : '↓'} ${Math.abs(
                  cashTrend
                ).toFixed(1)}% vs Plan`,
              };
            } else if (item.title === 'Total Assets') {
              // We'll update this when we have AR data
              return item;
            } else if (item.title === 'Total Equity') {
              // Calculate equity as Assets - Liabilities (simplified)
              const assets =
                currentCash +
                (arData?.data?.[arData.data.length - 1]
                  ?.customer_running_balance || 0);
              const liabilities =
                apData?.data?.[apData.data.length - 1]
                  ?.vendor_running_balance || 0;
              const equity = assets - liabilities;
              return {
                ...item,
                value: `${equity.toLocaleString()} FCFA`,
                trend: `${equity >= 0 ? '↑' : '↓'} ${Math.abs(equity).toFixed(
                  1
                )}% vs Plan`,
              };
            }
            return item;
          })
        );
      }

      if (arData.data && arData.data.length > 0) {
        const currentAR =
          arData.data[arData.data.length - 1]?.customer_running_balance || 0;
        const previousAR =
          arData.data[arData.data.length - 2]?.customer_running_balance ||
          currentAR;
        const arTrend =
          previousAR > 0 ? ((currentAR - previousAR) / previousAR) * 100 : 0;

        setBalanceSheetMetrics((prev) =>
          prev.map((item) =>
            item.title === 'Total Assets'
              ? {
                  ...item,
                  value: `${currentAR.toLocaleString()} FCFA`,
                  trend: `${arTrend >= 0 ? '↑' : '↓'} ${Math.abs(
                    arTrend
                  ).toFixed(1)}% vs Plan`,
                }
              : item
          )
        );
      }

      // Update chart data with real values
      if (revenueData.data && cogsData.data && opexData.data && cashData.data) {
        const currentRevenue =
          revenueData.data[revenueData.data.length - 1]?.total_revenue || 0;
        const currentCogs =
          cogsData.data[cogsData.data.length - 1]?.total_cost || 0;
        const currentOpex =
          opexData.data[opexData.data.length - 1]?.total_opex_amount || 0;
        const currentCash =
          cashData.data[cashData.data.length - 1]?.cumulative_balance || 0;

        // Update cashflow bridge chart
        setCashflowBridgeData((prev) => ({
          ...prev,
          datasets: [
            {
              ...prev.datasets[0],
              data: [
                currentCash, // Opening (actual FCFA value)
                currentRevenue, // Revenue (actual FCFA value)
                -currentCogs, // COGS (negative, actual FCFA value)
                -currentOpex, // OPEX (negative, actual FCFA value)
                -500, // Other (placeholder, actual FCFA value)
                currentCash + currentRevenue - currentCogs - currentOpex - 500, // Closing (actual FCFA value)
              ],
            },
          ],
        }));

        // Update OPEX chart with real data
        setOpexData((prev) => ({
          ...prev,
          datasets: [
            {
              ...prev.datasets[0],
              data: [
                currentOpex * 0.4, // Payroll (40% of OPEX)
                currentOpex * 0.25, // Advertising (25% of OPEX)
                currentOpex * 0.2, // Software & IT (20% of OPEX)
                currentOpex * 0.15, // Office Expenses (15% of OPEX)
              ],
            },
          ],
        }));

        // Update Depreciation and Amortization with real data
        setIncomeStatementData((prev) =>
          prev.map((item) =>
            item.item === 'Depreciation and Amortization'
              ? {
                  ...item,
                  actuals: (currentOpex * 0.05) / 1000000, // 5% of OPEX for D&A
                  variance: (currentOpex * 0.05) / 1000000 - item.budget,
                  variancePercent:
                    item.budget > 0
                      ? (((currentOpex * 0.05) / 1000000 - item.budget) /
                          item.budget) *
                        100
                      : 0,
                  isNegative: (currentOpex * 0.05) / 1000000 > item.budget,
                }
              : item
          )
        );

        // Update Operating Runway with real OPEX data
        if (cashData.data && cashData.data.length > 0) {
          const currentCash =
            cashData.data[cashData.data.length - 1]?.cumulative_balance || 0;
          const monthlyBurnRate = currentOpex / 1000000 / 12; // Monthly OPEX
          const runway =
            monthlyBurnRate > 0 ? currentCash / 1000000 / monthlyBurnRate : 0;

          setCashFlowMetrics((prev) =>
            prev.map((item) =>
              item.title === 'Operating Runway'
                ? {
                    ...item,
                    value: `${runway.toFixed(1)} months`,
                    trend: `${runway >= 12 ? '↑' : '↓'} ${Math.abs(
                      runway - 12
                    ).toFixed(1)} months vs Plan`,
                  }
                : item
            )
          );
        }
      }

      console.log('✅ Financial data fetched and processed:', {
        revenue: revenueData,
        cogs: cogsData,
        opex: opexData,
        netIncome: netIncomeData,
        cash: cashData,
        ar: arData,
        ap: apData,
      });

      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching financial data:', error);
      setError('Failed to load financial data');
      setLoading(false);
    }
  };

  // Load data when component mounts or timeGranularity changes
  useEffect(() => {
    console.log('🚀 FinancialDashboard mounted, fetching data...');
    fetchFinancialData();
  }, [timeGranularity]);

  // Debug: Log current state
  useEffect(() => {
    console.log('📊 Current FinancialDashboard state:', {
      loading,
      error,
      cashFlowMetrics,
      balanceSheetMetrics,
      incomeStatementData,
    });
  }, [
    loading,
    error,
    cashFlowMetrics,
    balanceSheetMetrics,
    incomeStatementData,
  ]);

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Top Section - Cash Flow and Balance Sheet Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consolidated Cash Flow Metrics Skeleton */}
          <Card className="bg-white border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium text-gray-900">
                Consolidated Cash Flow Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg w-9 h-9 animate-pulse"></div>
                      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="text-right">
                      <div className="w-20 h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Consolidated Balance Sheet Metrics Skeleton */}
          <Card className="bg-white border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium text-gray-900">
                Consolidated Balance Sheet Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg w-9 h-9 animate-pulse"></div>
                      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="text-right">
                      <div className="w-20 h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Section - Income Statement and OPEX Summary Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consolidated Income Statement Skeleton */}
          <Card className="bg-white border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium text-gray-900">
                Consolidated Income Statement - FY'25 (FCFA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((index) => (
                  <div key={index} className="flex justify-between py-2">
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* OPEX Summary Skeleton */}
          <Card className="bg-white border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium text-gray-900">
                OPEX Summary - Jan'25 (FCFA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section - Cashflow Bridge Skeleton */}
        <Card className="bg-white border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium text-gray-900">
              Cashflow Bridge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <Card className="bg-white border-0">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="text-red-500 text-lg font-medium mb-2">
                Error Loading Data
              </div>
              <div className="text-gray-600 mb-4">{error}</div>
              <button
                onClick={fetchFinancialData}
                className="px-4 py-2 bg-green-600 text-white  hover:bg-green-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Section - Cash Flow and Balance Sheet Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consolidated Cash Flow Metrics */}
        <Card className="bg-white border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium text-gray-900">
              Consolidated Cash Flow Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cashFlowMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <metric.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {metric.title}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-medium text-gray-900">
                      {metric.value}
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        metric.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {metric.trend}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Consolidated Balance Sheet Metrics */}
        <Card className="bg-white border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium text-gray-900">
              Consolidated Balance Sheet Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {balanceSheetMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <metric.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {metric.title}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-medium text-gray-900">
                      {metric.value}
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        metric.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {metric.trend}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section - Income Statement and OPEX Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consolidated Income Statement */}
        <Card className="bg-white border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium text-gray-900">
              Consolidated Income Statement - FY'25 (FCFA)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-700">
                      Item
                    </th>
                    <th className="text-right py-2 font-medium text-gray-700">
                      Actuals
                    </th>
                    <th className="text-right py-2 font-medium text-gray-700">
                      Budget
                    </th>
                    <th className="text-right py-2 font-medium text-gray-700">
                      Variance
                    </th>
                    <th className="text-right py-2 font-medium text-gray-700">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {incomeStatementData.map((row, index) => (
                    <React.Fragment key={index}>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 text-gray-900 font-medium">
                          {row.item}
                        </td>
                        <td className="py-2 text-right text-gray-700">
                          {formatCurrency(row.actuals)}
                        </td>
                        <td className="py-2 text-right text-gray-700">
                          {formatCurrency(row.budget)}
                        </td>
                        <td className="py-2 text-right text-gray-700">
                          {formatCurrency(row.variance)}
                        </td>
                        <td className="py-2 text-right">
                          <span
                            className={`px-2 py-1  text-xs font-medium ${
                              row.isNegative
                                ? ' text-red-800'
                                : ' text-green-800'
                            }`}
                          >
                            {row.variancePercent.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                      {row.subItems &&
                        row.subItems.map((subItem, subIndex) => (
                          <tr
                            key={`${index}-${subIndex}`}
                            className="border-b border-gray-50 bg-gray-50"
                          >
                            <td className="py-2 pl-6 text-gray-700">
                              {subItem.item}
                            </td>
                            <td className="py-2 text-right text-gray-600">
                              {formatCurrency(subItem.actuals)}
                            </td>
                            <td className="py-2 text-right text-gray-600">
                              {formatCurrency(subItem.budget)}
                            </td>
                            <td className="py-2 text-right text-gray-600">
                              {formatCurrency(subItem.variance)}
                            </td>
                            <td className="py-2 text-right">
                              <span
                                className={`px-2 py-1  text-xs font-medium ${
                                  subItem.isNegative
                                    ? ' text-red-800'
                                    : ' text-green-800'
                                }`}
                              >
                                {subItem.variancePercent.toFixed(2)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* OPEX Summary */}
        <Card className="bg-white border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium text-gray-900">
              OPEX Summary - Jan'25 (FCFA)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Doughnut data={opexData} options={pieChartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Cashflow Bridge */}
      <Card className="bg-white border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-gray-900">
            Cashflow Bridge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Bar data={cashflowBridgeData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialDashboard;
