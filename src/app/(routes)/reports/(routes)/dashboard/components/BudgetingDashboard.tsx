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
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Users, ChevronDown } from 'lucide-react';
import { pottaAnalyticsService } from '../../../../../../services/analyticsService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BudgetingDashboardProps {
  timeGranularity: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

const BudgetingDashboard: React.FC<BudgetingDashboardProps> = ({
  timeGranularity,
}) => {
  const [kpiData, setKpiData] = useState([
    {
      title: 'Revenue FY',
      value: '0 FCFA',
      trend: '0% vs Base Scenario',
      isPositive: true,
      icon: TrendingUp,
    },
    {
      title: 'YoY Growth FY',
      value: '0%',
      trend: '0% vs Base Scenario',
      isPositive: true,
      icon: TrendingUp,
    },
    {
      title: 'Opex FY',
      value: '0 FCFA',
      trend: '0% vs Base Scenario',
      isPositive: false,
      icon: TrendingDown,
    },
    {
      title: 'Headcount FY',
      value: '0',
      trend: '0% vs Base Case',
      isPositive: false,
      icon: Users,
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Revenue Scenarios Chart Data - Will be updated with real API data
  const [revenueData, setRevenueData] = useState({
    labels: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    datasets: [
      {
        label: 'Budget',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: '#22c55e', // Green bars
        borderColor: '#22c55e',
        borderWidth: 1,
      },
      {
        label: 'Bull scenario',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(34, 197, 94, 0.3)', // Lighter green bars
        borderColor: '#22c55e',
        borderWidth: 1,
      },
    ],
  });

  const chartOptions = {
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
        },
      },
      title: { display: false },
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
        beginAtZero: true,
      },
    },
  };

  const [plData, setPlData] = useState([
    {
      item: 'Revenue',
      budget: '0 FCFA',
      scenario: '0 FCFA',
      variance: '0 FCFA',
      percentage: '0.00%',
      isPositive: true,
    },
    {
      item: 'Cost of Sales',
      budget: '0 FCFA',
      scenario: '0 FCFA',
      variance: '0 FCFA',
      percentage: '0.00%',
      isPositive: false,
    },
    {
      item: 'Gross Profit',
      budget: '0 FCFA',
      scenario: '0 FCFA',
      variance: '0 FCFA',
      percentage: '0.00%',
      isPositive: true,
    },
    {
      item: 'Total Expenses',
      budget: '0 FCFA',
      scenario: '0 FCFA',
      variance: '0 FCFA',
      percentage: '0.00%',
      isPositive: false,
      isExpandable: true,
      subItems: [
        {
          item: 'R&D',
          budget: '0 FCFA',
          scenario: '0 FCFA',
          variance: '0 FCFA',
          percentage: '0.00%',
          isPositive: true,
        },
        {
          item: 'S&M',
          budget: '0 FCFA',
          scenario: '0 FCFA',
          variance: '0 FCFA',
          percentage: '0.00%',
          isPositive: false,
        },
        {
          item: 'G&A',
          budget: '0 FCFA',
          scenario: '0 FCFA',
          variance: '0 FCFA',
          percentage: '0.00%',
          isPositive: true,
        },
      ],
    },
  ]);

  // Fetch budgeting data from Finance API
  const fetchBudgetingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch revenue data for budgeting
      const revenueData = await pottaAnalyticsService.finance.getAnalytics(
        'revenue',
        {
          metrics: ['total_revenue'],
          dimensions: ['time'],
          time_granularity: timeGranularity,
          use_mock_data: true,
        }
      );

      // Fetch OPEX data for budgeting
      const opexData = await pottaAnalyticsService.finance.getAnalytics(
        'opex',
        {
          metrics: ['total_opex_amount'],
          dimensions: ['time'],
          time_granularity: timeGranularity,
          use_mock_data: true,
        }
      );

      // Fetch COGS data for budgeting
      const cogsData = await pottaAnalyticsService.finance.getAnalytics(
        'cogs',
        {
          metrics: ['total_cost'],
          dimensions: ['time'],
          time_granularity: timeGranularity,
          use_mock_data: true,
        }
      );

      // Fetch net income data for budgeting
      const netIncomeData = await pottaAnalyticsService.finance.getAnalytics(
        'net_income',
        {
          metrics: ['net_income_after_tax'],
          dimensions: ['time'],
          time_granularity: timeGranularity,
          use_mock_data: true,
        }
      );

      // Process and update KPI data
      if (revenueData.data && revenueData.data.length > 0) {
        const currentRevenue =
          revenueData.data[revenueData.data.length - 1]?.total_revenue || 0;
        const previousRevenue =
          revenueData.data[revenueData.data.length - 2]?.total_revenue ||
          currentRevenue;
        const revenueGrowth =
          previousRevenue > 0
            ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
            : 0;

        setKpiData((prev) =>
          prev.map((item) =>
            item.title === 'Revenue FY'
              ? {
                  ...item,
                  value: `${currentRevenue.toLocaleString()} FCFA`,
                  trend: `${
                    revenueGrowth >= 0 ? '+' : ''
                  }${revenueGrowth.toFixed(1)}% vs Base Scenario`,
                }
              : item
          )
        );

        setKpiData((prev) =>
          prev.map((item) =>
            item.title === 'YoY Growth FY'
              ? {
                  ...item,
                  value: `${revenueGrowth.toFixed(1)}%`,
                  trend: `${
                    revenueGrowth >= 0 ? '+' : ''
                  }${revenueGrowth.toFixed(1)}% vs Base Scenario`,
                }
              : item
          )
        );

        // Update P&L data with real revenue values
        setPlData((prev) =>
          prev.map((item) =>
            item.item === 'Revenue'
              ? {
                  ...item,
                  budget: `${currentRevenue.toLocaleString()} FCFA`,
                  scenario: `${(currentRevenue * 1.15).toLocaleString()} FCFA`,
                  variance: `${(currentRevenue * 0.15).toLocaleString()} FCFA`,
                  percentage: '15.00%',
                }
              : item
          )
        );

        // Update revenue chart data with real values
        const monthlyRevenue = currentRevenue / 12; // Distribute revenue across months
        setRevenueData((prev) => ({
          ...prev,
          datasets: [
            {
              ...prev.datasets[0],
              data: Array(12).fill(monthlyRevenue), // Budget - same value for all months
            },
            {
              ...prev.datasets[1],
              data: Array(12).fill(monthlyRevenue * 1.15), // Bull scenario - 15% higher
            },
          ],
        }));
      }

      if (opexData.data && opexData.data.length > 0) {
        const currentOpex =
          opexData.data[opexData.data.length - 1]?.total_opex_amount || 0;
        const previousOpex =
          opexData.data[opexData.data.length - 2]?.total_opex_amount ||
          currentOpex;
        const opexGrowth =
          previousOpex > 0
            ? ((currentOpex - previousOpex) / previousOpex) * 100
            : 0;

        setKpiData((prev) =>
          prev.map((item) =>
            item.title === 'Opex FY'
              ? {
                  ...item,
                  value: `${currentOpex.toLocaleString()} FCFA`,
                  trend: `${opexGrowth >= 0 ? '+' : ''}${opexGrowth.toFixed(
                    1
                  )}% vs Base Scenario`,
                }
              : item
          )
        );

        // Update P&L data with real OPEX values
        setPlData((prev) =>
          prev.map((item) =>
            item.item === 'Total Expenses'
              ? {
                  ...item,
                  budget: `${currentOpex.toLocaleString()} FCFA`,
                  scenario: `${(currentOpex * 1.04).toLocaleString()} FCFA`,
                  variance: `${(currentOpex * 0.04).toLocaleString()} FCFA`,
                  percentage: '4.00%',
                }
              : item
          )
        );

        // Update OPEX sub-items with real data
        setPlData((prev) =>
          prev.map((item) =>
            item.item === 'Total Expenses'
              ? {
                  ...item,
                  subItems: item.subItems?.map((subItem) => {
                    if (subItem.item === 'R&D') {
                      const rndAmount = currentOpex * 0.4;
                      return {
                        ...subItem,
                        budget: `${rndAmount.toLocaleString()} FCFA`,
                        scenario: `${(rndAmount * 1.04).toLocaleString()} FCFA`,
                        variance: `${(rndAmount * 0.04).toLocaleString()} FCFA`,
                        percentage: '4.00%',
                      };
                    } else if (subItem.item === 'S&M') {
                      const smAmount = currentOpex * 0.25;
                      return {
                        ...subItem,
                        budget: `${smAmount.toLocaleString()} FCFA`,
                        scenario: `${(smAmount * 1.04).toLocaleString()} FCFA`,
                        variance: `${(smAmount * 0.04).toLocaleString()} FCFA`,
                        percentage: '4.00%',
                      };
                    } else if (subItem.item === 'G&A') {
                      const gaAmount = currentOpex * 0.35;
                      return {
                        ...subItem,
                        budget: `${gaAmount.toLocaleString()} FCFA`,
                        scenario: `${(gaAmount * 1.04).toLocaleString()} FCFA`,
                        variance: `${(gaAmount * 0.04).toLocaleString()} FCFA`,
                        percentage: '4.00%',
                      };
                    }
                    return subItem;
                  }),
                }
              : item
          )
        );
      }

      // Update P&L data with COGS values
      if (cogsData.data && cogsData.data.length > 0) {
        const currentCogs =
          cogsData.data[cogsData.data.length - 1]?.total_cost || 0;
        setPlData((prev) =>
          prev.map((item) =>
            item.item === 'Cost of Sales'
              ? {
                  ...item,
                  budget: `${currentCogs.toLocaleString()} FCFA`,
                  scenario: `${(currentCogs * 1.1).toLocaleString()} FCFA`,
                  variance: `${(currentCogs * 0.1).toLocaleString()} FCFA`,
                  percentage: '10.00%',
                }
              : item
          )
        );

        // Calculate and update Gross Profit after both Revenue and COGS are available
        if (revenueData.data && revenueData.data.length > 0) {
          const currentRevenue =
            revenueData.data[revenueData.data.length - 1]?.total_revenue || 0;
          const grossProfit = currentRevenue - currentCogs;
          const grossProfitScenario = grossProfit * 1.15; // 15% higher scenario

          setPlData((prev) =>
            prev.map((item) =>
              item.item === 'Gross Profit'
                ? {
                    ...item,
                    budget: `${grossProfit.toLocaleString()} FCFA`,
                    scenario: `${grossProfitScenario.toLocaleString()} FCFA`,
                    variance: `${(
                      grossProfitScenario - grossProfit
                    ).toLocaleString()} FCFA`,
                    percentage: '15.00%',
                  }
                : item
            )
          );
        }
      }

      console.log('✅ Budgeting data fetched:', {
        revenue: revenueData,
        opex: opexData,
        cogs: cogsData,
        netIncome: netIncomeData,
      });

      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching budgeting data:', error);
      setError('Failed to load budgeting data');
      setLoading(false);
    }
  };

  // Load data when component mounts or timeGranularity changes
  useEffect(() => {
    fetchBudgetingData();
  }, [timeGranularity]);

  if (loading) {
    return (
      <div className="space-y-8">
        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((index) => (
            <Card key={index} className="bg-white border-0">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div>
                    <div className="w-32 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="w-28 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border-0">
            <CardHeader className="pb-4">
              <div className="w-40 h-6 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0">
            <CardHeader className="pb-4">
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((index) => (
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
        </div>
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
                onClick={fetchBudgetingData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
      {/* Debug and Refresh Section */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
        <button
          onClick={fetchBudgetingData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* KPI Cards - 4 cards in one row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="bg-white border-0">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 font-medium">
                    {kpi.title}
                  </p>
                  <kpi.icon
                    className={`w-4 h-4 ${
                      kpi.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}
                  />
                </div>
                <div>
                  <p className="text-3xl font-medium text-gray-900">
                    {kpi.value}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      kpi.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {kpi.trend}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Section - Revenue Scenarios Chart and P&L Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Scenarios Chart */}
        <Card className="bg-white border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium text-gray-900">
              Revenue Scenarios - FY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar data={revenueData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* P&L Summary */}
        <Card className="bg-white border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium text-gray-900">
              P&L Summary - FY25
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
                      Budget
                    </th>
                    <th className="text-right py-2 font-medium text-gray-700">
                      Scenario
                    </th>
                    <th className="text-right py-2 font-medium text-gray-700">
                      Variance
                    </th>
                    <th className="text-right py-2 font-medium text-gray-700">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {plData.map((row, index) => (
                    <React.Fragment key={index}>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 text-gray-900 font-medium">
                          <div className="flex items-center space-x-2">
                            {row.isExpandable && (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                            <span>{row.item}</span>
                          </div>
                        </td>
                        <td className="py-2 text-right text-gray-700">
                          {row.budget}
                        </td>
                        <td className="py-2 text-right text-gray-700">
                          {row.scenario}
                        </td>
                        <td className="py-2 text-right text-gray-700">
                          {row.variance}
                        </td>
                        <td className="py-2 text-right">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              row.isPositive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {row.percentage}
                          </span>
                        </td>
                      </tr>
                      {row.subItems &&
                        row.subItems.map((subItem, subIndex) => (
                          <tr
                            key={`sub-${index}-${subIndex}`}
                            className="bg-gray-50"
                          >
                            <td className="py-2 pl-8 text-gray-700">
                              {subItem.item}
                            </td>
                            <td className="py-2 text-right text-gray-700">
                              {subItem.budget}
                            </td>
                            <td className="py-2 text-right text-gray-700">
                              {subItem.scenario}
                            </td>
                            <td className="py-2 text-right text-gray-700">
                              {subItem.variance}
                            </td>
                            <td className="py-2 text-right">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  subItem.isPositive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {subItem.percentage}
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
      </div>
    </div>
  );
};

export default BudgetingDashboard;
