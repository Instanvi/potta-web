import * as React from 'react';
import { Card, CardBody } from "@nextui-org/react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@potta/components/simpleTable';
import { Building, DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { PurchaseOrder, PurchaseOrderKPIs, ReportPeriod } from '../../utils/collectionTypes';

interface PurchaseOrderReportProps {
  reportPeriod: ReportPeriod;
  purchaseOrders: PurchaseOrder[];
  kpis: PurchaseOrderKPIs;
}

const PurchaseOrderReport: React.FC<PurchaseOrderReportProps> = ({
  reportPeriod,
  purchaseOrders,
  kpis
}) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium">Purchase Order Report</h1>
        <div className="text-sm text-gray-500">
          <p>Period: {reportPeriod.startDate} - {reportPeriod.endDate}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Total PO Amount</p>
                <p className="text-xl font-medium">${kpis.totalPurchaseOrderAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Total Paid</p>
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
                <p className="text-sm text-gray-500">Outstanding Amount</p>
                <p className="text-xl font-medium">${kpis.totalOutstandingAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Total POs</p>
                <p className="text-xl font-medium">{kpis.numberOfPurchaseOrders}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Fulfilled POs</p>
                <p className="text-xl font-medium">{kpis.percentageFulfilledPOs}%</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Purchase Orders Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="font-medium">PO ID</TableCell>
              <TableCell className="font-medium">Vendor</TableCell>
              <TableCell className="font-medium">PO Date</TableCell>
              <TableCell className="font-medium">Delivery Date</TableCell>
              <TableCell className="font-medium">Amount</TableCell>
              <TableCell className="font-medium">Paid</TableCell>
              <TableCell className="font-medium">Outstanding</TableCell>
              <TableCell className="font-medium">Status</TableCell>
              <TableCell className="font-medium">Payment Method</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchaseOrders.map((po) => (
              <TableRow key={po.purchaseOrderId}>
                <TableCell>{po.purchaseOrderId}</TableCell>
                <TableCell>{po.vendorName}</TableCell>
                <TableCell>{po.poDate}</TableCell>
                <TableCell>{po.deliveryDate}</TableCell>
                <TableCell>${po.poAmount.toLocaleString()}</TableCell>
                <TableCell>${po.amountPaid.toLocaleString()}</TableCell>
                <TableCell>${po.outstandingAmount.toLocaleString()}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    po.poStatus === 'fulfilled' ? 'bg-green-100 text-green-800' :
                    po.poStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {po.poStatus}
                  </span>
                </TableCell>
                <TableCell>{po.paymentMethod}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PurchaseOrderReport;
