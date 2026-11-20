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

interface AccountPayablesDashboardProps {
  type?: 'ap';
}

const AccountPayablesDashboard: React.FC<AccountPayablesDashboardProps> = ({
  type = 'ap',
}) => {
  // Mock data based on the AR dashboard structure but for payables
  const outstandingData = {
    total: 456789,
    notDue: 12345,
    due: 444444,
    notDuePercentage: 3,
    duePercentage: 97,
  };

  const ageingData = [
    { name: 'Not due', amount: 12345, bills: 5, color: '#10B981' },
    { name: '0-30d', amount: 23456, bills: 12, color: '#10B981' },
    { name: '31-60d', amount: 45678, bills: 8, color: '#F59E0B' },
    { name: '61-90d', amount: 67890, bills: 15, color: '#F59E0B' },
    { name: '91+ d', amount: 307420, bills: 45, color: '#DC2626' },
  ];

  const dpoData = [
    { month: 'Feb 25', dpo: 25 },
    { month: 'Mar 25', dpo: 28 },
    { month: 'Apr 25', dpo: 32 },
    { month: 'May 25', dpo: 35 },
    { month: 'Jun 25', dpo: 38 },
    { month: 'Jul 25', dpo: 42 },
  ];

  const mainVendors = [
    {
      name: 'TechSupply Co.',
      avgDelay: '15 days',
      notDue: 'FCFA 2,500.00',
      due: 'FCFA 12,500.00',
      outstanding: 'FCFA 15,000',
    },
    {
      name: 'Office Solutions Ltd',
      avgDelay: '8 days',
      notDue: 'FCFA 1,800.00',
      due: 'FCFA 8,200.00',
      outstanding: 'FCFA 10,000',
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
                      ageingData.find((item) => item.amount === value)?.bills ||
                      0
                    } bills)`,
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

      {/* Bottom Row - DPO Card */}
      <div className="bg-white  p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              DPO, days payable outstanding: A key performance indicator of your
              cash management
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
              3 months
            </button>
            <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded">
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
          {/* DPO Illustration and Metric */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-4">
              {/* Simple illustration */}
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <div className="text-3xl font-medium text-gray-900">42</div>
                <div className="text-sm text-gray-600">days</div>
                <div className="flex items-center text-sm text-red-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +4%
                </div>
              </div>
            </div>
          </div>

          {/* DPO Chart */}
          <div className="lg:col-span-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dpoData}
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
                <Tooltip formatter={(value: any) => [`${value} d.`, 'DPO']} />
                <Line
                  type="monotone"
                  dataKey="dpo"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
                {/* Benchmark line at 30 days */}
                <Line
                  type="monotone"
                  dataKey={() => 30}
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

      {/* Main Vendors Table */}
      <div className="bg-white  p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Main vendors</h3>
          <button className="text-green-600 hover:text-green-700 text-sm font-medium">
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
              {mainVendors.map((vendor, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {vendor.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {vendor.avgDelay}
                  </td>
                  <td className="py-3 px-4 text-sm text-green-600">
                    {vendor.notDue}
                  </td>
                  <td className="py-3 px-4 text-sm text-red-600">
                    {vendor.due}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {vendor.outstanding}
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

export default AccountPayablesDashboard;
