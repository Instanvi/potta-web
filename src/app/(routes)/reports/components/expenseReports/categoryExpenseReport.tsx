import React from 'react';
import { Card, CardBody } from "@nextui-org/react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from'@potta/components/simpleTable';
import { Tag, DollarSign, BarChart, CreditCard } from 'lucide-react';
import { Progress } from "@nextui-org/react";
import { CategoryExpenseKPIs, Expense, ReportPeriod,  } from '../../utils/expenseTypes';


interface CategoryExpenseReportProps {
  reportPeriod: ReportPeriod;
  expenses: Expense[];
  kpis: CategoryExpenseKPIs;
}

const CategoryExpenseReport: React.FC<CategoryExpenseReportProps> = ({
  reportPeriod,
  expenses,
  kpis
}) => {
  const totalExpenses = Object.values(kpis.totalExpensesByCategory).reduce((a, b) => a + b, 0);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium">Expenses by Category Report</h1>
        <div className="text-sm text-gray-500">
          <p>Period: {reportPeriod.startDate} - {reportPeriod.endDate}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Highest Spending Category</p>
                <p className="text-xl font-medium">{kpis.highestSpendingCategory}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Average per Category</p>
                <p className="text-xl font-medium">${kpis.averageSpendPerCategory.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Total Categories</p>
                <p className="text-xl font-medium">
                  {Object.keys(kpis.totalExpensesByCategory).length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Category Summary Table */}
      <Card>
        <CardBody className="p-4">
          <div className="rounded-md">
            <Table aria-label="Category expenses table">
              <TableHeader>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Total Expenses</TableCell>
                  <TableCell>Transactions</TableCell>
                  <TableCell>% of Total</TableCell>
                  <TableCell>Most Used Payment</TableCell>
                  <TableCell>Distribution</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(kpis.totalExpensesByCategory).map(([category, total]) => (
                  <TableRow key={category}>
                    <TableCell>{category}</TableCell>
                    <TableCell>${total.toLocaleString()}</TableCell>
                    <TableCell>{kpis.transactionsByCategory[category]}</TableCell>
                    <TableCell>
                      {((total / totalExpenses) * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell>{kpis.mostCommonPaymentMethodByCategory[category]}</TableCell>
                    <TableCell className="w-32">
                      <Progress
                        value={(total / totalExpenses) * 100}
                        className="w-full"
                        color="primary"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default CategoryExpenseReport;
