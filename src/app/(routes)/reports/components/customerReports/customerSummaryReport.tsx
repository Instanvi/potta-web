import * as React from 'react';
import { Card, CardBody } from "@nextui-org/react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@potta/components/simpleTable';
import { Users, DollarSign, TrendingUp, UserCheck, Award } from 'lucide-react';
import { Customer, CustomerSummaryKPIs, ReportPeriod } from '../../utils/customerTypes';

interface CustomerSummaryReportProps {
  reportPeriod: ReportPeriod;
  customers: Customer[];
  kpis: CustomerSummaryKPIs;
}

const CustomerSummaryReport: React.FC<CustomerSummaryReportProps> = ({
  reportPeriod,
  customers,
  kpis
}) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium">Customer Summary Report</h1>
        <div className="text-sm text-gray-500">
          <p>Period: {reportPeriod.startDate} - {reportPeriod.endDate}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Total Customers</p>
                <p className="text-xl font-medium">{kpis.totalCustomers}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Total Purchases</p>
                <p className="text-xl font-medium">${kpis.totalPurchases.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Avg Customer Value</p>
                <p className="text-xl font-medium">${kpis.averageCustomerValue.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Active Customers</p>
                <p className="text-xl font-medium">{kpis.numberOfActiveCustomers}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">Most Valuable</p>
                <p className="text-xl font-medium">{kpis.mostValuableCustomer}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Customers Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="font-medium">Customer ID</TableCell>
              <TableCell className="font-medium">Name</TableCell>
              <TableCell className="font-medium">Email</TableCell>
              <TableCell className="font-medium">Registration Date</TableCell>
              <TableCell className="font-medium">Total Purchases</TableCell>
              <TableCell className="font-medium">Transactions</TableCell>
              <TableCell className="font-medium">Last Purchase</TableCell>
              <TableCell className="font-medium">Status</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.customerId}>
                <TableCell>{customer.customerId}</TableCell>
                <TableCell>{customer.customerName}</TableCell>
                <TableCell>{customer.customerEmail}</TableCell>
                <TableCell>{customer.registrationDate}</TableCell>
                <TableCell>${customer.totalPurchases.toLocaleString()}</TableCell>
                <TableCell>{customer.numberOfTransactions}</TableCell>
                <TableCell>{customer.lastPurchaseDate}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    customer.customerStatus === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {customer.customerStatus}
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

export default CustomerSummaryReport;
