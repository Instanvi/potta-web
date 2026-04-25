import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@potta/components/card';
import { Bar } from 'react-chartjs-2';
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const data = {
  labels: [
    'Marketing',
    'Payroll',
    'R&D',
    'Operations',
    'IT',
    'Sales',
    'Admin',
    'Legal',
  ],
  datasets: [
    {
      label: 'Expenses',
      data: [8000, 12000, 5000, 7000, 4000, 9500, 3000, 2000],
      backgroundColor: [
        '#bbf7d0',
        '#4ade80',
        '#22c55e',
        '#16a34a',
        '#86efac',
        '#a7f3d0',
        '#6ee7b7',
        '#34d399',
      ],
      borderRadius: 0,
      borderSkipped: false,
      barPercentage: 0.45,
      categoryPercentage: 0.5,
    },
  ],
};

const options = {
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  maintainAspectRatio: false,
  responsive: true,
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#15803d', font: { weight: 700, size: 10 } },
    },
    y: {
      grid: { color: '#e6f9ed' },
      ticks: { color: '#15803d', font: { weight: 700 }, stepSize: 2000 },
      beginAtZero: true,
    },
  },
};

const ExpensesBreakdownCard: React.FC = () => (
  <div className="min-h-[200px] min-w-[400px]">
    <Card className="h-full min-h-[200px] min-w-[400px] flex flex-col p-2 rounded-none border border-gray-200">
      <CardHeader className="flex flex-col items-start gap-1 mb-2">
        <CardTitle className="text-xl text-black">Expenses Breakdown</CardTitle>
        <CardDescription className="text-xs mt-1 text-black">
          Visualizes the distribution of expenses across key categories. Useful
          for identifying cost drivers.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="flex-1 w-full h-32 md:h-40 lg:h-48 xl:h-56 2xl:h-64 mb-2 flex items-center justify-center">
          <Bar data={data} options={options} />
        </div>
        <div className="mt-3 text-xs flex items-center gap-1">
          <span className="font-medium text-black">Top Category:</span>
          <span className="text-green-600">Payroll ($12,000)</span>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default ExpensesBreakdownCard;
