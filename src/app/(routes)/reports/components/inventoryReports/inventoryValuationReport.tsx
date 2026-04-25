import React from 'react';
import { Card, CardBody, ScrollShadow } from "@nextui-org/react";
import { Download, Printer } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@potta/components/simpleTable';
import { ReportPeriod, ValuationItem, ValuationKPIs } from '../../utils/inventoryTypes';

interface InventoryValuationReportProps {
  reportPeriod: ReportPeriod;
  items: ValuationItem[];
  kpis: ValuationKPIs;
}

const InventoryValuationReport: React.FC<InventoryValuationReportProps> = ({
  reportPeriod,
  items,
  kpis
}) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium">Inventory Valuation Report</h1>
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

      {/* Valuation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Total Inventory Value</p>
            <p className="text-2xl font-medium">${kpis.totalInventoryValue.toLocaleString()}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Average Unit Cost</p>
            <p className="text-2xl font-medium">${kpis.averageUnitCost.toLocaleString()}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Most Expensive Item</p>
            <p className="text-2xl font-medium">{kpis.mostExpensiveItem}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Least Expensive Item</p>
            <p className="text-2xl font-medium">{kpis.leastExpensiveItem}</p>
          </CardBody>
        </Card>
      </div>

      {/* Valuation Table */}
      <Card>
        <CardBody>
          <ScrollShadow className="h-[400px]" hideScrollBar>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Item Name</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Unit Cost</TableCell>
                  <TableCell>Current Stock</TableCell>
                  <TableCell>Total Valuation</TableCell>
                  <TableCell>Valuation Method</TableCell>
                  <TableCell>Last Purchase Date</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.itemId}>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell>{item.itemId}</TableCell>
                    <TableCell>${item.unitCost}</TableCell>
                    <TableCell>{item.currentStock}</TableCell>
                    <TableCell>${item.totalValuation.toLocaleString()}</TableCell>
                    <TableCell>{item.valuationMethod}</TableCell>
                    <TableCell>{item.lastPurchaseDate}</TableCell>
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

export default InventoryValuationReport;
