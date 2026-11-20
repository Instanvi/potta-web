import React from 'react';
import { Info, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface TreasuryOverviewChartsProps {
  bills: any[];
  type: 'ap' | 'ar';
}

const TreasuryOverviewCharts: React.FC<TreasuryOverviewChartsProps> = ({
  bills,
  type,
}) => {
  // Calculate aging balance data for chart
  const agingBalanceData = {
    '0-30': bills
      .filter((bill: any) => {
        const dueDate = new Date(bill.dueDate);
        const now = new Date();
        const diffDays = Math.ceil(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return diffDays >= 0 && diffDays <= 30;
      })
      .reduce(
        (sum: number, bill: any) => sum + (parseFloat(bill.invoiceTotal) || 0),
        0
      ),
    '31-60': bills
      .filter((bill: any) => {
        const dueDate = new Date(bill.dueDate);
        const now = new Date();
        const diffDays = Math.ceil(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return diffDays >= 31 && diffDays <= 60;
      })
      .reduce(
        (sum: number, bill: any) => sum + (parseFloat(bill.invoiceTotal) || 0),
        0
      ),
    '61-90': bills
      .filter((bill: any) => {
        const dueDate = new Date(bill.dueDate);
        const now = new Date();
        const diffDays = Math.ceil(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return diffDays >= 61 && diffDays <= 90;
      })
      .reduce(
        (sum: number, bill: any) => sum + (parseFloat(bill.invoiceTotal) || 0),
        0
      ),
    '90+': bills
      .filter((bill: any) => {
        const dueDate = new Date(bill.dueDate);
        const now = new Date();
        const diffDays = Math.ceil(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return diffDays > 90;
      })
      .reduce(
        (sum: number, bill: any) => sum + (parseFloat(bill.invoiceTotal) || 0),
        0
      ),
  };

  // Calculate beneficiaries ranking
  const beneficiariesRanking = bills.reduce((acc: any, bill: any) => {
    const key =
      type === 'ap'
        ? bill.vendor?.name || 'Unknown Vendor'
        : bill.customer?.name || 'Unknown Customer';
    if (!acc[key]) acc[key] = 0;
    acc[key] += parseFloat(bill.invoiceTotal) || 0;
    return acc;
  }, {});
  const topBeneficiaries = Object.entries(beneficiariesRanking)
    .map(([name, amount]) => ({ name, amount: amount as number }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const chartTitle = 'Aging Balance Analysis';
  const beneficiariesTitle = type === 'ap' ? 'Top Vendors' : 'Top Customers';

  const agingChartOptions: ApexOptions = {
    chart: {
      id: 'aging-balance-chart',
      toolbar: { show: false },
      stacked: false,
    },
    xaxis: { categories: Object.keys(agingBalanceData) },
    yaxis: { labels: { formatter: (value) => formatCurrency(value) } },
    colors: ['#ef4444', '#f97316', '#eab308', '#dc2626'],
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      curve: 'smooth',
      lineCap: 'butt',
      width: 2,
      dashArray: 0,
    },
    tooltip: { y: { formatter: (value) => formatCurrency(value) } },
  };
  const agingChartSeries = [
    { name: 'Aging Balance', data: Object.values(agingBalanceData) },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Aging Balance Chart */}
      <div className="bg-white p-6 ">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">{chartTitle}</h3>
          <Info className="w-4 h-4 text-gray-400" />
        </div>
        <div className="h-64">
          <ApexChart
            type="bar"
            options={agingChartOptions}
            series={agingChartSeries}
            height={250}
          />
        </div>
      </div>
      {/* Beneficiaries Ranking */}
      <div className="bg-white p-6 ">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {beneficiariesTitle}
          </h3>
          <Info className="w-4 h-4 text-gray-400" />
        </div>
        {topBeneficiaries.length > 0 ? (
          <div className="space-y-3">
            {topBeneficiaries.map((beneficiary, index) => (
              <div
                key={beneficiary.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 flex items-center justify-center text-xs font-medium mr-3">
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-900 truncate max-w-32">
                    {beneficiary.name}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(beneficiary.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No data available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreasuryOverviewCharts;
