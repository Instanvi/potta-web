import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@potta/components/card';
import { FileText } from 'lucide-react';

const ReportCard = ({ report, icon }) => {
  const Icon = icon;
  if (report.title === 'Revenue Growth') {
    return (
      <Card className="h-full min-h-[350px] flex flex-col p-6 shadow-md">
        <CardHeader className="flex flex-row items-center gap-3 mb-2">
          <Icon className="h-5 w-5" />
          <CardTitle className="text-xl">Revenue Growth</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <div className="h-40 w-full mb-4">
            <svg width="100%" height="100%" viewBox="0 0 300 100">
              <polyline
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                points="0,80 50,60 100,65 150,40 200,30 250,20"
              />
            </svg>
          </div>
          <div className="flex flex-row justify-between mt-2">
            <div>
              <div className="text-xs text-gray-500">Current Month</div>
              <div className="text-lg font-medium text-green-700">$22,000</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Growth Rate</div>
              <div className="text-lg font-medium text-green-700">+10.5%</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">YTD Revenue</div>
              <div className="text-lg font-medium text-green-700">$101,000</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (report.title === 'Cash Flow') {
    return (
      <Card className="h-full min-h-[350px] flex flex-col p-6 shadow-md">
        <CardHeader className="flex flex-row items-center gap-3 mb-2">
          <Icon className="h-5 w-5" />
          <CardTitle className="text-xl">Cash Flow</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <div className="h-40 w-full mb-4">
            <svg width="100%" height="100%" viewBox="0 0 300 100">
              <rect x="10" y="40" width="30" height="50" fill="#3b82f6" />
              <rect x="50" y="30" width="30" height="60" fill="#3b82f6" />
              <rect x="90" y="35" width="30" height="55" fill="#3b82f6" />
              <rect x="130" y="10" width="30" height="80" fill="#3b82f6" />
              <rect x="170" y="0" width="30" height="90" fill="#3b82f6" />
              <rect x="210" y="10" width="30" height="80" fill="#3b82f6" />
              <rect x="10" y="60" width="30" height="30" fill="#ef4444" />
              <rect x="50" y="50" width="30" height="40" fill="#ef4444" />
              <rect x="90" y="55" width="30" height="35" fill="#ef4444" />
              <rect x="130" y="30" width="30" height="60" fill="#ef4444" />
              <rect x="170" y="20" width="30" height="70" fill="#ef4444" />
              <rect x="210" y="30" width="30" height="60" fill="#ef4444" />
            </svg>
          </div>
          <div className="flex flex-row justify-between mt-2">
            <div>
              <div className="text-xs text-gray-500">Net Cash Inflow</div>
              <div className="text-lg font-medium text-blue-700">$4,500</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Total Inflow</div>
              <div className="text-lg font-medium text-blue-700">$16,000</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Total Outflow</div>
              <div className="text-lg font-medium text-red-700">$11,500</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  // Default card for other reports
  return (
    <Card className="h-full min-h-[350px] flex flex-col p-6 shadow-md">
      <CardHeader className="flex flex-row items-center gap-3 mb-2">
        <Icon className="h-5 w-5" />
        <CardTitle className="text-xl">{report.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center items-center">
        <div className="text-gray-400">Chart or details coming soon...</div>
      </CardContent>
    </Card>
  );
};

export default ReportCard;
