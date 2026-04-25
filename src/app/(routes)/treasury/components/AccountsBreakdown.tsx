'use client';
import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@potta/components/shadcn/select';
import { Info } from 'lucide-react';

interface AccountData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface AccountsBreakdownProps {
  data: AccountData[];
  formatCurrency: (amount: number) => string;
}

const AccountsBreakdown: React.FC<AccountsBreakdownProps> = ({
  data,
  formatCurrency,
}) => {
  const [viewFilter, setViewFilter] = useState('all');

  const viewFilterOptions = [
    { value: 'all', label: 'All Accounts' },
    { value: 'assets', label: 'Assets Only' },
    { value: 'liabilities', label: 'Liabilities Only' },
  ];

  const filteredData = data.filter((account) => {
    if (viewFilter === 'all') return true;
    if (viewFilter === 'assets') {
      return (
        account.name.includes('Receivable') ||
        account.name.includes('Cash') ||
        account.name.includes('Investment')
      );
    }
    if (viewFilter === 'liabilities') {
      return account.name.includes('Payable');
    }
    return true;
  });

  const totalValue = filteredData.reduce(
    (sum, account) => sum + account.value,
    0
  );

  return (
    <div className="bg-white   p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Accounts Breakdown
        </h3>
        <div className="flex items-center space-x-2">
          <Select value={viewFilter} onValueChange={setViewFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {viewFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Info className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [formatCurrency(value), 'Amount']}
              labelStyle={{ color: '#374151' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-2">
        {filteredData.map((account, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 hover:bg-gray-50  transition-colors"
          >
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded mr-3"
                style={{ backgroundColor: account.color }}
              ></div>
              <div>
                <span className="text-sm font-medium text-gray-900">
                  {account.name}
                </span>
                <div className="text-xs text-gray-500">
                  {((account.value / totalValue) * 100).toFixed(1)}% of total
                </div>
              </div>
            </div>
            <span className="font-medium text-gray-900">
              {formatCurrency(account.value)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Total</span>
          <span className="text-lg font-medium text-gray-900">
            {formatCurrency(totalValue)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AccountsBreakdown;
