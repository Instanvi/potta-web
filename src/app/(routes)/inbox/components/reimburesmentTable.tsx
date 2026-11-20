import MyTable from '@potta/components/table';
import React from 'react';

const ReimbusementDatatable = () => {
  const columns = [
    {
      name: 'Team',
      selector: (row: { team: any }) => (
        <div className="flex space-x-3">
          <div className="text-md text-white rounded-full bg-green-800 h-8 w-8 flex justify-center items-center ">
            JC
          </div>
          <p className="mt-0.5">{row.team}</p>
        </div>
      ),
      sortable: true,
    },
    {
      name: 'Amount',
      selector: (row: { amount: any }) => row.amount,
      sortable: true,
    },
    {
      name: 'Submitted Date',
      selector: (row: { Date: any }) => row.Date,
      sortable: true,
    },
    {
      name: 'Transaction Date',
      selector: (row: { tDate: any }) => row.tDate,
      sortable: true,
    },
    {
      name: 'Category',
      selector: (row: { category: any }) => (
        <div className="bg-[#f3fbfb] my-3 px-3 py-1">{row.category}</div>
      ),
      sortable: true,
    },
    {
      name: 'Receipt / Memo',
      selector: (row: { approvers: any }) => (
        <i className="ri-file-text-line text-xl text-gray-500 text-center"></i>
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
      team: 'James Craxton',
      amount: 'XAF 200,000',
      approvers: '1/3',
      Date: 'Feb 04, 2024 ',
      tDate: 'Feb 04, 2024 ',
      category: 'Electricity',
      reason: 'Inventory Restocks',
    },
  ];
  return (
    <div className="mt-10">
      <MyTable columns={columns} data={data} minHeight='70vh'/>
    </div>
  );
};

export default ReimbusementDatatable;
