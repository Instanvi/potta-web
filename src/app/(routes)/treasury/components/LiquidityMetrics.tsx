'use client';
import React from 'react';
import { Info, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@potta/components/shadcn/tooltip';

interface LiquidityData {
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  workingCapital: number;
}

interface LiquidityMetricsProps {
  data: LiquidityData;
  formatCurrency: (amount: number) => string;
}

const LiquidityMetrics: React.FC<LiquidityMetricsProps> = ({
  data,
  formatCurrency,
}) => {
  const { currentRatio, quickRatio, cashRatio, workingCapital } = data;

  const getRatioStatus = (ratio: number, type: string) => {
    let status = { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Normal' };

    if (type === 'current' || type === 'quick') {
      if (ratio >= 2) {
        status = {
          color: 'text-green-600',
          bg: 'bg-green-100',
          label: 'Excellent',
        };
      } else if (ratio >= 1) {
        status = {
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          label: 'Good',
        };
      } else {
        status = { color: 'text-red-600', bg: 'bg-red-100', label: 'Poor' };
      }
    } else if (type === 'cash') {
      if (ratio >= 0.5) {
        status = {
          color: 'text-green-600',
          bg: 'bg-green-100',
          label: 'Excellent',
        };
      } else if (ratio >= 0.2) {
        status = {
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          label: 'Good',
        };
      } else {
        status = { color: 'text-red-600', bg: 'bg-red-100', label: 'Poor' };
      }
    }

    return status;
  };

  const tooltips = {
    currentRatio:
      'Measures ability to pay short-term obligations. Ratio ≥ 2 is excellent.',
    quickRatio:
      'Measures ability to pay short-term obligations without inventory. Ratio ≥ 1 is good.',
    cashRatio:
      'Measures ability to pay short-term obligations with cash only. Ratio ≥ 0.5 is excellent.',
    workingCapital: 'Available capital for day-to-day operations.',
  };

  return (
    <div className="bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Liquidity Metrics
        </h3>
        <Info className="w-4 h-4 text-gray-400" />
      </div>

      <div className="space-y-4">
        {[
          {
            key: 'currentRatio',
            label: 'Current Ratio',
            value: currentRatio,
            type: 'current',
          },
          {
            key: 'quickRatio',
            label: 'Quick Ratio',
            value: quickRatio,
            type: 'quick',
          },
          {
            key: 'cashRatio',
            label: 'Cash Ratio',
            value: cashRatio,
            type: 'cash',
          },
        ].map((metric) => {
          const status = getRatioStatus(metric.value, metric.type);
          return (
            <div
              key={metric.key}
              className="flex justify-between items-center p-3 bg-gray-50"
            >
              <div className="flex items-center">
                <span className="text-gray-700 font-medium mr-2">
                  {metric.label}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        {tooltips[metric.key as keyof typeof tooltips]}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">
                  {metric.value.toFixed(2)}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
                >
                  {status.label}
                </span>
              </div>
            </div>
          );
        })}

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-900 font-medium">Working Capital</span>
            <span className="font-medium text-lg text-blue-600">
              {formatCurrency(workingCapital)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidityMetrics;
