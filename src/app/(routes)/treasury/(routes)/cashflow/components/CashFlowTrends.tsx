'use client';
import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from 'recharts';
import { Button } from '@potta/components/shadcn/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@potta/components/shadcn/select';

interface TrendData {
  month: string;
  cashIn: number;
  cashOut: number;
  net: number;
  cashBalance?: number;
}

interface CashFlowTrendsProps {
  data: TrendData[];
  formatCurrency: (amount: number) => string;
  selectedPeriod: string;
}

const CashFlowTrends: React.FC<CashFlowTrendsProps> = ({
  data,
  formatCurrency,
  selectedPeriod,
}) => {
  const [chartType, setChartType] = useState<'composed' | 'line' | 'bar'>(
    'composed'
  );
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // Calculate cumulative cash balance
  const dataWithBalance = data.map((item, index) => {
    const previousBalance =
      index === 0 ? 2450000 : dataWithBalance[index - 1].cashBalance || 2450000;
    const cashBalance = previousBalance + item.net;
    return {
      ...item,
      cashBalance,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (chartType === 'composed') {
      return (
        <ComposedChart
          data={dataWithBalance}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <YAxis
            yAxisId="left"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickFormatter={(value) => `€${(value / 1000000).toFixed(1)}M`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickFormatter={(value) => `€${(value / 1000000).toFixed(1)}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* Cash Balance Line */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="cashBalance"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            name="Cash Balance"
          />

          {/* Cash Inflow Bars */}
          <Bar
            yAxisId="right"
            dataKey="cashIn"
            fill="#10B981"
            name="Cash Inflow"
            radius={[2, 2, 0, 0]}
          />

          {/* Cash Outflow Bars */}
          <Bar
            yAxisId="right"
            dataKey="cashOut"
            fill="#EF4444"
            name="Cash Outflow"
            radius={[2, 2, 0, 0]}
          />
        </ComposedChart>
      );
    } else if (chartType === 'line') {
      return (
        <LineChart
          data={dataWithBalance}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
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
            tickFormatter={(value) => `€${(value / 1000000).toFixed(1)}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          <Line
            type="monotone"
            dataKey="cashBalance"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            name="Cash Balance"
          />
          <Line
            type="monotone"
            dataKey="cashIn"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
            name="Cash Inflow"
          />
          <Line
            type="monotone"
            dataKey="cashOut"
            stroke="#EF4444"
            strokeWidth={2}
            dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
            name="Cash Outflow"
          />
        </LineChart>
      );
    } else {
      return (
        <BarChart
          data={dataWithBalance}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
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
            tickFormatter={(value) => `€${(value / 1000000).toFixed(1)}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          <Bar
            dataKey="cashIn"
            fill="#10B981"
            name="Cash Inflow"
            radius={[2, 2, 0, 0]}
          />
          <Bar
            dataKey="cashOut"
            fill="#EF4444"
            name="Cash Outflow"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Cash Flow Trends
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Historical and projected cash flow analysis with detailed breakdown
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Chart Type:</span>
            <Button
              variant={chartType === 'composed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('composed')}
            >
              Combined
            </Button>
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              Line
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              Bar
            </Button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-96 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Detailed Table */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">
          Monthly Cash Flow Breakdown
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Month
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  Cash Balance (Start)
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  Cash Inflow
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  Cash Outflow
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  Net Flow
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  Cash Balance (End)
                </th>
              </tr>
            </thead>
            <tbody>
              {dataWithBalance.map((item, index) => {
                const startBalance =
                  index === 0
                    ? 2450000
                    : dataWithBalance[index - 1].cashBalance || 2450000;
                const isSelected = selectedMonth === item.month;

                return (
                  <tr
                    key={item.month}
                    className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                    onClick={() =>
                      setSelectedMonth(isSelected ? null : item.month)
                    }
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {item.month}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {formatCurrency(startBalance)}
                    </td>
                    <td className="py-3 px-4 text-right text-green-600 font-medium">
                      {formatCurrency(item.cashIn)}
                    </td>
                    <td className="py-3 px-4 text-right text-red-600 font-medium">
                      {formatCurrency(item.cashOut)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-medium ${
                        item.net >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(item.net)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900 font-medium">
                      {formatCurrency(item.cashBalance || 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-600">Total Inflow</p>
          <p className="text-lg font-medium text-green-600">
            {formatCurrency(data.reduce((sum, item) => sum + item.cashIn, 0))}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Total Outflow</p>
          <p className="text-lg font-medium text-red-600">
            {formatCurrency(data.reduce((sum, item) => sum + item.cashOut, 0))}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Net Flow</p>
          <p
            className={`text-lg font-medium ${
              data.reduce((sum, item) => sum + item.net, 0) >= 0
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {formatCurrency(data.reduce((sum, item) => sum + item.net, 0))}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">End Balance</p>
          <p className="text-lg font-medium text-gray-900">
            {formatCurrency(
              dataWithBalance[dataWithBalance.length - 1]?.cashBalance || 0
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CashFlowTrends;
