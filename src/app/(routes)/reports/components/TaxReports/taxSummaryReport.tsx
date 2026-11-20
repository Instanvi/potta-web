import * as React from 'react';
import { Card, CardBody } from "@nextui-org/react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@potta/components/simpleTable';
import { Calculator, DollarSign, Receipt, AlertCircle, PieChart } from 'lucide-react';
import { ReportPeriod, TaxSummaryKPIs, TaxTransaction } from '../../utils/TaxTypes';


interface TaxSummaryReportProps {
  reportPeriod: ReportPeriod;
  transactions: TaxTransaction[];
  kpis: TaxSummaryKPIs;
}

const TaxSummaryReport: React.FC<TaxSummaryReportProps> = ({
  reportPeriod,
  transactions,
  kpis
}) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium">Tax Summary Report</h1>
        <div className="text-sm text-gray-500">
          <p>Period: {reportPeriod.startDate} - {reportPeriod.endDate}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Taxable Amount</p>
                <p className="text-xl font-medium">${kpis.totalTaxableAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Tax Collected</p>
                <p className="text-xl font-medium">${kpis.totalTaxCollected.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Tax Paid</p>
                <p className="text-xl font-medium">${kpis.totalTaxPaid.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">Outstanding</p>
                <p className="text-xl font-medium">${kpis.outstandingTaxLiability.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Tax Types</p>
                <p className="text-xl font-medium">{kpis.taxTypesCollected.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tax Types Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardBody className="p-4">
            <h2 className="text-lg font-medium mb-4">Tax Types Breakdown</h2>
            <div className="space-y-2">
              {kpis.taxTypesCollected.map((type) => (
                <div key={type.taxType} className="flex justify-between items-center">
                  <span>{type.taxType}</span>
                  <div className="flex gap-4">
                    <span className="text-gray-500">Count: {type.count}</span>
                    <span className="font-medium">${type.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Transactions Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="font-medium">Tax ID</TableCell>
              <TableCell className="font-medium">Type</TableCell>
              <TableCell className="font-medium">Taxable Amount</TableCell>
              <TableCell className="font-medium">Rate</TableCell>
              <TableCell className="font-medium">Tax Amount</TableCell>
              <TableCell className="font-medium">Date Paid</TableCell>
              <TableCell className="font-medium">Status</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tax) => (
              <TableRow key={tax.taxId}>
                <TableCell>{tax.taxId}</TableCell>
                <TableCell>{tax.taxType}</TableCell>
                <TableCell>${tax.taxableAmount.toLocaleString()}</TableCell>
                <TableCell>{tax.taxRate}%</TableCell>
                <TableCell>${tax.taxAmount.toLocaleString()}</TableCell>
                <TableCell>{tax.datePaid}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    tax.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {tax.paymentStatus}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TaxSummaryReport;
