import React from 'react';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';

const PayInfoTab = ({ employee }: { employee: any }) => (
  <div className="mt-6">
    <div className="flex w-full gap-8">
      {/* Line Chart Placeholder */}
      <div className="flex-1 bg-white border rounded-lg p-4 flex flex-col justify-between min-h-[260px]">
        <div className="font-medium mb-2">Pay History</div>
        <div className="flex-1 flex items-end">
          {/* Replace this with a real chart later */}
          <div className="w-full h-40 border-b border-green-500 relative">
            <div
              className="absolute left-0 bottom-0 w-full h-1/2 border-b border-green-500"
              style={{ borderStyle: 'dashed' }}
            ></div>
          </div>
        </div>
      </div>
      {/* Pie Chart and Legend Placeholder */}
      <div className="w-80 bg-white border rounded-lg p-4 flex flex-col items-center">
        <div className="font-medium mb-2">Year to Date Average</div>
        {/* Pie chart placeholder */}
        <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          {/* Replace with real pie chart */}
          <span className="text-gray-400">Pie Chart</span>
        </div>
        <div className="w-full">
          <div className="flex justify-between text-sm mb-1">
            <span>Cash in Pocket</span>
            <span>XAF 940,586 (75%)</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Taxes</span>
            <span>XAF 240,000 (12%)</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Deductions</span>
            <span>XAF 120,000 (13%)</span>
          </div>
        </div>
      </div>
    </div>
    {/* Pay History Table */}
    <div className="mt-8">
      <DataGrid
        columns={[
          { accessorKey: 'date', header: 'Date' },
          { accessorKey: 'totalPay', header: 'Total Pay' },
          { accessorKey: 'rate', header: 'Rate' },
          { accessorKey: 'regularTime', header: 'Regular Time' },
          { accessorKey: 'overtime', header: 'Overtime' },
          { accessorKey: 'bonuses', header: 'Bonuses' },
          { accessorKey: 'deductions', header: 'Deductions' },
          { accessorKey: 'taxes', header: 'Taxes' },
        ]}
        data={[
          {
            date: '11-05-2025',
            totalPay: '150,000 XAF',
            rate: '150,000 XAF/Mn',
            regularTime: '160 hrs',
            overtime: '',
            bonuses: '',
            deductions: 'XAF 25,000',
            taxes: '',
          },
          {
            date: '11-04-2025',
            totalPay: '199,000 XAF',
            rate: '180,000 XAF/Mn',
            regularTime: '160 hrs',
            overtime: '',
            bonuses: '',
            deductions: 'XAF 25,000',
            taxes: '',
          },
          {
            date: '11-03-2025',
            totalPay: '200,000 XAF',
            rate: '200,000 XAF/Mn',
            regularTime: '160 hrs',
            overtime: '',
            bonuses: '',
            deductions: 'XAF 5,000',
            taxes: '',
          },
          {
            date: 'Paula Adakwa',
            totalPay: '300,000 XAF',
            rate: '250,000 XAF/Mn',
            regularTime: '160 hrs',
            overtime: '',
            bonuses: '',
            deductions: 'XAF 10,000',
            taxes: '',
          },
          {
            date: 'Total',
            totalPay: '849,000 XAF',
            rate: '',
            regularTime: '640 hrs',
            overtime: '',
            bonuses: 'XAF 15,000',
            deductions: 'XAF 75,000',
            taxes: 'XAF 00',
          },
        ]}
      />
    </div>
  </div>
);

export default PayInfoTab;
