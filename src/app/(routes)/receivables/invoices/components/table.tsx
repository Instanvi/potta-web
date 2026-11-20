import React from 'react'
import Table from '@potta/components/table'
import Button from '@potta/components/button';

const InvoiceDatatable = () => {
    const columns = [
        {
            name: "Name",
            selector: (row: { name: any; }) => <div className='flex space-x-3'><p className='mt-0.5'>{row.name}</p></div>,
            sortable: true
        },
        {
            name: "ID",
            selector: (row: { id: any; }) => row.id,
            sortable: true,

        },
        {
            name: "Amount",
            selector: (row: { amount: any; }) => row.amount,
            sortable: true,

        },
        {
            name: "Due Date",
            selector: (row: { Date: any; }) => row.Date,
            sortable: true
        },
        {
            name: "Status",
            selector: (row: { status: any; }) => <div><button className='text-green-700 bg-green-300 px-5 py-2'>{row.status}</button></div>,
            sortable: true
        }
    ];
    const data = [
        {
            id: 'Inv 001',
            Name: 'Invoice for UI design',
            amount: "XAF 200,000",
            Date: "Feb 04, 2024 ",
            status: "Paid",
        },
    ]
    return (
        <div className='mt-10'>
            <Table columns={columns} data={data} ExpandableComponent={null} />
        </div>
    )
}

export default InvoiceDatatable