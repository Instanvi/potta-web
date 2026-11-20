'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@potta/components/button';
import DynamicFilter from '@potta/components/dynamic-filter';
import { Can } from '@/components/auth/can';
import { ListToolbar } from '../../../_shared/states';
import { ExportButton } from '@/components/export-button';
import { useVendorOptions } from '../../hooks';
import { Bill } from '../utils/types';
import { formatDate } from '../../../_shared/format';
import { formatMoney } from '../../utils/format';

interface FilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  vendorId: string;
  onVendorChange: (value: string) => void;
  rows?: Bill[];
}

const statusOptions = [
  { label: 'All statuses', value: 'all' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Issued', value: 'ISSUED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Rejected', value: 'REJECTED' },
];

const Filter: React.FC<FilterProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  vendorId,
  onVendorChange,
  rows = [],
}) => {
  const { data: vendors = [] } = useVendorOptions();
  const router = useRouter();

  return (
    <ListToolbar
      actions={
        <>
          <ExportButton
            filename="bills"
            rows={rows}
            columns={[
              { key: 'code', header: 'Bill' },
              {
                key: 'vendorInvoiceNumber',
                header: 'Vendor ref',
                value: (row) => row.vendorInvoiceNumber || '',
              },
              {
                key: 'vendor',
                header: 'Vendor',
                value: (row) => row.vendor?.name ?? '',
              },
              {
                key: 'issuedDate',
                header: 'Issued',
                value: (row) => formatDate(row.issuedDate),
              },
              {
                key: 'dueDate',
                header: 'Due date',
                value: (row) => formatDate(row.dueDate),
              },
              {
                key: 'invoiceTotal',
                header: 'Amount',
                value: (row) => formatMoney(row.invoiceTotal, row.currency),
              },
              { key: 'status', header: 'Status' },
            ]}
          />
          <Can resource="Bill" action="create">
            <Button
              text="New bill"
              icon={<i className="ri-file-add-line" />}
              theme="default"
              type="button"
              onClick={() => router.push('/account_payables/bills/new')}
            />
          </Can>
        </>
      }
    >
      <DynamicFilter
        className="p-0"
        searchValue={search}
        onSearchChange={(e) => onSearchChange(e.target.value)}
        onSearchClear={() => onSearchChange('')}
        searchPlaceholder="Search bill no., vendor invoice no. or vendor"
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: status,
            options: statusOptions,
            onChange: onStatusChange,
          },
          {
            key: 'vendor',
            label: 'All vendors',
            value: vendorId,
            isSearchable: true,
            selectClassName: 'min-w-[220px]',
            options: vendors.map((v) => ({ label: v.name, value: v.uuid })),
            onChange: onVendorChange,
          },
        ]}
      />
    </ListToolbar>
  );
};

export default Filter;
