import * as React from 'react';
import { Card, CardBody } from "@nextui-org/react";
import { Table, TableHeader, TableBody, TableRow, TableCell }  from '@potta/components/simpleTable';
import { Building, DollarSign, AlertCircle, Users, Award } from 'lucide-react';
import { Vendor, VendorSummaryKPIs, ReportPeriod }from '../../utils/vendorTypes'; 

interface VendorSummaryReportProps {
  reportPeriod: ReportPeriod;
  vendors: Vendor[];
  kpis: VendorSummaryKPIs;
}

const VendorSummaryReport: React.FC<VendorSummaryReportProps> = ({
  reportPeriod,
  vendors,
  kpis
}) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium">Vendor Summary Report</h1>
        <div className="text-sm text-gray-500">
          <p>Period: {reportPeriod.startDate} - {reportPeriod.endDate}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
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
              <Building className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Amount Paid</p>
                <p className="text-xl font-medium">${kpis.totalAmountPaid.toLocaleString()}</p>
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
                <p className="text-xl font-medium">${kpis.totalOutstandingBalance.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Active Vendors</p>
                <p className="text-xl font-medium">{kpis.numberOfActiveVendors}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Largest Vendor</p>
                <p className="text-xl font-medium">{kpis.largestVendorByPurchases}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Vendors Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="font-medium">Vendor ID</TableCell>
              <TableCell className="font-medium">Name</TableCell>
              <TableCell className="font-medium">Total Purchases</TableCell>
              <TableCell className="font-medium">Amount Paid</TableCell>
              <TableCell className="font-medium">Outstanding</TableCell>
              <TableCell className="font-medium">Last Purchase</TableCell>
              <TableCell className="font-medium">Status</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.vendorId}>
                <TableCell>{vendor.vendorId}</TableCell>
                <TableCell>{vendor.vendorName}</TableCell>
                <TableCell>${vendor.totalPurchases.toLocaleString()}</TableCell>
                <TableCell>${vendor.amountPaid.toLocaleString()}</TableCell>
                <TableCell>${vendor.outstandingBalance.toLocaleString()}</TableCell>
                <TableCell>{vendor.lastPurchaseDate}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    vendor.vendorStatus === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {vendor.vendorStatus}
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

export default VendorSummaryReport;
