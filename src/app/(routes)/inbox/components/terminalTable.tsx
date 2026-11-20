import MyTable from '@potta/components/table';
import React from 'react';

const TerminalDatatable = () => {
  const columns = [
    {
      name: 'Date',
      selector: (row: { Date: any }) => row.Date,
      sortable: true,
    },
    {
      name: 'Amount',
      selector: (row: { amount: any }) => row.amount,
      sortable: true,
    },
    {
      name: 'Terminal',
      selector: (row: { terminal: any }) => row.terminal,
      sortable: true,
    },
    {
      name: 'Memo / Reason',
      selector: (row: { reason: any }) => (
        <div className="bg-[#f3fbfb] my-3 px-3 py-1">{row.reason}</div>
      ),
      sortable: true,
    },
    {
      name: 'Resolution',
      sortable: false,
      selector: (row: { runtime: any }) => (
        <div className="flex space-x-4">
          <button className="text-[#237804] bg-[#f2fff5] flex px-3 py-1 border border-[#237804]">
            <i className="ri-checkbox-circle-fill mt-1 mr-1 "></i>Approve
          </button>
          <div className="text-xl">|</div>
          <div className="h-6 w-6 mt-1 bg-red-300 flex text-white rounded-full items-center justify-center">
            <i className="ri-close-line text-2xl"></i>
          </div>
        </div>
      ),
    },
  ];
  const data = [
    {
      id: 1,
      amount: 'XAF 200,000',
      Date: '02/04/24 | 03 : 55',
      terminal: 'James Craxton',
      reason: 'Inventory Restocks',
    },
    {
      id: 2,
      amount: 'XAF 200,000',
      Date: '02/04/24 | 03 : 55',
      terminal: 'James Craxton',
      reason: 'Inventory Restocks',
    },
  ];
  return (
    <div className="mt-10">
      <MyTable columns={columns} data={data} minHeight='70vh' />
    </div>
  );
};

export default TerminalDatatable;
