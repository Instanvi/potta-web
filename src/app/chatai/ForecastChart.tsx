'use client';
import React from 'react';
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
import { Line, Bar } from 'react-chartjs-2';

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

interface ForecastData {
  date: string;
  value: number;
  upper: number;
  lower: number;
  family_id: string;
  forecast_id: string;
}

interface ForecastChartProps {
  data: {
    baseline_id: string;
    metric: string;
    organization_id: string;
    location_id: string | null;
    entity_type: string;
    horizon_months: number;
    method_meta: {
      algo: string;
      params: any;
      residual_sd: number;
      seasonality: number;
    };
    forecast: ForecastData[];
  };
  chartType?: 'line' | 'bar';
  showConfidenceInterval?: boolean;
}

const ForecastChart: React.FC<ForecastChartProps> = ({
  data,
  chartType = 'bar',
  showConfidenceInterval = true,
}) => {
  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    });
  };

  // Prepare chart data
  const labels = data.forecast.map((item) => formatDate(item.date));
  const values = data.forecast.map((item) => item.value);
  const upperBounds = data.forecast.map((item) => item.upper);
  const lowerBounds = data.forecast.map((item) => item.lower);

  // Calculate confidence interval data
  const confidenceIntervalData = showConfidenceInterval
    ? [
        ...upperBounds,
        ...lowerBounds.reverse(), // Reverse to create the confidence area
      ]
    : [];

  const chartData = {
    labels,
    datasets: [
      // Confidence interval (filled area)
      ...(showConfidenceInterval
        ? [
            {
              label: 'Confidence Interval',
              data: confidenceIntervalData,
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderColor: 'transparent',
              fill: true,
              pointRadius: 0,
              pointHoverRadius: 0,
              tension: 0.4,
            },
          ]
        : []),
      // Main forecast line/bar
      {
        label: `${
          data.metric.charAt(0).toUpperCase() + data.metric.slice(1)
        } Forecast`,
        data: values,
        borderColor: '#22c55e',
        backgroundColor: chartType === 'bar' ? '#22c55e' : 'transparent',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
      // Upper bound line
      ...(showConfidenceInterval
        ? [
            {
              label: 'Upper Bound',
              data: upperBounds,
              borderColor: '#16a34a',
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderDash: [5, 5],
              fill: false,
              pointRadius: 0,
              pointHoverRadius: 0,
              tension: 0.4,
            },
          ]
        : []),
      // Lower bound line
      ...(showConfidenceInterval
        ? [
            {
              label: 'Lower Bound',
              data: lowerBounds,
              borderColor: '#16a34a',
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderDash: [5, 5],
              fill: false,
              pointRadius: 0,
              pointHoverRadius: 0,
              tension: 0.4,
            },
          ]
        : []),
    ],
  };

  const options = {
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
          font: {
            size: 10,
            weight: '500' as const,
          },
        },
      },
      title: {
        display: true,
        text: `${
          data.metric.charAt(0).toUpperCase() + data.metric.slice(1)
        } Forecast (${data.method_meta.algo} Method)`,
        color: '#1f2937',
        font: {
          size: 14,
          weight: '600' as const,
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#22c55e',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context: any) => {
            return `Period: ${context[0].label}`;
          },
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toLocaleString('en-US')} XAF`;
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
            weight: '500' as const,
            size: 10,
          },
        },
      },
      y: {
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          color: '#6b7280',
          font: {
            weight: '500' as const,
            size: 12,
          },
          callback: function (value: any) {
            return `${value.toLocaleString('en-US')} XAF`;
          },
        },
        beginAtZero: false,
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  // Calculate summary statistics
  const totalValue = values.reduce((sum, val) => sum + val, 0);
  const averageValue = totalValue / values.length;
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const growthRate =
    values.length > 1
      ? ((values[values.length - 1] - values[0]) / values[0]) * 100
      : 0;

  return (
    <div className="w-full">
      {/* Chart */}
      <div className="h-48 mb-3">
        {chartType === 'line' ? (
          <Line data={chartData} options={options} />
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-5 gap-1 text-xs">
        <div className="text-left">
          <p className="text-gray-500 font-medium text-[10px]">Total</p>
          <p className="font-medium text-black text-[11px] leading-tight">
            {(totalValue / 1000).toFixed(0)}K XAF
          </p>
        </div>
        <div className="text-left">
          <p className="text-gray-500 font-medium text-[10px]">Avg</p>
          <p className="font-medium text-gray-700 text-[11px] leading-tight">
            {(averageValue / 1000).toFixed(0)}K XAF
          </p>
        </div>
        <div className="text-left">
          <p className="text-gray-500 font-medium text-[10px]">Max</p>
          <p className="font-medium text-gray-800 text-[11px] leading-tight">
            {(maxValue / 1000).toFixed(0)}K XAF
          </p>
        </div>
        <div className="text-left">
          <p className="text-gray-500 font-medium text-[10px]">Min</p>
          <p className="font-medium text-gray-600 text-[11px] leading-tight">
            {(minValue / 1000).toFixed(0)}K XAF
          </p>
        </div>
        <div className="text-left">
          <p className="text-gray-500 font-medium text-[10px]">Growth</p>
          <p
            className={`font-medium text-[11px] leading-tight ${
              growthRate >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {growthRate >= 0 ? '+' : ''}
            {growthRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Method Information */}
      <div className="mt-2 p-2 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-600">
          <p className="font-medium">
            {data.method_meta.algo} | {data.horizon_months}mo | 95% conf
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForecastChart;
