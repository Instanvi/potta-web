import React from 'react';
import { Card, CardBody, ScrollShadow } from "@nextui-org/react";
import { Download, Printer, TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@potta/components/simpleTable';
import { Payment, PaymentSummaryKPIs, ReportPeriod } from '../../utils/disbursementTypes';

interface PaymentSummaryReportProps {
  reportPeriod: ReportPeriod;
  payments: Payment[];
  kpis: PaymentSummaryKPIs;
}

const PaymentSummaryReport: React.FC<PaymentSummaryReportProps> = ({
  reportPeriod,
  payments,
  kpis
}) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium">Payment Summary Report</h1>
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Total Payments</p>
                <p className="text-xl font-medium">${kpis.totalPaymentsMade.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Number of Payments</p>
                <p className="text-xl font-medium">{kpis.numberOfPayments}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Common Method</p>
                <p className="text-xl font-medium">{kpis.mostCommonPaymentMethod}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Largest Payment</p>
                <p className="text-xl font-medium">${kpis.largestPayment.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">Outstanding</p>
                <p className="text-xl font-medium">{kpis.outstandingPayments}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardBody>
          <ScrollShadow className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Payment ID</TableCell>
                  <TableCell>Payee</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Invoice ID</TableCell>
                  <TableCell>Type</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.paymentId}>
                    <TableCell>{payment.paymentId}</TableCell>
                    <TableCell>{payment.payee}</TableCell>
                    <TableCell>{payment.paymentDate}</TableCell>
                    <TableCell>{payment.paymentMethod}</TableCell>
                    <TableCell>${payment.paymentAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        payment.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                        payment.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.paymentStatus}
                      </span>
                    </TableCell>
                    <TableCell>{payment.invoiceId || '-'}</TableCell>
                    <TableCell>{payment.disbursementType}</TableCell>
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

export default PaymentSummaryReport;
