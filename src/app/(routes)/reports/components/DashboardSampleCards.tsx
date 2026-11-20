import React from 'react';
import ReportChartCard from './ReportChartCard';
import {
  Chart,
  LineElement,
  BarElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Tooltip,
  Legend,
  Title,
  Filler,
} from 'chart.js';
Chart.register(
  LineElement,
  BarElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Tooltip,
  Legend,
  Title,
  Filler
);

// 1. Line chart: Revenue Trend (sharp lines)
const revenueLineData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Revenue',
      data: [12000, 100, 14000, 18000, 200, 22000],
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
const revenueLineOptions = {
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
  maintainAspectRatio: false,
  responsive: true,
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#15803d', font: { weight: 700 } },
    },
    y: {
      grid: { color: '#e6f9ed' },
      ticks: { color: '#15803d', font: { weight: 700 } },
      beginAtZero: true,
    },
  },
};

// 2. Bar chart: Expenses (vertical, many categories)
const expensesBarData = {
  labels: [
    'Marketing',
    'Payroll',
    'R&D',
    'Ops',
    'IT',
    'Sales',
    'Finance',
    'HR',
    'Service',
    'Product',
  ],
  datasets: [
    {
      label: 'Expenses',
      data: [8000, 12000, 5000, 7000, 4000, 9500, 11000, 9000, 2000, 10000],
      backgroundColor: [
        '#bbf7d0',
        '#4ade80',
        '#22c55e',
        '#16a34a',
        '#86efac',
        '#a7f3d0',
        '#6ee7b7',
        '#34d399',
        '#10b981',
        '#059669',
      ],
      borderRadius: 0,
      borderSkipped: false,
      barPercentage: 0.5,
      categoryPercentage: 0.5,
    },
  ],
};
const expensesBarOptions = {
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
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

// 3. Horizontal Bar chart: Department Performance
const deptBarData = {
  labels: ['Sales', 'Support', 'Development', 'HR', 'Finance'],
  datasets: [
    {
      label: 'Performance',
      data: [85, 78, 92, 70, 88],
      backgroundColor: ['#22c55e', '#bbf7d0', '#4ade80', '#a7f3d0', '#16a34a'],
      borderRadius: 0,
      borderSkipped: false,
      barPercentage: 0.5,
      categoryPercentage: 0.5,
    },
  ],
};
const deptBarOptions = {
  indexAxis: 'y',
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
  maintainAspectRatio: false,
  responsive: true,
  scales: {
    x: {
      grid: { color: '#e6f9ed' },
      ticks: { color: '#15803d', font: { weight: 700 } },
      beginAtZero: true,
    },
    y: {
      grid: { display: false },
      ticks: { color: '#15803d', font: { weight: 700 } },
    },
  },
};

// 4. Multi-series Bar chart: Quarterly Revenue by Region
const regionBarData = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [
    {
      label: 'North',
      data: [5000, 7000, 8000, 9000],
      backgroundColor: '#22c55e',
    },
    {
      label: 'South',
      data: [4000, 6000, 7000, 8500],
      backgroundColor: '#bbf7d0',
    },
    {
      label: 'East',
      data: [3000, 5000, 6000, 7000],
      backgroundColor: '#4ade80',
    },
    {
      label: 'West',
      data: [3500, 5500, 6500, 7500],
      backgroundColor: '#a7f3d0',
    },
  ],
};
const regionBarOptions = {
  plugins: {
    legend: { display: true, position: 'bottom' },
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
      ticks: { color: '#15803d', font: { weight: 700 } },
      beginAtZero: true,
    },
  },
};

// 5. Area Line chart: Net Profit (Line with fill)
const profitAreaData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Net Profit',
      data: [2000, 2500, 1800, 3000, 3500, 4000],
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34,197,94,0.2)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#22c55e',
      pointBorderColor: '#22c55e',
      pointRadius: 4,
    },
  ],
};
const profitAreaOptions = {
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
  maintainAspectRatio: false,
  responsive: true,
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#15803d', font: { weight: 700 } },
    },
    y: {
      grid: { color: '#e6f9ed' },
      ticks: { color: '#15803d', font: { weight: 700 } },
      beginAtZero: true,
    },
  },
};

// 6. Stepped Line chart: Invoice Payments
const invoiceLineData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [
    {
      label: 'Payments',
      data: [1000, 3000, 2000, 4000],
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34,197,94,0.1)',
      tension: 0,
      stepped: true,
      fill: false,
      pointBackgroundColor: '#22c55e',
      pointBorderColor: '#22c55e',
      pointRadius: 4,
    },
  ],
};
const invoiceLineOptions = {
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
  maintainAspectRatio: false,
  responsive: true,
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#15803d', font: { weight: 700 } },
    },
    y: {
      grid: { color: '#e6f9ed' },
      ticks: { color: '#15803d', font: { weight: 700 } },
      beginAtZero: true,
    },
  },
};



// Customer Segments as a Bar chart
const customerSegmentsBarData = {
  labels: ['Enterprise', 'SMB', 'Consumer'],
  datasets: [
    {
      label: 'Customers',
      data: [120, 105, 75],
      backgroundColor: ['#22c55e', '#bbf7d0', '#4ade80'],
      borderRadius: 0,
      borderSkipped: false,
      barPercentage: 0.5,
      categoryPercentage: 0.5,
    },
  ],
};
const customerSegmentsBarOptions = {
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
  maintainAspectRatio: false,
  responsive: true,
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#15803d', font: { weight: 700 } },
    },
    y: {
      grid: { color: '#e6f9ed' },
      ticks: { color: '#15803d', font: { weight: 700 } },
      beginAtZero: true,
    },
  },
};

export const reportCharts = {
  ar_turnover: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'AR Turnover Ratio',
          data: [6.2, 7.1, 6.8, 7.5],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'AR Turnover Ratio',
    description: 'How many times receivables are collected per period.',
    summary: <span className="text-green-600">Q4: 7.5</span>,
  },
  ar_aging: {
    chartType: 'bar',
    data: {
      labels: ['0-30d', '31-60d', '61-90d', '90+d'],
      datasets: [
        {
          label: 'AR Aging ($)',
          data: [12000, 8000, 3000, 1000],
          backgroundColor: ['#22c55e', '#bbf7d0', '#4ade80', '#a7f3d0'],
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'AR Aging',
    description: 'Distribution of receivables by age.',
    summary: <span className="text-green-600">0-30d: $12,000</span>,
  },
  avg_collection: {
    chartType: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Avg Collection Period (days)',
          data: [32, 30, 28, 29, 27, 26],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          tension: 0,
          fill: true,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#22c55e',
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Average Collection Period',
    description: 'Average number of days to collect receivables.',
    summary: <span className="text-green-600">Latest: 26 days</span>,
  },
  bill_rate: {
    chartType: 'bar',
    data: {
      labels: ['Product A', 'Product B', 'Product C'],
      datasets: [
        {
          label: 'Bill Rate ($)',
          data: [120, 95, 110],
          backgroundColor: ['#22c55e', '#bbf7d0', '#4ade80'],
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Bill Rate',
    description: 'Average billing rate by product.',
    summary: <span className="text-green-600">Product A: $120</span>,
  },
  billable_util: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Billable Utilization Rate (%)',
          data: [78, 82, 80, 85],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Billable Utilization Rate',
    description: 'Percentage of billable hours worked.',
    summary: <span className="text-green-600">Q4: 85%</span>,
  },
  collections_effectiveness: {
    chartType: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Collections Effectiveness Index',
          data: [92, 95, 97, 96, 98, 99],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#22c55e',
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Collections Effectiveness Index',
    description: 'Measures the effectiveness of collections efforts.',
    summary: <span className="text-green-600">Latest: 99</span>,
  },
  collections: {
    chartType: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Collections ($)',
          data: [15000, 17000, 16000, 18000, 20000, 21000],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Collections',
    description: 'Total collections by month.',
    summary: <span className="text-green-600">June: $21,000</span>,
  },
  dso: {
    chartType: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Days Sales Outstanding',
          data: [42, 40, 38, 37, 36, 35],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          tension: 0,
          fill: true,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#22c55e',
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Days Sales Outstanding',
    description: 'Average number of days to collect payment after a sale.',
    summary: <span className="text-green-600">Latest: 35 days</span>,
  },
  // Bookings and Customers
  acl: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Avg Contract Length (months)',
          data: [12, 14, 13, 15],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Average Contract Length (ACL)',
    description: 'Average duration of contracts signed.',
    summary: <span className="text-green-600">Q4: 15 months</span>,
  },
  asp: {
    chartType: 'bar',
    data: {
      labels: ['Product A', 'Product B', 'Product C'],
      datasets: [
        {
          label: 'Average Sale Price ($)',
          data: [12000, 9500, 11000],
          backgroundColor: ['#22c55e', '#bbf7d0', '#4ade80'],
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Average Sale Price (ASP)',
    description: 'Average sale price by product.',
    summary: <span className="text-green-600">Product A: $12,000</span>,
  },
  cac_payback: {
    chartType: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'CAC Payback Period (months)',
          data: [14, 13, 12, 11, 10, 9],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          tension: 0,
          fill: true,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#22c55e',
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'CAC Payback Period',
    description: 'Months to recoup customer acquisition cost.',
    summary: <span className="text-green-600">Latest: 9 months</span>,
  },
  churn_rate: {
    chartType: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Churn Rate (%)',
          data: [5.2, 4.8, 4.5, 4.2, 4.0, 3.8],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#22c55e',
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Churn Rate',
    description: 'Percentage of customers lost per month.',
    summary: <span className="text-green-600">Latest: 3.8%</span>,
  },
  cost_to_serve: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Cost to Serve ($)',
          data: [2000, 2100, 1900, 1800],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Cost to Serve',
    description: 'Average cost to serve a customer.',
    summary: <span className="text-green-600">Q4: $1,800</span>,
  },
  customer_count: {
    chartType: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Customer Count',
          data: [120, 130, 140, 150, 160, 170],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Customer Count',
    description: 'Total number of customers by month.',
    summary: <span className="text-green-600">June: 170</span>,
  },
  customer_retention_cost: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Retention Cost ($)',
          data: [500, 600, 550, 520],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Customer Retention Cost',
    description: 'Cost to retain a customer per quarter.',
    summary: <span className="text-green-600">Q4: $520</span>,
  },
  negative_churn: {
    chartType: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Negative Churn (%)',
          data: [1.2, 1.5, 1.7, 1.8, 2.0, 2.2],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#22c55e',
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Negative Churn',
    description: 'Expansion revenue from existing customers.',
    summary: <span className="text-green-600">Latest: 2.2%</span>,
  },
  ltv_cac: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'LTV/CAC Ratio',
          data: [3.2, 3.5, 3.7, 3.9],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'LTV/CAC Ratio',
    description: 'Customer lifetime value to acquisition cost ratio.',
    summary: <span className="text-green-600">Q4: 3.9</span>,
  },
  logo_retention: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Logo Retention (%)',
          data: [95, 96, 97, 98],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Logo Retention',
    description: 'Percentage of customers retained by logo.',
    summary: <span className="text-green-600">Q4: 98%</span>,
  },
  renewal_rate: {
    chartType: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Renewal Rate (%)',
          data: [88, 90, 91, 92, 93, 94],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#22c55e',
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Renewal Rate',
    description: 'Percentage of customers who renew contracts.',
    summary: <span className="text-green-600">Latest: 94%</span>,
  },
  bookings: {
    chartType: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Bookings ($)',
          data: [25000, 27000, 26000, 28000, 30000, 32000],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Bookings',
    description: 'Total bookings by month.',
    summary: <span className="text-green-600">June: $32,000</span>,
  },
  customer_attrition: {
    chartType: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Customer Attrition (%)',
          data: [2.1, 2.3, 2.0, 1.9, 1.8, 1.7],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#22c55e',
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Customer Attrition',
    description: 'Percentage of customers lost per month.',
    summary: <span className="text-green-600">Latest: 1.7%</span>,
  },
  // Cashflow and Expenses
  ap_aging: {
    chartType: 'bar',
    data: {
      labels: ['0-30d', '31-60d', '61-90d', '90d+'],
      datasets: [
        {
          label: 'AP Aging ($)',
          data: [12000, 8000, 4000, 2000],
          backgroundColor: ['#22c55e', '#bbf7d0', '#4ade80', '#a7f3d0'],
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'AP Aging',
    description: 'Outstanding payables by age bucket.',
    summary: <span className="text-green-600">0-30d: $12,000</span>,
  },
  ap_turnover: {
    chartType: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'AP Turnover Ratio',
          data: [7.2, 7.5, 7.1, 7.3, 7.6, 7.8],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          tension: 0,
          fill: true,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#22c55e',
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'AP Turnover Ratio',
    description: 'Ratio of purchases to average accounts payable.',
    summary: <span className="text-green-600">Latest: 7.8</span>,
  },
  burn_multiple: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Burn Multiple',
          data: [1.2, 1.1, 1.3, 1.0],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Burn Multiple',
    description: 'Net cash burned per dollar of net new revenue.',
    summary: <span className="text-green-600">Q4: 1.0</span>,
  },
  capital_efficiency: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Capital Efficiency',
          data: [0.8, 1.0, 1.1, 1.2],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Capital Efficiency',
    description: 'Revenue generated per dollar spent.',
    summary: <span className="text-green-600">Q4: 1.2</span>,
  },
  cfoa: {
    chartType: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Cash Flow from Operating Activities ($)',
          data: [12000, 14000, 13500, 15000, 16000, 17000],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Cash Flow from Operating Activities',
    description: 'Net cash generated from core business operations.',
    summary: <span className="text-green-600">June: $17,000</span>,
  },
  dpo: {
    chartType: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Days Payable Outstanding',
          data: [45, 47, 44, 46, 48, 50],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          tension: 0,
          fill: true,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#22c55e',
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Days Payable Outstanding',
    description: 'Average number of days to pay suppliers.',
    summary: <span className="text-green-600">Latest: 50 days</span>,
  },
  gross_margin: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Gross Margin (%)',
          data: [62, 64, 65, 67],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Gross Margin',
    description: 'Gross profit as a percentage of revenue.',
    summary: <span className="text-green-600">Q4: 67%</span>,
  },
  expense_dashboard: {
    chartType: 'bar',
    data: {
      labels: ['Payroll', 'Rent', 'Marketing', 'R&D', 'Other'],
      datasets: [
        {
          label: 'Expenses ($)',
          data: [9000, 3000, 2500, 2000, 1500],
          backgroundColor: [
            '#22c55e',
            '#bbf7d0',
            '#4ade80',
            '#a7f3d0',
            '#6ee7b7',
          ],
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Expense Dashboard',
    description: 'Breakdown of expenses by category.',
    summary: <span className="text-green-600">Payroll: $9,000</span>,
  },
  net_burn: {
    chartType: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Net Burn ($)',
          data: [5000, 4800, 4700, 4600, 4500, 4400],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          tension: 0,
          fill: true,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#22c55e',
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Net Burn',
    description: 'Net cash outflow per month.',
    summary: <span className="text-green-600">June: $4,400</span>,
  },
  rnd_payback: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'R&D Payback Ratio',
          data: [1.5, 1.6, 1.7, 1.8],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'R&D Payback Ratio',
    description: 'Revenue generated per dollar spent on R&D.',
    summary: <span className="text-green-600">Q4: 1.8</span>,
  },
  ebitda: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'EBITDA ($)',
          data: [8000, 8500, 9000, 9500],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'EBITDA',
    description:
      'Earnings before interest, taxes, depreciation, and amortization.',
    summary: <span className="text-green-600">Q4: $9,500</span>,
  },
  // Headcount
  headcount: {
    chartType: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Headcount',
          data: [50, 52, 54, 56, 58, 60],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Headcount',
    description: 'Total number of employees over time.',
    summary: <span className="text-green-600">June: 60</span>,
  },
  accrued_payroll: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Accrued Payroll Cost ($)',
          data: [120000, 125000, 130000, 135000],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Accrued Payroll Cost',
    description: 'Total payroll costs accrued per quarter.',
    summary: <span className="text-green-600">Q4: $135,000</span>,
  },
  fully_burdened_labor: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Fully Burdened Labor Rate ($)',
          data: [95000, 97000, 99000, 101000],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Fully Burdened Labor Rate',
    description: 'Total cost per employee including benefits.',
    summary: <span className="text-green-600">Q4: $101,000</span>,
  },
  hr_to_employee: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'HR to Employee Ratio',
          data: [1 / 50, 1 / 52, 1 / 54, 1 / 56],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'HR to Employee Ratio',
    description: 'Ratio of HR staff to total employees.',
    summary: <span className="text-green-600">Q4: 1/56</span>,
  },
  headcount_metrics: {
    chartType: 'bar',
    data: {
      labels: ['Engineering', 'Sales', 'Support', 'HR', 'Finance'],
      datasets: [
        {
          label: 'Headcount by Department',
          data: [20, 15, 10, 8, 7],
          backgroundColor: [
            '#22c55e',
            '#bbf7d0',
            '#4ade80',
            '#a7f3d0',
            '#6ee7b7',
          ],
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Headcount Metrics',
    description: 'Headcount by department.',
    summary: <span className="text-green-600">Engineering: 20</span>,
  },
  cost_of_labor: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Cost of Labor ($)',
          data: [80000, 82000, 84000, 86000],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Cost of Labor',
    description: 'Total labor costs per quarter.',
    summary: <span className="text-green-600">Q4: $86,000</span>,
  },
  employee_turnover: {
    chartType: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Employee Turnover (%)',
          data: [2.5, 2.3, 2.1, 2.0, 1.9, 1.8],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#22c55e',
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Employee Turnover Metrics',
    description: 'Monthly employee turnover rate.',
    summary: <span className="text-green-600">June: 1.8%</span>,
  },
  workforce_planning: {
    chartType: 'bar',
    data: {
      labels: ['Planned', 'Actual'],
      datasets: [
        {
          label: 'Workforce Planning',
          data: [62, 60],
          backgroundColor: ['#22c55e', '#bbf7d0'],
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Workforce Planning Metrics',
    description: 'Comparison of planned vs actual headcount.',
    summary: <span className="text-green-600">Actual: 60</span>,
  },
  // Revenue, ARR and MRR
  accrued_revenue: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Accrued Revenue ($)',
          data: [40000, 42000, 45000, 47000],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Accrued Revenue',
    description: 'Revenue earned but not yet received.',
    summary: <span className="text-green-600">Q4: $47,000</span>,
  },
  arr: {
    chartType: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Annual Recurring Revenue ($)',
          data: [120000, 125000, 130000, 135000, 140000, 145000],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          tension: 0,
          fill: true,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#22c55e',
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Annual Recurring Revenue (ARR)',
    description: 'Total annual recurring revenue.',
    summary: <span className="text-green-600">June: $145,000</span>,
  },
  mrr: {
    chartType: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Monthly Recurring Revenue ($)',
          data: [10000, 10500, 11000, 11500, 12000, 12500],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          tension: 0,
          fill: true,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#22c55e',
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Monthly Recurring Revenue (MRR)',
    description: 'Total monthly recurring revenue.',
    summary: <span className="text-green-600">June: $12,500</span>,
  },
  gross_sales: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Gross Sales ($)',
          data: [50000, 52000, 54000, 56000],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Gross Sales',
    description: 'Total sales before deductions.',
    summary: <span className="text-green-600">Q4: $56,000</span>,
  },
  deferred_revenue: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Deferred Revenue ($)',
          data: [8000, 9000, 9500, 10000],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Deferred Revenue',
    description: 'Revenue received but not yet earned.',
    summary: <span className="text-green-600">Q4: $10,000</span>,
  },
  pipeline_coverage: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Pipeline Coverage Ratio',
          data: [2.5, 2.7, 2.8, 3.0],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Pipeline Coverage Ratio',
    description: 'Ratio of pipeline to quota.',
    summary: <span className="text-green-600">Q4: 3.0</span>,
  },
  projected_revenue: {
    chartType: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Projected Revenue ($)',
          data: [11000, 12000, 13000, 14000, 15000, 16000],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          tension: 0,
          fill: true,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#22c55e',
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Projected Revenue',
    description: 'Forecasted revenue for upcoming months.',
    summary: <span className="text-green-600">June: $16,000</span>,
  },
  revenue_backlog: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Revenue Backlog ($)',
          data: [15000, 16000, 17000, 18000],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Revenue Backlog',
    description: 'Revenue contracted but not yet recognized.',
    summary: <span className="text-green-600">Q4: $18,000</span>,
  },
  revenue_per_employee: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Revenue Per Employee ($)',
          data: [800, 850, 900, 950],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Revenue Per Employee',
    description: 'Average revenue generated per employee.',
    summary: <span className="text-green-600">Q4: $950</span>,
  },
  rule_of_40: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Rule of 40 (%)',
          data: [42, 44, 45, 47],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Rule of 40',
    description: 'Growth rate plus profit margin should exceed 40%.',
    summary: <span className="text-green-600">Q4: 47%</span>,
  },
  tcv: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Total Contract Value ($)',
          data: [20000, 22000, 24000, 26000],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Total Contract Value (TCV)',
    description: 'Sum of all contract values signed.',
    summary: <span className="text-green-600">Q4: $26,000</span>,
  },
  rpo: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Remaining Performance Obligation ($)',
          data: [10000, 11000, 12000, 13000],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Remaining Performance Obligation (RPO)',
    description: 'Revenue expected from existing contracts.',
    summary: <span className="text-green-600">Q4: $13,000</span>,
  },
  unearned_revenue: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Unearned Revenue ($)',
          data: [3000, 3500, 4000, 4500],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Unearned Revenue',
    description: 'Revenue received for future services.',
    summary: <span className="text-green-600">Q4: $4,500</span>,
  },
  weighted_pipeline: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Weighted Pipeline / Revenue',
          data: [1.8, 2.0, 2.2, 2.4],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Weighted Pipeline / Revenue',
    description: 'Weighted pipeline as a ratio of revenue.',
    summary: <span className="text-green-600">Q4: 2.4</span>,
  },
  // Sales Performance
  avg_deal_size: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Average Deal Size ($)',
          data: [12000, 13000, 12500, 14000],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Average Deal Size',
    description: 'Average value of closed deals.',
    summary: <span className="text-green-600">Q4: $14,000</span>,
  },
  avg_sales_cycle: {
    chartType: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Average Sales Cycle (days)',
          data: [45, 43, 42, 40, 39, 38],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          tension: 0,
          fill: true,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#22c55e',
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Average Sales Cycle',
    description: 'Average time to close a deal.',
    summary: <span className="text-green-600">June: 38 days</span>,
  },
  closed_won_lost: {
    chartType: 'bar',
    data: {
      labels: ['Closed Won', 'Closed Lost'],
      datasets: [
        {
          label: 'Deals',
          data: [80, 20],
          backgroundColor: ['#22c55e', '#bbf7d0'],
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Closed Won/Lost Summary',
    description: 'Number of deals closed won vs lost.',
    summary: <span className="text-green-600">Won: 80</span>,
  },
  closing_rate: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Closing Rate (%)',
          data: [32, 34, 36, 38],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Closing Rate',
    description: 'Percentage of deals closed.',
    summary: <span className="text-green-600">Q4: 38%</span>,
  },
  cost_per_lead: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Cost Per Lead ($)',
          data: [50, 48, 47, 45],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Cost Per Lead',
    description: 'Average cost to acquire a lead.',
    summary: <span className="text-green-600">Q4: $45</span>,
  },
  cost_per_opportunity: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Cost Per Opportunity ($)',
          data: [200, 190, 185, 180],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Cost Per Opportunity',
    description: 'Average cost to create a sales opportunity.',
    summary: <span className="text-green-600">Q4: $180</span>,
  },
  pipeline_generation: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Pipeline Generation ($)',
          data: [30000, 32000, 34000, 36000],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Pipeline Generation',
    description: 'Total value of new pipeline created.',
    summary: <span className="text-green-600">Q4: $36,000</span>,
  },
  roas: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Return on Ad Spend (ROAS)',
          data: [4.2, 4.5, 4.7, 5.0],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Return on Ad Spend (ROAS)',
    description: 'Revenue generated per dollar spent on ads.',
    summary: <span className="text-green-600">Q4: 5.0</span>,
  },
  sales_conversion_rate: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Sales Conversion Rate (%)',
          data: [18, 20, 22, 24],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Sales Conversion Rate',
    description: 'Percentage of leads converted to sales.',
    summary: <span className="text-green-600">Q4: 24%</span>,
  },
  sales_funnel: {
    chartType: 'bar',
    data: {
      labels: ['Leads', 'Opportunities', 'Proposals', 'Closed'],
      datasets: [
        {
          label: 'Sales Funnel',
          data: [1000, 400, 150, 80],
          backgroundColor: ['#22c55e', '#bbf7d0', '#4ade80', '#a7f3d0'],
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Sales Funnel Metrics',
    description: 'Stages of the sales funnel.',
    summary: <span className="text-green-600">Closed: 80</span>,
  },
  quota_attainment: {
    chartType: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Quota Attainment (%)',
          data: [85, 88, 90, 92],
          backgroundColor: '#22c55e',
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Quota Attainment',
    description: 'Percentage of sales reps meeting quota.',
    summary: <span className="text-green-600">Q4: 92%</span>,
  },
  sales_rep_ramp: {
    chartType: 'line',
    data: {
      labels: [
        'Month 1',
        'Month 2',
        'Month 3',
        'Month 4',
        'Month 5',
        'Month 6',
      ],
      datasets: [
        {
          label: 'Sales Rep Ramp ($)',
          data: [2000, 4000, 6000, 8000, 10000, 12000],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          tension: 0,
          fill: true,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#22c55e',
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Sales Rep Ramp',
    description: 'Ramp-up of new sales reps.',
    summary: <span className="text-green-600">Month 6: $12,000</span>,
  },
  sales_velocity: {
    chartType: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Sales Velocity ($)',
          data: [5000, 5200, 5400, 5600, 5800, 6000],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          tension: 0,
          fill: true,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#22c55e',
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Sales Velocity',
    description: 'Speed at which deals move through the pipeline.',
    summary: <span className="text-green-600">June: $6,000</span>,
  },
  sales_funnel_conversion: {
    chartType: 'bar',
    data: {
      labels: ['Leads', 'Opportunities', 'Proposals', 'Closed'],
      datasets: [
        {
          label: 'Funnel Conversion Rate (%)',
          data: [10, 25, 60, 80],
          backgroundColor: ['#22c55e', '#bbf7d0', '#4ade80', '#a7f3d0'],
          borderRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#15803d', font: { weight: 700 } },
        },
        y: {
          grid: { color: '#e6f9ed' },
          ticks: { color: '#15803d', font: { weight: 700 } },
          beginAtZero: true,
        },
      },
    },
    title: 'Sales Funnel Conversion Rate',
    description: 'Conversion rates at each funnel stage.',
    summary: <span className="text-green-600">Closed: 80%</span>,
  },
};

const DashboardSampleCards = () => (
  <>
    <ReportChartCard
      title="Revenue Trend"
      description="Monthly revenue trend for the current year."
      chartType="line"
      data={revenueLineData}
      options={revenueLineOptions}
      summary={<span className="text-green-600">+18% YTD</span>}
    />
    <ReportChartCard
      title="Expenses Breakdown"
      description="Breakdown of expenses by department."
      chartType="bar"
      data={expensesBarData}
      options={expensesBarOptions}
      summary={<span className="text-green-600">Top: Payroll</span>}
    />
    <ReportChartCard
      title="Department Performance"
      description="Performance scores by department."
      chartType="bar"
      data={deptBarData}
      options={deptBarOptions}
      summary={<span className="text-green-600">Best: Development</span>}
    />
    <ReportChartCard
      title="Quarterly Revenue by Region"
      description="Revenue by region for each quarter."
      chartType="bar"
      data={regionBarData}
      options={regionBarOptions}
      summary={<span className="text-green-600">Q4 Highest: North</span>}
    />
    <ReportChartCard
      title="Net Profit"
      description="Net profit trend (area line)."
      chartType="line"
      data={profitAreaData}
      options={profitAreaOptions}
      summary={<span className="text-green-600">+100% since Jan</span>}
    />
    <ReportChartCard
      title="Invoice Payments"
      description="Weekly invoice payment trend (stepped line)."
      chartType="line"
      data={invoiceLineData}
      options={invoiceLineOptions}
      summary={<span className="text-green-600">+300% in 4 weeks</span>}
    />
    <ReportChartCard
      title="Customer Segments"
      description="Distribution of customers by segment."
      chartType="bar"
      data={customerSegmentsBarData}
      options={customerSegmentsBarOptions}
      summary={<span className="text-green-600">Top: Enterprise</span>}
    />
  </>
);

export default DashboardSampleCards;
