'use client';
import React, { useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface CollectionChartProps {
  data: any[];
  formatCurrency: (amount: number) => string;
}

const CollectionChart: React.FC<CollectionChartProps> = ({
  data,
  formatCurrency,
}) => {
  const { monthlyData, paymentMethodData } = useMemo(() => {
    // Group data by month
    const monthlyData: Record<string, number> = {};
    const paymentMethodData: Record<string, number> = {};

    data.forEach((invoice: any) => {
      // Monthly data
      if (invoice.issuedDate) {
        const date = new Date(invoice.issuedDate);
        const monthName = date.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        });

        if (!monthlyData[monthName]) {
          monthlyData[monthName] = 0;
        }
        monthlyData[monthName] += parseFloat(invoice.invoiceTotal) || 0;
      }

      // Payment method data
      const method = invoice.paymentMethod || 'OTHER';
      if (!paymentMethodData[method]) {
        paymentMethodData[method] = 0;
      }
      paymentMethodData[method] += parseFloat(invoice.invoiceTotal) || 0;
    });

    return { monthlyData, paymentMethodData };
  }, [data]);

  // Monthly chart data
  const monthlyChartData = useMemo(() => {
    const months = Object.keys(monthlyData).sort();
    const amounts = months.map((month) => monthlyData[month]);

    return {
      labels: months,
      datasets: [
        {
          label: 'Collection Amount',
          data: amounts,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [monthlyData]);

  // Payment method chart data
  const paymentMethodChartData = useMemo(() => {
    const methods = Object.keys(paymentMethodData);
    const amounts = methods.map((method) => paymentMethodData[method]);

    // Dynamic payment method labels - convert to readable format
    const labels = methods.map((method) => {
      // Convert UPPER_CASE to Title Case
      return method
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    });

    return {
      labels,
      datasets: [
        {
          data: amounts,
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)', // Green for Bank Transfer
            'rgba(59, 130, 246, 0.8)', // Blue for Mobile Money
            'rgba(245, 158, 11, 0.8)', // Yellow for Cash
            'rgba(239, 68, 68, 0.8)', // Red for Credit Card
            'rgba(107, 114, 128, 0.8)', // Gray for Other
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(107, 114, 128, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  }, [paymentMethodData]);

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Collection Trends',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `Collection: ${formatCurrency(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return formatCurrency(value);
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Payment Method Distribution',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(
              context.parsed
            )} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends Chart */}
        <div className="h-80">
          <Bar data={monthlyChartData} options={barOptions} />
        </div>

        {/* Payment Method Distribution Chart */}
        <div className="h-80">
          <Doughnut data={paymentMethodChartData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  );
};

export default CollectionChart;
