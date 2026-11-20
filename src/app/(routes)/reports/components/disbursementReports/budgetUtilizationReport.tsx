import React from 'react';
import { Card, CardBody, ScrollShadow} from '@nextui-org/react';
import {
  Download,
  Printer,
  PieChart,
  TrendingUp,
  DollarSign,
  Building,
} from 'lucide-react';
import {
  Budget,
  BudgetUtilizationKPIs,
  ReportPeriod,
} from '../../utils/disbursementTypes';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@potta/components/simpleTable';
import { Progress } from '@potta/components/progress';

interface BudgetUtilizationReportProps {
  reportPeriod: ReportPeriod;
  budgets: Budget[];
  kpis: BudgetUtilizationKPIs;
}

const BudgetUtilizationReport: React.FC<BudgetUtilizationReportProps> = ({
  reportPeriod,
  budgets,
  kpis,
}) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium">Budget Utilization Report</h1>
        <div className="space-x-2">
          <button className="inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium shadow-sm text-gray-700 bg-white hover:bg-gray-50">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <button className="inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium shadow-sm text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Report Period */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Report Period</p>
              <p className="font-medium">{`${reportPeriod.startDate} - ${reportPeriod.endDate}`}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Generated Date</p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
        <Card className="">
          <CardBody>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Total Budget </p>
                <p className="text-xl font-medium">
                  ${kpis.totalBudgetAllocated.toLocaleString()}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="">
          <CardBody>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Total Amount Spent</p>
                <p className="text-xl font-medium">
                  ${kpis.totalAmountSpent.toLocaleString()}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="">
          <CardBody>
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Utilization Rate</p>
                <p className="text-xl font-medium">
                  {kpis.overallUtilizationRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="">
          <CardBody>
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-5 w-5 text-green-500" />
              <p className="text-sm text-gray-500">Highest Utilization</p>
            </div>
            <p className="text-lg font-medium">
              {kpis.departmentWithHighestUtilization}
            </p>
          </CardBody>
        </Card>
        <Card className="">
          <CardBody>
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-5 w-5 text-red-500" />
              <p className="text-sm text-gray-500">Lowest Utilization</p>
            </div>
            <p className="text-lg font-medium">
              {kpis.departmentWithLowestUtilization}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Department Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card></Card>
      </div>

      {/* Budget Table */}
      <Card>
        <CardBody>
          <ScrollShadow className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Budget Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Allocated</TableCell>
                  <TableCell>Spent</TableCell>
                  <TableCell>Remaining</TableCell>
                  <TableCell>Utilization</TableCell>
                  <TableCell>Period</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((budget) => (
                  <TableRow key={budget.budgetId}>
                    <TableCell>{budget.budgetName}</TableCell>
                    <TableCell>{budget.department}</TableCell>
                    <TableCell>
                      ${budget.allocatedBudget.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      ${budget.amountSpent.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      ${budget.remainingBudget.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="w-full">
                      <Progress 
                        value={budget.utilizationPercentage} 
                        className={`h-2 w-full ${
                          budget.utilizationPercentage > 90
                            ? 'bg-red-500'
                            : budget.utilizationPercentage > 70
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        
                      />
                        <span className="">
                          {budget.utilizationPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{`${budget.startDate} - ${budget.endDate}`}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollShadow>
        </CardBody>
      </Card>
    </div>
  );
};

export default BudgetUtilizationReport;
