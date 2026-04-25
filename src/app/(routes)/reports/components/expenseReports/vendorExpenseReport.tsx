import React from 'react';
import { Card, CardBody } from "@nextui-org/react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from'@potta/components/simpleTable';
import { Building, DollarSign, Receipt, TrendingUp, Tag } from 'lucide-react';
import { Expense, VendorExpenseKPIs, ReportPeriod } from '../../utils/expenseTypes';

interface VendorExpenseReportProps {
  reportPeriod: ReportPeriod;
  expenses: Expense[];
  kpis: VendorExpenseKPIs;
}

const VendorExpenseReport: React.FC<VendorExpenseReportProps> = ({
  reportPeriod,
  expenses,
  kpis
}) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium">Expenses by Vendor Report</h1>
        <div className="text-sm text-gray-500">
          <p>Period: {reportPeriod.startDate} - {reportPeriod.endDate}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Highest Spending Vendor</p>
                <p className="text-xl font-medium">{kpis.highestSpendingVendor}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Average Spend per Vendor</p>
                <p className="text-xl font-medium">${kpis.averageSpendPerVendor.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Most Common Category</p>
                <p className="text-xl font-medium">{kpis.mostCommonExpenseCategory}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Vendor Summary Table */}
      <Card>
        <CardBody className="p-4">
          <div className="rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Total Expenses</TableCell>
                  <TableCell>Number of Transactions</TableCell>
                  <TableCell>Average Transaction</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(kpis.totalExpensesByVendor).map(([vendor, total]) => (
                  <TableRow key={vendor}>
                    <TableCell>{vendor}</TableCell>
                    <TableCell>${total.toLocaleString()}</TableCell>
                    <TableCell>{kpis.transactionsByVendor[vendor]}</TableCell>
                    <TableCell>
                      ${(total / kpis.transactionsByVendor[vendor]).toLocaleString()}
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

export default VendorExpenseReport;
