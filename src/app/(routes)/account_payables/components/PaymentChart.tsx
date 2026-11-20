'use client';
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface PaymentChartProps {
  data: any[];
  formatCurrency: (amount: number) => string;
}

const PaymentChart: React.FC<PaymentChartProps> = ({
  data,
  formatCurrency,
}) => {
  // Process data for chart - group by month
  const chartData = useMemo(() => {
    const monthlyData: Record<
      string,
      { month: string; amount: number; bills: number }
    > = {};

    data.forEach((bill: any) => {
      const date = new Date(bill.createdAt || bill.dueDate || new Date());
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthLabel,
          amount: 0,
          bills: 0,
        };
      }

      monthlyData[monthKey].amount += parseFloat(bill.billAmount) || 0;
      monthlyData[monthKey].bills += 1;
    });

    // Convert to array and sort by month
    return Object.values(monthlyData)
      .sort((a, b) => {
        const [yearA, monthA] = a.month.split(' ');
        const [yearB, monthB] = b.month.split(' ');
        const dateA = new Date(
          parseInt(yearA),
          new Date(`${monthA} 1, ${yearA}`).getMonth()
        );
        const dateB = new Date(
          parseInt(yearB),
          new Date(`${monthB} 1, ${yearB}`).getMonth()
        );
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-6); // Show last 6 months
  }, [data]);

  return (
    <div className="bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-gray-900">Payment Trends</h2>
        <div className="p-2 bg-green-100">
          <TrendingUp className="h-5 w-5 text-green-600" />
        </div>
      </div>

      <div className="h-64">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
                formatter={(value: any, name: any) => [
                  `${formatCurrency(value)}`,
                  name === 'amount' ? 'Amount' : 'Bills',
                ]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No payment data available for chart</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentChart;
