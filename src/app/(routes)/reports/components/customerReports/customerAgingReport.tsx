import * as React from 'react';
import { Card, CardBody } from "@nextui-org/react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@potta/components/simpleTable';
import { CustomerAging, CustomerAgingKPIs, ReportPeriod } from '../../utils/customerTypes';
import { AlertCircle, Percent, Clock, Calendar, Award } from 'lucide-react';

interface CustomerAgingReportProps {
  reportPeriod: ReportPeriod;
  customers: CustomerAging[];
  kpis: CustomerAgingKPIs;
}

const CustomerAgingReport: React.FC<CustomerAgingReportProps> = ({
  reportPeriod,
  customers,
  kpis
}) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium">Customer Aging Report</h1>
        <div className="text-sm text-gray-500">
          <p>Period: {reportPeriod.startDate} - {reportPeriod.endDate}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">Total Outstanding</p>
                <p className="text-xl font-medium">${kpis.totalOutstandingBalance.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Overdue Customers</p>
                <p className="text-xl font-medium">{kpis.percentageOverdueCustomers}%</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">0-30 Days Balance</p>
                <p className="text-xl font-medium">${kpis.total0To30DaysBalance.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">31-60 Days Balance</p>
                <p className="text-xl font-medium">${kpis.total31To60DaysBalance.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Most Overdue</p>
                <p className="text-xl font-medium">{kpis.mostOverdueCustomer}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Aging Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="font-medium">Customer ID</TableCell>
              <TableCell className="font-medium">Name</TableCell>
              <TableCell className="font-medium">Total Outstanding</TableCell>
              <TableCell className="font-medium">0-30 Days</TableCell>
              <TableCell className="font-medium">31-60 Days</TableCell>
              <TableCell className="font-medium">61-90 Days</TableCell>
              <TableCell className="font-medium">90+ Days</TableCell>
              <TableCell className="font-medium">Last Payment</TableCell>
              <TableCell className="font-medium">Status</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.customerId}>
                <TableCell>{customer.customerId}</TableCell>
                <TableCell>{customer.customerName}</TableCell>
                <TableCell>${customer.totalOutstanding.toLocaleString()}</TableCell>
                <TableCell>${customer.days0To30.toLocaleString()}</TableCell>
                <TableCell>${customer.days31To60.toLocaleString()}</TableCell>
                <TableCell>${customer.days61To90.toLocaleString()}</TableCell>
                <TableCell>${customer.days90Plus.toLocaleString()}</TableCell>
                <TableCell>{customer.lastPaymentDate}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    customer.paymentStatus === 'current'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {customer.paymentStatus}
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

export default CustomerAgingReport;
