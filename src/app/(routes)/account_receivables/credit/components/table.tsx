'use client'; // Make sure to mark this component as client-side

import React, { useState, FC, useMemo } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Checkbox,
  checkbox,
} from '@nextui-org/react';
import InvoiceModal from './modalInvoice';
import ModalInvoice from './modal';
import DataGrid from './DataGrid';
import { ColumnDef } from '@tanstack/react-table';
import { IColumnDef } from '../_utils/types';
import { cn } from '@potta/lib/utils';
import { Icon } from '@iconify/react';

interface IInvoiceTableComponents {
  onInvoiceDetailsClose: () => void;
  onInvoiceDetailsOpen: () => void;
  onDeleteModal: () => void;
  isInvoiceDetailsOpen: boolean;
}
const InvoiceTableComponents = ({
  onInvoiceDetailsClose,
  isInvoiceDetailsOpen,
  onInvoiceDetailsOpen,
  onDeleteModal,
}: IInvoiceTableComponents) => {
  const columns = [
    {
      name: (
        <>
          <Checkbox color="success" size="lg" />
        </>
      ),
      selector: (row: any) => <Checkbox color="success" size="lg" />,
    },
    {
      name: 'Date',
      selector: (row: any) => row.date,
    },
    {
      name: 'Customer',
      selector: (row: { customer: any }) => row.customer,
    },
    {
      name: 'ID',
      selector: (row: { id: any }) => row.id,
    },
    {
      name: 'Title',
      selector: (row: { title: any }) => row.title,
    },
    {
      name: 'Status',
      selector: (row: { status: any }) => row.status,
    },
    {
      name: 'Amount',
      selector: (row: { amount: any }) => row.amount,
    },
    {
      name: 'Resolution',
      selector: (row: { resolution: any }) => row.resolution,
    },
    {
      name: 'Actions',
      selector: (row: { reference: any; id: string }) => (
        <MoreIcon
          onInvoiceDetailsOpen={onInvoiceDetailsOpen}
          onInvoiceDetailsClose={onInvoiceDetailsClose}
          isInvoiceDetailsOpen={isInvoiceDetailsOpen}
          onDeleteModal={onDeleteModal}
        />
      ),
    },
  ];

  const data: IData[] = [
    {
      date: 'Yesterday',
      customer: 'Jonathan Major',
      id: '009',
      title: 'Office Cleaning',
      status: 'Unpaid',
      amount: '$12,000',
      resolution: 'Pending',
      reference: 'REF123',
    },
    {
      date: 'Today',
      customer: 'Sarah Connor',
      id: '010',
      title: 'Window Cleaning',
      status: 'Paid',
      amount: '$500',
      resolution: 'Approved',
      reference: 'REF124',
    },
  ];

  type IData = {
    date: string;
    customer: string;
    id: string;
    title: string;
    status: string;
    amount: string;
    resolution: 'Approved' | 'Pending';
    reference: string;
  };

  const dataColumn = (): IColumnDef<IData>[] => {
    return [
      {
        accessorKey: 'select',
        header: () => <Checkbox />,
        cell: ({ row }) => <Checkbox />,
      },
      {
        accessorKey: 'date',
        header: 'Date',
      },
      {
        accessorKey: 'customer',
        header: 'Customer',
      },
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => (
          <div className="text-gray-400">
            {row.original?.id}
            <p className="text-xs ">viewed</p>
          </div>
        ),
        // addBorderRight: true,
      },
      {
        accessorKey: 'title',
        header: 'Title',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          return (
            <div>
              <p
                className={cn(
                  `text-red-500`,
                  row?.original?.status === 'Paid' && 'text-green-600'
                )}
              >
                {row?.original?.status}
              </p>
              <p className="text-xs text-gray-400">viewed</p>
            </div>
          );
        },
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        addBorderRight: true,
      },
      {
        // accessorKey: '',
        header: 'Resolution',
        cell: ({ row }) => {
          return (
            <div className="border-r">
              <div className="flex items-center gap-3  w-fit px-3 py-0.5 border border-green-500 bg-green-50 text-green-700">
                <div className="flex items-center justify-center text-white bg-green-700 rounded-full size-4">
                  <Icon icon="material-symbols:check" width="20" height="20" />
                </div>
                {row.original.resolution}
              </div>
            </div>
          );
        },
      },
      {
        // accessorKey: '',
        header: 'Actions',
        cell: ({ row }) => {
          return (
            <>
              <Icon icon="charm:menu-kebab" width="16" height="16" />
            </>
          );
        },
      },
    ];
  };

  const newData = useMemo(() => data, []);
  if (data?.length) {
    return <DataGrid column={dataColumn()} data={newData} />;
  }

  return (
    <div className="mt-10">
      <table className="min-w-full border border-collapse border-gray-300 table-auto">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className="px-4 py-4 text-left border-b bg- bg-green-50"
              >
                {col.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={'py-4 px-4 border-b border-r'}>
                  {col.selector(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface IMoreIcon {
  onInvoiceDetailsClose: () => void;
  onInvoiceDetailsOpen: () => void;
  onDeleteModal: () => void;
  isInvoiceDetailsOpen: boolean;
}
const MoreIcon: FC<IMoreIcon> = ({
  onInvoiceDetailsOpen,
  onInvoiceDetailsClose,
  onDeleteModal,
  isInvoiceDetailsOpen,
}) => {
  return (
    <Popover placement="left-start" showArrow={true}>
      <PopoverTrigger>
        <Button className="flex items-center w-6 h-6 rounded-full justify-evenly hover:bg-gray-100">
          <i className="text-lg cursor-pointer ri-more-line"></i>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-2 p-1 bg-white shadow-md">
          <div className="text-xs cursor-pointer hover:bg-gray-200 py-0.5 px-2 rounded-[2px]">
            <Button onClick={onInvoiceDetailsOpen}>Invoice details</Button>
            {/*{*/}
            {/*  isInvoiceDetailsOpen ?*/}
            {/*  <InvoiceModal open={isInvoiceDetailsOpen} onClose={onInvoiceDetailsClose} />*/}
            {/*    : null*/}
            {/*}*/}
          </div>
          {/*<div className="text-xs cursor-pointer hover:bg-gray-200 py-0.5 px-2 rounded-[2px]">*/}
          {/*    <ModalInvoice />*/}
          {/*</div>*/}

          <div className="text-xs cursor-pointer hover:bg-red-200 py-0.5 px-2 rounded-[2px] text-red-600">
            <h1>Delete ID</h1>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default InvoiceTableComponents;
