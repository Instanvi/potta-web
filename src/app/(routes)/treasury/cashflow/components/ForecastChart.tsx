'use client';
import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
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
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ForecastChartProps {
  data: any[];
  viewMode: 'consolidated' | 'detailed';
}

const ForecastChart: React.FC<ForecastChartProps> = ({ data, viewMode }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 border border-gray-200">
        <div className="h-96 flex items-center justify-center">
          <p className="text-gray-500">No forecast data available</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const labels = data.map((item) => item.month);

  // Line chart data (Cash Balance)
  const lineChartData = {
    labels,
    datasets: [
      {
        label: 'Cash Balance',
        data: data.map((item) => item.cash_balance_end),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#22c55e',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  // Bar chart data (Cash Flows)
  const barChartData = {
    labels,
    datasets: [
      {
        label: 'Cash Inflow',
        data: data.map((item) => item.cash_inflow),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: '#22c55e',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Cash Outflow',
        data: data.map((item) => -item.cash_outflow), // Negative for visual effect
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: '#ef4444',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function (context: any) {
            const value = context.parsed.y;
            return `Cash Balance: XAF ${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: '500' as const,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(229, 231, 235, 0.5)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: '500' as const,
          },
          callback: function (value: any) {
            return `XAF ${value.toLocaleString()}`;
          },
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#374151',
          font: {
            size: 12,
            weight: '500' as const,
          },
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function (context: any) {
            const value = Math.abs(context.parsed.y);
            const label = context.dataset.label;
            return `${label}: XAF ${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: '500' as const,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(229, 231, 235, 0.5)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: '500' as const,
          },
          callback: function (value: any) {
            const absValue = Math.abs(value);
            return `XAF ${absValue.toLocaleString()}`;
          },
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <div className="bg-white p-6 border border-gray-200">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Cash Flow Forecast
        </h3>
        <p className="text-sm text-gray-600">
          Projected cash balance and monthly cash flows
        </p>
      </div>

      <div className="space-y-8">
        {/* Cash Balance Line Chart */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700">
              Cash Balance Trend
            </h4>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Cash Balance</span>
            </div>
          </div>
          <div className="h-64">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Cash Flow Bar Chart */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700">
              Monthly Cash Flows
            </h4>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Inflow</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Outflow</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastChart;
