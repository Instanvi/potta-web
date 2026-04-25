import React from 'react';
import { Card, CardBody, ScrollShadow } from "@nextui-org/react";
import { Download, Printer } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@potta/components/simpleTable';
import { ReportPeriod, MovementItem, MovementKPIs } from '../../utils/inventoryTypes';

interface StockMovementReportProps {
  reportPeriod: ReportPeriod;
  items: MovementItem[];
  kpis: MovementKPIs;
}

const StockMovementReport: React.FC<StockMovementReportProps> = ({
  reportPeriod,
  items,
  kpis
}) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium">Stock Movement Report</h1>
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

      {/* Movement Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Total Units Received</p>
            <p className="text-2xl font-medium">{kpis.totalReceived.toLocaleString()}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Total Units Sold</p>
            <p className="text-2xl font-medium">{kpis.totalSold.toLocaleString()}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Net Movement</p>
            <p className="text-2xl font-medium">{kpis.netMovement.toLocaleString()}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Highest Movement Item</p>
            <p className="text-2xl font-medium">{kpis.highestMovementItem}</p>
          </CardBody>
        </Card>
      </div>

      {/* Movement Chart */}
      <Card>
        <CardBody>
          <div className="w-full h-[300px]">
            <LineChart
              width={800}
              height={300}
              data={items}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="itemName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="stockReceived"
                stroke="#8884d8"
                name="Received"
              />
              <Line
                type="monotone"
                dataKey="stockSold"
                stroke="#82ca9d"
                name="Sold"
              />
            </LineChart>
          </div>
        </CardBody>
      </Card>

      {/* Movement Table */}
      <Card>
        <CardBody>
          <ScrollShadow className="h-[400px]" hideScrollBar>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Item Name</TableCell>
                  <TableCell>Opening Stock</TableCell>
                  <TableCell>Received</TableCell>
                  <TableCell>Sold/Used</TableCell>
                  <TableCell>Closing Stock</TableCell>
                  <TableCell>Net Movement</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.itemId}>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell>{item.openingStock}</TableCell>
                    <TableCell>{item.stockReceived}</TableCell>
                    <TableCell>{item.stockSold}</TableCell>
                    <TableCell>{item.closingStock}</TableCell>
                    <TableCell>{item.stockReceived - item.stockSold}</TableCell>
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

export default StockMovementReport;
