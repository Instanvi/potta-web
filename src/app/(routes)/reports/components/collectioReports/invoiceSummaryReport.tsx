import React from 'react';
import { Card, CardBody } from "@nextui-org/react";

import { DollarSign, Receipt, CreditCard, Calendar, TrendingUp } from 'lucide-react';
import { Invoice, InvoiceSummaryKPIs, ReportPeriod } from '../../utils/collectionTypes';
import { Table, TableCell, TableHeader, TableRow, TableBody } from '@potta/components/simpleTable';


interface InvoiceSummaryReportProps {
  reportPeriod: ReportPeriod;
  invoices: Invoice[];
  kpis: InvoiceSummaryKPIs;
}

const InvoiceSummaryReport: React.FC<InvoiceSummaryReportProps> = ({
  reportPeriod,
  invoices,
  kpis
}) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium">Invoice Summary Report</h1>
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
                <p className="text-sm text-gray-500">Total Invoice Amount</p>
                <p className="text-xl font-medium">${kpis.totalInvoiceAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Total Amount Paid</p>
                <p className="text-xl font-medium">${kpis.totalAmountPaid.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">Outstanding Balance</p>
                <p className="text-xl font-medium">${kpis.totalOutstandingBalance.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Number of Invoices</p>
                <p className="text-xl font-medium">{kpis.numberOfInvoices}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Paid Invoices</p>
                <p className="text-xl font-medium">{kpis.percentagePaidInvoices}%</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Invoices Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="font-medium">Invoice ID</TableCell>
              <TableCell className="font-medium">Customer</TableCell>
              <TableCell className="font-medium">Date</TableCell>
              <TableCell className="font-medium">Due Date</TableCell>
              <TableCell className="font-medium">Amount</TableCell>
              <TableCell className="font-medium">Paid</TableCell>
              <TableCell className="font-medium">Outstanding</TableCell>
              <TableCell className="font-medium">Status</TableCell>
              <TableCell className="font-medium">Payment Method</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.expenseId}>
                <TableCell>{invoice.expenseId}</TableCell>
                <TableCell>{invoice.customerName}</TableCell>
                <TableCell>{invoice.invoiceDate}</TableCell>
                <TableCell>{invoice.dueDate}</TableCell>
                <TableCell>${invoice.invoiceAmount.toLocaleString()}</TableCell>
                <TableCell>${invoice.amountPaid.toLocaleString()}</TableCell>
                <TableCell>${invoice.outstandingBalance.toLocaleString()}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    invoice.invoiceStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.invoiceStatus === 'unpaid' ? 'bg-red-100 text-red-800' :
                    invoice.invoiceStatus === 'overdue' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.invoiceStatus}
                  </span>
                </TableCell>
                <TableCell>{invoice.paymentMethod}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InvoiceSummaryReport;
