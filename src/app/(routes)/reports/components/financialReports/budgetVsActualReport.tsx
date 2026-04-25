import * as React from 'react';
import { Card, CardBody } from "@nextui-org/react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@potta/components/simpleTable';
import { DollarSign, TrendingUp, AlertTriangle, BarChart2, PieChart } from 'lucide-react';
import { BudgetEntry, BudgetKPIs, ReportPeriod } from '../../utils/financialTypes';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface BudgetVsActualReportProps {
  reportPeriod: ReportPeriod;
  entries: BudgetEntry[];
  kpis: BudgetKPIs;
}

const BudgetVsActualReport: React.FC<BudgetVsActualReportProps> = ({
  reportPeriod,
  entries,
  kpis
}) => {
  // Prepare data for the chart
  const chartData = entries.map(entry => ({
    name: entry.category,
    Budget: entry.budgetedAmount,
    Actual: entry.actualAmount,
  }));

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium">Budget vs. Actual Report</h1>
        <div className="text-sm text-gray-500">
          <p>Period: {reportPeriod.startDate} - {reportPeriod.endDate}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Total Budget</p>
                <p className="text-xl font-medium">${kpis.totalBudgetedAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Total Actual</p>
                <p className="text-xl font-medium">${kpis.totalActualAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Total Variance</p>
                <p className="text-xl font-medium">${kpis.totalVariance.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Avg Variance %</p>
                <p className="text-xl font-medium">{kpis.averageVariancePercentage.toFixed(2)}%</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">Over Budget</p>
                <p className="text-xl font-medium">{kpis.overBudgetCategories}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardBody className="p-4">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Budget" fill="#3B82F6" />
                <Bar dataKey="Actual" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      {/* Budget vs Actual Table */}
      <Card>
        <CardBody className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="font-medium">Category</TableCell>
                <TableCell className="font-medium">Period</TableCell>
                <TableCell className="font-medium">Budgeted</TableCell>
                <TableCell className="font-medium">Actual</TableCell>
                <TableCell className="font-medium">Variance</TableCell>
                <TableCell className="font-medium">Variance %</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{entry.category}</TableCell>
                  <TableCell>{entry.period}</TableCell>
                  <TableCell>${entry.budgetedAmount.toLocaleString()}</TableCell>
                  <TableCell>${entry.actualAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={entry.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ${entry.variance.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={entry.variancePercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {entry.variancePercentage.toFixed(2)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};

export default BudgetVsActualReport;
