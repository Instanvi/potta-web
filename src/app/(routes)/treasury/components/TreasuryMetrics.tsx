'use client';
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TreasuryMetric {
  name: string;
  value: number;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
}

interface TreasuryMetricsProps {
  metrics: TreasuryMetric[];
  formatCurrency: (amount: number) => string;
}

const TreasuryMetrics: React.FC<TreasuryMetricsProps> = ({
  metrics,
  formatCurrency,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const isPositive = metric.trend === 'up';

        return (
          <div key={index} className="bg-white p-6 transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Icon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {metric.name}
                  </p>
                  <p className="text-2xl font-medium text-gray-900">
                    {metric.name.toLowerCase().includes('ratio')
                      ? metric.value.toFixed(2)
                      : metric.name.toLowerCase().includes('days')
                      ? `${metric.value} days`
                      : formatCurrency
                      ? formatCurrency(metric.value)
                      : metric.value.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={`text-sm font-medium ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {metric.change}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TreasuryMetrics;
