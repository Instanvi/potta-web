import * as React from 'react';
import { Card, CardBody } from "@nextui-org/react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from'@potta/components/simpleTable';
import { Receipt, ArrowUpCircle, ArrowDownCircle, Calculator, DollarSign } from 'lucide-react';
import { ReportPeriod, VATSummaryKPIs, VATTransaction } from '../../utils/TaxTypes';


interface VATGSTReportProps {
  reportPeriod: ReportPeriod;
  transactions: VATTransaction[];
  kpis: VATSummaryKPIs;
}

const VATGSTReport: React.FC<VATGSTReportProps> = ({
  reportPeriod,
  transactions,
  kpis
}) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium">VAT/GST Report</h1>
        <div className="text-sm text-gray-500">
          <p>Period: {reportPeriod.startDate} - {reportPeriod.endDate}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">VAT Collected</p>
                <p className="text-xl font-medium">${kpis.totalVATCollected.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <ArrowDownCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">VAT Paid</p>
                <p className="text-xl font-medium">${kpis.totalVATPaid.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Net Liability</p>
                <p className="text-xl font-medium">${kpis.netVATLiability.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Taxable Sales</p>
                <p className="text-xl font-medium">${kpis.totalTaxableSales.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Taxable Purchases</p>
                <p className="text-xl font-medium">${kpis.totalTaxablePurchases.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Transactions Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="font-medium">Transaction ID</TableCell>
              <TableCell className="font-medium">Invoice #</TableCell>
              <TableCell className="font-medium">Type</TableCell>
              <TableCell className="font-medium">Transaction</TableCell>
              <TableCell className="font-medium">Taxable Amount</TableCell>
              <TableCell className="font-medium">Rate</TableCell>
              <TableCell className="font-medium">Tax Amount</TableCell>
              <TableCell className="font-medium">Date</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.transactionId}>
                <TableCell>{transaction.transactionId}</TableCell>
                <TableCell>{transaction.invoiceNumber}</TableCell>
                <TableCell>{transaction.taxType}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    transaction.transactionType === 'sale'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {transaction.transactionType}
                  </span>
                </TableCell>
                <TableCell>${transaction.taxableAmount.toLocaleString()}</TableCell>
                <TableCell>{transaction.taxRate}%</TableCell>
                <TableCell>${transaction.taxAmount.toLocaleString()}</TableCell>
                <TableCell>{transaction.transactionDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default VATGSTReport;
