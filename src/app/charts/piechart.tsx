// components/DonutChart.tsx

import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import React from 'react';

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface PieChartData {
  name: string;
  value: number;
}

interface DonutChartProps {
  data?: PieChartData[];
  title?: string;
  width?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({
  data = [],
  title = 'Expense Distribution',
  width = 380,
}) => {
  // Transform data for ApexCharts
  const series = data.map((item) => item.value);
  const labels = data.map((item) => item.name);

  const options: ApexOptions = {
    series: series,
    chart: {
      width: width,
      type: 'donut',
    },
    labels: labels,
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 270,
      },
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: 'gradient',
    },
    legend: {
      formatter: function (val, opts) {
        const value = opts.w.globals.series[opts.seriesIndex];
        return (
          val +
          ' - ' +
          new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(value)
        );
      },
    },
    title: {
      text: title,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  return (
    <div id="chart">
      <ApexChart
        options={options}
        series={options.series}
        type="donut"
        width={width}
      />
    </div>
  );
};

export default DonutChart;
