import React from 'react';
import { Card, CardBody, ScrollShadow } from "@nextui-org/react";
import { Download, Printer } from 'lucide-react';
import { ReportPeriod, SummaryItem, SummaryKPIs } from '../../utils/inventoryTypes';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@potta/components/simpleTable';



interface InventorySummaryReportProps {
  reportPeriod: ReportPeriod;
  items: SummaryItem[];
  kpis: SummaryKPIs;
}

const InventorySummaryReport: React.FC<InventorySummaryReportProps> = ({
  reportPeriod,
  items,
  kpis
}) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium">Inventory Summary Report</h1>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Total Inventory Cost</p>
            <p className="text-2xl font-medium">${kpis.totalInventoryCost.toLocaleString()}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Total Units in Stock</p>
            <p className="text-2xl font-medium">{kpis.totalUnitsInStock.toLocaleString()}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Inventory Turnover Ratio</p>
            <p className="text-2xl font-medium">{kpis.inventoryTurnoverRatio.toFixed(2)}</p>
          </CardBody>
        </Card>
      </div>

      {/* Summary Table */}
      <Card>
        <CardBody>
          <ScrollShadow className="h-[400px]" hideScrollBar>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Item Name</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Opening Stock</TableCell>
                  <TableCell>Stock Received</TableCell>
                  <TableCell>Stock Sold</TableCell>
                  <TableCell>Closing Stock</TableCell>
                  <TableCell>Valuation</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.itemId}>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell>{item.itemId}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.openingStock}</TableCell>
                    <TableCell>{item.stockReceived}</TableCell>
                    <TableCell>{item.stockSold}</TableCell>
                    <TableCell>{item.closingStock}</TableCell>
                    <TableCell>${item.stockValuation.toLocaleString()}</TableCell>
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

export default InventorySummaryReport;
