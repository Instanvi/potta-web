import React from 'react';
import { Card, CardBody } from "@nextui-org/react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@potta/components/simpleTable';
import { DollarSign, Receipt, TrendingUp, CreditCard, Calendar } from 'lucide-react';
import { Expense, ExpenseSummaryKPIs, ReportPeriod } from '../../utils/expenseTypes';


interface ExpenseSummaryReportProps {
  reportPeriod: ReportPeriod;
  expenses: Expense[];
  kpis: ExpenseSummaryKPIs;
}

const ExpenseSummaryReport: React.FC<ExpenseSummaryReportProps> = ({
  reportPeriod,
  expenses,
  kpis
}) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium">Expense Summary Report</h1>
        <div className="text-sm text-gray-500">
          <p>Period: {reportPeriod.startDate} - {reportPeriod.endDate}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Total Expenses</p>
                <p className="text-xl font-medium">${kpis.totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Transactions</p>
                <p className="text-xl font-medium">{kpis.numberOfTransactions}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Highest Category</p>
                <p className="text-xl font-medium">{kpis.highestExpenseCategory}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Average Amount</p>
                <p className="text-xl font-medium">${kpis.averageExpenseAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">Common Payment</p>
                <p className="text-xl font-medium">{kpis.mostUsedPaymentMethod}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardBody className="p-4">
          <div className="rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Vendor/Payee</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.expenseId}>
                    <TableCell>{expense.expenseId}</TableCell>
                    <TableCell>{expense.expenseCategory}</TableCell>
                    <TableCell>${expense.amount.toLocaleString()}</TableCell>
                    <TableCell>{expense.expenseDate}</TableCell>
                    <TableCell>{expense.paymentMethod}</TableCell>
                    <TableCell>{expense.vendorPayee}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        expense.expenseStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        expense.expenseStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {expense.expenseStatus}
                      </span>
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
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

export default ExpenseSummaryReport;
