import * as React from 'react';
import { Card, CardBody } from "@nextui-org/react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@potta/components/simpleTable';
import { DollarSign, CreditCard, Receipt, Calculator, Repeat } from 'lucide-react';
import { SalesReceipt, SalesReceiptKPIs, ReportPeriod } from '../../utils/collectionTypes';

interface SalesReceiptReportProps {
  reportPeriod: ReportPeriod;
  salesReceipts: SalesReceipt[];
  kpis: SalesReceiptKPIs;
}

const SalesReceiptReport: React.FC<SalesReceiptReportProps> = ({
  reportPeriod,
  salesReceipts,
  kpis
}) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium">Sales Receipt Report</h1>
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
                <p className="text-sm text-gray-500">Total Transactions</p>
                <p className="text-xl font-medium">${kpis.totalTransactionAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Amount Received</p>
                <p className="text-xl font-medium">${kpis.totalAmountReceived.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Number of Transactions</p>
                <p className="text-xl font-medium">{kpis.numberOfTransactions}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Average Value</p>
                <p className="text-xl font-medium">${kpis.averageTransactionValue.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">Most Used Payment</p>
                <p className="text-xl font-medium">{kpis.mostUsedPaymentMethod}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Sales Receipts Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="font-medium">Receipt ID</TableCell>
              <TableCell className="font-medium">Customer</TableCell>
              <TableCell className="font-medium">Date</TableCell>
              <TableCell className="font-medium">Amount</TableCell>
              <TableCell className="font-medium">Received</TableCell>
              <TableCell className="font-medium">Payment Method</TableCell>
              <TableCell className="font-medium">Status</TableCell>
              <TableCell className="font-medium">Description</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salesReceipts.map((receipt) => (
              <TableRow key={receipt.receiptId}>
                <TableCell>{receipt.receiptId}</TableCell>
                <TableCell>{receipt.customerName}</TableCell>
                <TableCell>{receipt.receiptDate}</TableCell>
                <TableCell>${receipt.transactionAmount.toLocaleString()}</TableCell>
                <TableCell>${receipt.amountReceived.toLocaleString()}</TableCell>
                <TableCell>{receipt.paymentMethod}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    receipt.transactionStatus === 'completed' ? 'bg-green-100 text-green-800' :
                    receipt.transactionStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {receipt.transactionStatus}
                  </span>
                </TableCell>
                <TableCell>{receipt.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SalesReceiptReport;
