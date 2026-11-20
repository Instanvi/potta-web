'use client';
import React from 'react';
import { Info, TrendingUp, Calendar, DollarSign } from 'lucide-react';
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
  Cell,
} from 'recharts';

interface AccountReceivablesDashboardProps {
  type?: 'ar';
}

const AccountReceivablesDashboard: React.FC<
  AccountReceivablesDashboardProps
> = ({ type = 'ar' }) => {
  // Mock data based on the images
  const outstandingData = {
    total: 921294,
    notDue: 3324,
    due: 917970,
    notDuePercentage: 0,
    duePercentage: 100,
  };

  const ageingData = [
    { name: 'Not due', amount: 3324, invoices: 1, color: '#10B981' },
    { name: '0-30d', amount: 2385, invoices: 1, color: '#10B981' },
    { name: '31-60d', amount: 0, invoices: 0, color: '#6B7280' },
    { name: '61-90d', amount: 0, invoices: 0, color: '#6B7280' },
    { name: '91+ d', amount: 917344, invoices: 300, color: '#DC2626' },
  ];

  const dsoData = [
    { month: 'Feb 25', dso: 315 },
    { month: 'Mar 25', dso: 346 },
    { month: 'Apr 25', dso: 376 },
    { month: 'May 25', dso: 407 },
    { month: 'Jun 25', dso: 436 },
    { month: 'Jul 25', dso: 467 },
  ];

  const mainDebtors = [
    {
      name: 'HelixisWorks',
      avgDelay: '-',
      notDue: '€0.00',
      due: '€15,030.00',
      outstanding: '€15,030',
    },
    {
      name: 'Axiom Innovations',
      avgDelay: '-',
      notDue: '€0.00',
      due: '€15,011.00',
      outstanding: '€15,011',
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyWithDecimals = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="p-3 space-y-6">
      {/* Top Row - Outstanding Amount and Ageing Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outstanding Amount Card */}
        <div className="bg-white  p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Outstanding amount
            </h3>
            <Info className="w-4 h-4 text-gray-400" />
          </div>

          <div className="mb-4">
            <div className="text-3xl font-medium text-gray-900">
              {formatCurrency(outstandingData.total)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${outstandingData.duePercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span className="text-gray-600">NOT DUE:</span>
              <span className="ml-1 font-medium">
                {formatCurrency(outstandingData.notDue)}
              </span>
              <span className="ml-1 text-gray-500">
                ({outstandingData.notDuePercentage}%)
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
              <span className="text-gray-600">DUE:</span>
              <span className="ml-1 font-medium">
                {formatCurrency(outstandingData.due)}
              </span>
              <span className="ml-1 text-gray-500">
                ({outstandingData.duePercentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Ageing Balance Card */}
        <div className="bg-white  p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Ageing balance
            </h3>
            <Info className="w-4 h-4 text-gray-400" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ageingData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
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
                    `${formatCurrency(value)} (${
                      ageingData.find((item) => item.amount === value)
                        ?.invoices || 0
                    } invoices)`,
                    name,
                  ]}
                />
                <Bar dataKey="amount" fill="#8884d8">
                  {ageingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row - DSO Card */}
      <div className="bg-white  p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              DSO, days sales outstanding: A key performance indicator of your
              cashflow
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
              3 months
            </button>
            <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded">
              6 months
            </button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
              12 months
            </button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
              ...
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* DSO Illustration and Metric */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-4">
              {/* Simple illustration */}
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
              </div>
              <div>
                <div className="text-3xl font-medium text-gray-900">467</div>
                <div className="text-sm text-gray-600">days</div>
                <div className="flex items-center text-sm text-red-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +7%
                </div>
              </div>
            </div>
          </div>

          {/* DSO Chart */}
          <div className="lg:col-span-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dsoData}
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
                  tickFormatter={(value) => `${value} d.`}
                />
                <Tooltip formatter={(value: any) => [`${value} d.`, 'DSO']} />
                <Line
                  type="monotone"
                  dataKey="dso"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
                {/* Benchmark line at 40 days */}
                <Line
                  type="monotone"
                  dataKey={() => 40}
                  stroke="#9CA3AF"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Debtors Table */}
      <div className="bg-white  p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Main debtors</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            See all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">
                  Average delay
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">
                  Not due
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">
                  Due
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">
                  Out. amount
                </th>
              </tr>
            </thead>
            <tbody>
              {mainDebtors.map((debtor, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {debtor.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {debtor.avgDelay}
                  </td>
                  <td className="py-3 px-4 text-sm text-green-600">
                    {debtor.notDue}
                  </td>
                  <td className="py-3 px-4 text-sm text-red-600">
                    {debtor.due}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {debtor.outstanding}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountReceivablesDashboard;
