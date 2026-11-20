'use client';
import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@potta/components/shadcn/select';
import { Button } from '@potta/components/shadcn/button';

interface CashFlowChartData {
  month: string;
  cashIn: number;
  cashOut: number;
  net: number;
}

interface CashFlowChartProps {
  data: CashFlowChartData[];
  formatCurrency: (amount: number) => string;
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({
  data,
  formatCurrency,
}) => {
  const [timeFilter, setTimeFilter] = useState('6m');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const timeFilterOptions = [
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '12m', label: '12 Months' },
  ];

  // Filter data based on selected time period
  const getFilteredData = () => {
    const monthsMap: { [key: string]: number } = {
      '3m': 3,
      '6m': 6,
      '12m': 12,
    };

    const monthsToShow = monthsMap[timeFilter] || 6;
    return data.slice(-monthsToShow);
  };

  const filteredData = getFilteredData();

  const renderChart = () => {
    if (chartType === 'bar') {
      return (
        <BarChart
          data={filteredData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value: any) => [formatCurrency(value), 'Amount']}
            labelStyle={{ color: '#374151' }}
          />
          <Bar dataKey="cashIn" fill="#15803d" name="Cash In" />
          <Bar dataKey="cashOut" fill="#EF4444" name="Cash Out" />
        </BarChart>
      );
    } else {
      return (
        <LineChart
          data={filteredData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value: any) => [formatCurrency(value), 'Amount']}
            labelStyle={{ color: '#374151' }}
          />
          <Line
            type="linear"
            dataKey="cashIn"
            stroke="#15803d"
            strokeWidth={3}
            dot={{ fill: '#15803d', strokeWidth: 2, r: 4 }}
            name="Cash In"
          />
          <Line
            type="linear"
            dataKey="cashOut"
            stroke="#EF4444"
            strokeWidth={3}
            dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
            name="Cash Out"
          />
        </LineChart>
      );
    }
  };

  return (
    <div className="bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Cash Flow Trend</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Period:</span>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              Bar
            </Button>
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              Line
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-6 mb-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-700 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Cash In</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Cash Out</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Net Flow</span>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CashFlowChart;
