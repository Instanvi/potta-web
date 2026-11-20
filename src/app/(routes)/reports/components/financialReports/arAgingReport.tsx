import * as React from 'react';
import { Card, CardBody } from "@nextui-org/react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@potta/components/simpleTable';
import { Clock, AlertCircle, Users, Calendar, TrendingUp } from 'lucide-react';
import { ARAgingEntry, ARAgingKPIs, ReportPeriod } from '../../utils/financialTypes';

interface ARAgingReportProps {
  reportPeriod: ReportPeriod;
  entries: ARAgingEntry[];
  kpis: ARAgingKPIs;
}

const ARAgingReport: React.FC<ARAgingReportProps> = ({
  reportPeriod,
  entries,
  kpis
}) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium">Accounts Receivable Aging Report</h1>
        <div className="text-sm text-gray-500">
          <p>As of: {reportPeriod.endDate}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Total Receivables</p>
                <p className="text-xl font-medium">${kpis.totalOutstandingReceivables.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">0-30 Days</p>
                <p className="text-xl font-medium">${kpis.total0To30Days.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">31-60 Days</p>
                <p className="text-xl font-medium">${kpis.total31To60Days.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">Most Overdue</p>
                <p className="text-xl font-medium truncate" title={kpis.mostOverdueCustomer}>
                  {kpis.mostOverdueCustomer}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">% Overdue</p>
                <p className="text-xl font-medium">{kpis.percentageOverdue.toFixed(2)}%</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* AR Aging Table */}
      <Card>
        <CardBody className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="font-medium">Customer</TableCell>
                <TableCell className="font-medium">Invoice #</TableCell>
                <TableCell className="font-medium">Total</TableCell>
                <TableCell className="font-medium">0-30 Days</TableCell>
                <TableCell className="font-medium">31-60 Days</TableCell>
                <TableCell className="font-medium">61-90 Days</TableCell>
                <TableCell className="font-medium">90+ Days</TableCell>
                <TableCell className="font-medium">Status</TableCell>
                <TableCell className="font-medium">Last Payment</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.customerId}>
                  <TableCell>{entry.customerName}</TableCell>
                  <TableCell>{entry.invoiceNumber}</TableCell>
                  <TableCell>${entry.totalOutstanding.toLocaleString()}</TableCell>
                  <TableCell>${entry.days0To30.toLocaleString()}</TableCell>
                  <TableCell>${entry.days31To60.toLocaleString()}</TableCell>
                  <TableCell>${entry.days61To90.toLocaleString()}</TableCell>
                  <TableCell>${entry.days90Plus.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      entry.paymentStatus === 'current'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {entry.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell>{entry.lastPaymentDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};

export default ARAgingReport;
