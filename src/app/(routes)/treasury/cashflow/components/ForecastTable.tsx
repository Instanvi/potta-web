'use client';
import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  BarChart3,
} from 'lucide-react';

interface ForecastTableProps {
  data: any[];
  viewMode: 'consolidated' | 'detailed';
}

const ForecastTable: React.FC<ForecastTableProps> = ({ data, viewMode }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 border border-gray-200">
        <p className="text-gray-500 text-center">No forecast data available</p>
      </div>
    );
  }

  // Reorder data to show current month first
  const reorderedData = [...data].sort((a, b) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const aDate = new Date(a.date);
    const bDate = new Date(b.date);

    // Check if either date is the current month
    const aIsCurrent =
      aDate.getMonth() === currentMonth && aDate.getFullYear() === currentYear;
    const bIsCurrent =
      bDate.getMonth() === currentMonth && bDate.getFullYear() === currentYear;

    if (aIsCurrent && !bIsCurrent) return -1;
    if (!aIsCurrent && bIsCurrent) return 1;

    // If neither or both are current, sort by date
    return aDate.getTime() - bDate.getTime();
  });

  const formatCurrency = (amount: number): string => {
    return `XAF ${Math.abs(amount).toLocaleString()}`;
  };

  const formatLargeCurrency = (amount: number): string => {
    const absAmount = Math.abs(amount);
    if (absAmount > 0) {
      return `XAF ${absAmount.toLocaleString()}`;
    } else {
      return `XAF 0`;
    }
  };

  const getCellColor = (value: number, type: 'balance' | 'flow' | 'kpi') => {
    if (type === 'balance') {
      return value >= 0 ? 'text-green-600' : 'text-red-600';
    }
    if (type === 'flow') {
      return value >= 0 ? 'text-green-600' : 'text-red-600';
    }
    return 'text-gray-900';
  };

  const tableRows = [
    {
      id: 'cash_balance_beginning',
      icon: DollarSign,
      label: 'Cash balance at the beginning',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      type: 'balance' as const,
    },
    {
      id: 'cash_inflow',
      icon: TrendingUp,
      label: 'Cash inflow',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      type: 'flow' as const,
    },
    {
      id: 'cash_outflow',
      icon: TrendingDown,
      label: 'Cash outflow',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      type: 'flow' as const,
    },
    {
      id: 'cash_balance_end',
      icon: BarChart3,
      label: 'End of month cash balance',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      type: 'balance' as const,
    },
    {
      id: 'fcf',
      icon: Activity,
      label: 'Key performance indicators',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      type: 'kpi' as const,
    },
  ];

  return (
    <div className="bg-white border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Forecast Details
        </h3>
        <p className="text-sm text-gray-600">
          Monthly breakdown of cash flows and key metrics
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              {reorderedData.map((item, index) => {
                const currentDate = new Date();
                const currentMonth = currentDate.getMonth();
                const currentYear = currentDate.getFullYear();
                const itemDate = new Date(item.date);
                const isCurrentMonth =
                  itemDate.getMonth() === currentMonth &&
                  itemDate.getFullYear() === currentYear;

                return (
                  <th
                    key={index}
                    className={`px-4 py-4 text-left text-xs font-medium uppercase tracking-wider min-w-[100px] ${
                      isCurrentMonth
                        ? 'bg-blue-50 text-blue-800 '
                        : 'text-gray-500'
                    }`}
                  >
                    {item.month}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableRows.map((row) => {
              const IconComponent = row.icon;
              return (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-2 ${row.bgColor} mr-3`}>
                        <IconComponent className={`h-4 w-4 ${row.color}`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {row.label}
                        </div>
                      </div>
                    </div>
                  </td>
                  {reorderedData.map((item, index) => {
                    let value = item[row.id] || 0;

                    // Special handling for cash outflow (show as negative)
                    if (row.id === 'cash_outflow') {
                      value = -Math.abs(value);
                    }

                    const currentDate = new Date();
                    const currentMonth = currentDate.getMonth();
                    const currentYear = currentDate.getFullYear();
                    const itemDate = new Date(item.date);
                    const isCurrentMonth =
                      itemDate.getMonth() === currentMonth &&
                      itemDate.getFullYear() === currentYear;

                    return (
                      <td
                        key={index}
                        className={`px-4 py-4 whitespace-nowrap text-left ${
                          isCurrentMonth ? 'bg-blue-50 ' : ''
                        }`}
                      >
                        <div className="text-sm font-normal">
                          <span className={getCellColor(value, row.type)}>
                            {formatLargeCurrency(value)}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary row */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              Summary Statistics
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-start">
              <div className="text-xs text-gray-500">Total Inflow</div>
              <div className="text-sm font-medium text-green-600">
                {formatLargeCurrency(
                  reorderedData.reduce((sum, item) => sum + item.cash_inflow, 0)
                )}
              </div>
            </div>
            <div className="text-start">
              <div className="text-xs text-gray-500">Total Outflow</div>
              <div className="text-sm font-medium text-red-600">
                {formatLargeCurrency(
                  reorderedData.reduce(
                    (sum, item) => sum + item.cash_outflow,
                    0
                  )
                )}
              </div>
            </div>
            <div className="text-start">
              <div className="text-xs text-gray-500">Net Flow</div>
              <div
                className={`text-sm font-medium ${
                  reorderedData.reduce(
                    (sum, item) => sum + item.net_cash_flow,
                    0
                  ) >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {formatLargeCurrency(
                  reorderedData.reduce(
                    (sum, item) => sum + item.net_cash_flow,
                    0
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastTable;
