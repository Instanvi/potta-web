import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@potta/components/card';
import { Line } from 'react-chartjs-2';
import {
  Chart,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
Chart.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Profit Margin %',
      data: [4, 30, 29, 5, 32, 34],
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34,197,94,0.1)',
      tension: 0,
      fill: true,
      pointBackgroundColor: '#22c55e',
      pointBorderColor: '#22c55e',
      pointRadius: 4,
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
      ticks: { color: '#15803d', font: { weight: 700 } },
    },
    y: {
      grid: { color: '#e6f9ed' },
      ticks: { color: '#15803d', font: { weight: 700 }, stepSize: 2 },
      beginAtZero: true,
      max: 40,
    },
  },
};

const ProfitMarginCard: React.FC = () => (
  <div className="min-h-[200px] min-w-[400px]">
    <Card className="h-full min-h-[200px] min-w-[400px] flex flex-col p-2 rounded-none border border-gray-200">
      <CardHeader className="flex flex-col items-start gap-1 mb-2">
        <CardTitle className="text-xl text-black">Profit Margin</CardTitle>
        <CardDescription className="text-xs mt-1 text-black">
          Shows the monthly profit margin trend. Higher margins indicate better
          profitability.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="flex-1 w-full h-32 md:h-40 lg:h-48 xl:h-56 2xl:h-64 mb-2 flex items-center justify-center">
          <Line data={data} options={options} />
        </div>
        <div className="flex flex-row justify-between mt-2">
          <div>
            <div className="text-xs text-black">Current Margin</div>
            <div className="text-lg font-medium text-black">34%</div>
          </div>
          <div>
            <div className="text-xs text-black">6-Month Avg</div>
            <div className="text-lg font-medium text-black">30.7%</div>
          </div>
        </div>
        <div className="mt-3 text-xs flex items-center gap-1">
          <span className="font-medium text-black">Trend:</span>
          <span className="text-green-600">+2% since Jan</span>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default ProfitMarginCard;
