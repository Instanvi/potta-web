import * as React from 'react';
import { Card, CardBody } from "@nextui-org/react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@potta/components/simpleTable';
import { AlertCircle, Clock, Calendar, Award, Percent } from 'lucide-react';
import { VendorAging, VendorAgingKPIs, ReportPeriod } from '../../utils/vendorTypes';

interface VendorAgingReportProps {
  reportPeriod: ReportPeriod;
  vendors: VendorAging[];
  kpis: VendorAgingKPIs;
}

const VendorAgingReport: React.FC<VendorAgingReportProps> = ({
  reportPeriod,
  vendors,
  kpis
}) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium">Vendor Aging Report</h1>
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
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">0-30 Days</p>
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
                <p className="text-sm text-gray-500">31-60 Days</p>
                <p className="text-xl font-medium">${kpis.total31To60DaysBalance.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Most Overdue</p>
                <p className="text-xl font-medium">{kpis.mostOverdueVendor}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Overdue %</p>
                <p className="text-xl font-medium">{kpis.percentageOverdueVendors}%</p>
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
              <TableCell className="font-medium">Vendor ID</TableCell>
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
            {vendors.map((vendor) => (
              <TableRow key={vendor.vendorId}>
                <TableCell>{vendor.vendorId}</TableCell>
                <TableCell>{vendor.vendorName}</TableCell>
                <TableCell>${vendor.totalOutstanding.toLocaleString()}</TableCell>
                <TableCell>${vendor.days0To30.toLocaleString()}</TableCell>
                <TableCell>${vendor.days31To60.toLocaleString()}</TableCell>
                <TableCell>${vendor.days61To90.toLocaleString()}</TableCell>
                <TableCell>${vendor.days90Plus.toLocaleString()}</TableCell>
                <TableCell>{vendor.lastPaymentDate}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    vendor.paymentStatus === 'current'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {vendor.paymentStatus}
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

export default VendorAgingReport;
