import MyTable from '@potta/components/table';
import React from 'react';

const TableComponents = () => {
  const columns = [
    {
      name: 'Date',
      // render: (row: any) => <div className=''>{row.date}</div>,
    },
    {
      name: 'Type',
      // render: (row: any) => <div className=''>{row.type}</div>,
    },
    {
      name: 'Amount',
      // render: (row: { amount: any; }) => <div className=''>{row.amount}</div>,
    },
    {
      name: 'Status',
      // render: (row: { status: any; }) => <div className=''>{row.status}</div>,
    },
    {
      name: 'Reference',
      // render: (row: { reference: any; }) => <div className=''>{row.reference}</div>,
    },
  ];

  const data = [
    {
      id: 'Inv 001',
      date: '10/03/2024 | 00:25',
      amount: '25,000',
      type: '',
      status: 'Paid',
      reference: '10054264',
    },
    {
      id: 'Inv 002',
      date: '10/02/2024 | 23:50',
      amount: '30,000',
      status: 'Unpaid',
      reference: '10054263',
    },
  ];

  return (
    <div className="mt-10">
      <MyTable
        columns={columns}
        data={data}
        ExpandableComponent={null}
        expanded={false}
        pagination={data.length > 9}
      />
    </div>
  );
};

export default TableComponents;
