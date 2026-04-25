import React from 'react';
import Table from '@potta/components/table';

const ReceiptTable = () => {
  const columns = [
    {
      name: 'ID',
      // selector: (row: any) => <div className='flex space-x-3'><img src={row.img} alt="" /><p className='mt-0.5'>{row.name}</p></div>,
    },
    {
      name: 'Qty',
      // selector: (row: { sku: any; }) => row.sku,
    },
    {
      name: 'Price',
      // selector: (row: { type: any; }) => row.type,
    },
    {
      name: 'Tax',
      // selector: (row: { cost: any; }) => row.cost,
    },
  ];
  const data = [
    {
      id: 'Inv 001',
      qty: 'Black Shoes Nike',
      price: '/icons/shoes.svg',
      tax: '194E175W',
    },
  ];
  return (
    <div className="mt-10">
      <div></div>
      <Table
        columns={columns}
        data={data}
        ExpandableComponent={null}
        expanded={false}
        pagination={data.length > 9 ? true : false}
      />
    </div>
  );
};

export default ReceiptTable;
