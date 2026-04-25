import React, { FC } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { useQuery } from '@tanstack/react-query';
import axios from 'config/axios.config';

// Define your own type for series data
type ApexSeries = {
  name: string;
  data: number[];
};

interface ChartProps {}

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const Chart: FC<ChartProps> = () => {
  // Fetch budgets data
  const { data: budgetsData, isLoading } = useQuery({
    queryKey: ['budgets-chart'],
    queryFn: async () => {
      const response = await axios.get('/budgets');
      return response.data;
    },
  });

  const budgets = budgetsData?.data || [];

  // Group budget spending by month
  const getMonthlyBudgetData = () => {
    const monthlyData: Record<string, number> = {};

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
      monthlyData[monthKey] = 0;
    }

    // Aggregate budget spending data
    budgets.forEach((budget: any) => {
      if (budget.createdAt) {
        const budgetDate = new Date(budget.createdAt);
        const monthKey = budgetDate.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        });
        if (monthlyData[monthKey] !== undefined) {
          const spent =
            parseFloat(budget.totalAmount) - parseFloat(budget.availableAmount);
          monthlyData[monthKey] += spent;
        }
      }
    });

    return monthlyData;
  };

  const monthlyData = getMonthlyBudgetData();
  const categories = Object.keys(monthlyData);
  const budgetData = Object.values(monthlyData);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const options: ApexOptions = {
    chart: {
      id: 'budget-chart',
      toolbar: { show: false },
      stacked: false,
    },
    xaxis: {
      categories: categories,
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return formatCurrency(value);
        },
      },
    },
    colors: ['#A0E86F'],
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      curve: 'smooth',
      lineCap: 'butt',
      colors: undefined,
      width: 2,
      dashArray: 0,
    },
    tooltip: {
      y: {
        formatter: function (value) {
          return formatCurrency(value);
        },
      },
    },
  };

  const series: ApexSeries[] = [
    {
      name: 'Budget Spending',
      data: budgetData,
    },
  ];

  if (isLoading) {
    return (
      <div className="border p-3">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="border p-3 bg-white">
      <ApexChart type="bar" options={options} series={series} height={500} />
    </div>
  );
};

export default Chart;
