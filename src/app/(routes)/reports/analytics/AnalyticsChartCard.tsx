'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@potta/components/card';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
import { pottaAnalyticsService } from '../../../../services/analyticsService';
import { ChartDataTransformer } from '../../../../utils/chartDataTransformer';

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

interface AnalyticsChartCardProps {
  title: string;
  description: string;
  factName: string;
  metrics: string[];
  dimensions: string[];
  chartType?:
    | 'line'
    | 'bar'
    | 'doughnut'
    | 'pie'
    | 'radar'
    | 'polarArea'
    | 'scatter'
    | 'bubble';
  module?: 'finance' | 'human_capital' | 'sales_inventory';
}

const AnalyticsChartCard: React.FC<AnalyticsChartCardProps> = ({
  title,
  description,
  factName,
  metrics,
  dimensions,
  chartType = 'bar',
  module = 'finance',
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Determine which service to use based on module or fact name
        let response;
        if (
          module === 'human_capital' ||
          factName === 'headcount' ||
          factName === 'payroll' ||
          factName === 'employees' ||
          factName === 'salary_expenses' ||
          factName === 'benefit_expenses'
        ) {
          response = await pottaAnalyticsService.humanCapital.getAnalytics(
            factName,
            {
              metrics,
              dimensions,
              time_granularity: 'monthly',
              use_mock_data: true,
            }
          );
        } else if (
          module === 'sales_inventory' ||
          factName === 'sales' ||
          factName === 'inventory' ||
          factName === 'products' ||
          factName === 'units_sold' ||
          factName === 'new_customers' ||
          factName === 'sales_performance'
        ) {
          response = await pottaAnalyticsService.salesInventory.getAnalytics(
            factName,
            {
              metrics,
              dimensions,
              time_granularity: 'monthly',
              use_mock_data: true,
            }
          );
        } else {
          // Default to finance
          response = await pottaAnalyticsService.finance.getAnalytics(
            factName,
            {
              metrics,
              dimensions,
              time_granularity: 'monthly',
              use_mock_data: true,
            }
          );
        }

        const transformedData = ChartDataTransformer.transformAnalyticsData(
          response.data,
          metrics[0],
          dimensions
        );
        setData(transformedData);

        // Calculate summary
        const values = response.data.map((item: any) => item[metrics[0]] || 0);
        const total = values.reduce((sum: number, val: number) => sum + val, 0);
        const average = total / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);

        setSummary({
          total: total.toLocaleString(),
          average: average.toLocaleString(),
          max: max.toLocaleString(),
          min: min.toLocaleString(),
        });
      } catch (err) {
        console.error(`Error fetching ${factName} data:`, err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [factName, metrics, dimensions]);

  // Determine if we should use horizontal bar chart based on dimensions
  const shouldUseHorizontalBar = () => {
    const individualDimensions = [
      'customer',
      'product',
      'employee',
      'role',
      'vendor',
      'location',
      'department',
    ];
    return dimensions.some((dim) =>
      individualDimensions.includes(dim.toLowerCase())
    );
  };

  const isHorizontalBar = chartType === 'bar' && shouldUseHorizontalBar();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: isHorizontalBar ? 'y' : 'x', // This makes it horizontal
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    elements: {
      line: {
        borderWidth: 3, // Thicker lines for line charts
      },
      bar: {
        borderWidth: 1, // Slight border for bars
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#000000',
          font: { weight: 700 },
          maxRotation: isHorizontalBar ? 0 : 45,
          minRotation: 0,
        },
        ...(isHorizontalBar && {
          beginAtZero: true,
          grid: { color: '#e6f9ed' },
        }),
      },
      y: {
        grid: { display: !isHorizontalBar },
        ticks: {
          color: '#000000',
          font: { weight: 700 },
          maxRotation: isHorizontalBar ? 0 : 0,
        },
        ...(!isHorizontalBar && {
          beginAtZero: true,
          grid: { color: '#e6f9ed' },
        }),
      },
    },
  };

  const renderChart = () => {
    if (!data) return null;

    switch (chartType) {
      case 'bar':
        return <Bar data={data} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={data} options={chartOptions} />;
      default:
        return <Line data={data} options={chartOptions} />;
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chart skeleton */}
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            {/* Summary skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <p className="text-sm text-gray-600">{description}</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-2">Error loading data</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          {title}
          {data?.year && (
            <span className="text-sm font-normal text-green-600 ml-2">
              ({data.year})
            </span>
          )}
        </CardTitle>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="h-64 mb-4">{renderChart()}</div>
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="text-gray-500">Total</p>
              <p className="font-medium text-black">{summary.total}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Average</p>
              <p className="font-medium text-gray-700">{summary.average}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Max</p>
              <p className="font-medium text-gray-800">{summary.max}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Min</p>
              <p className="font-medium text-gray-600">{summary.min}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsChartCard;
