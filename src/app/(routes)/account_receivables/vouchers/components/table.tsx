'use client';
import React, { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { DataTable } from '@potta/components/ui/data-table';
import TableActionPopover, {
  PopoverAction,
} from '@potta/components/tableActionsPopover';
import DynamicFilter from '@potta/components/dynamic-filter';
import Button from '@potta/components/button';
import { useServerPagination } from '@/hooks/use-server-pagination';
import { ErrorState, ListToolbar } from '../../../_shared/states';
import { Filter } from '../_utils/types';
import { useGetAllVouchers } from '../_hooks/hooks';
import DeleteModal from './deleteModal';
import ViewVoucherSlider from './viewVoucherSlider.tsx';

const useDebounced = <T,>(value: T, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

const formatDate = (date?: string) => {
  if (!date) return '—';
  const today = new Date();
  const inputDate = new Date(date);

  if (
    today.getDate() === inputDate.getDate() &&
    today.getMonth() === inputDate.getMonth() &&
    today.getFullYear() === inputDate.getFullYear()
  ) {
    return 'Today';
  }
  return inputDate.toLocaleDateString();
};

const VoucherTable = () => {
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [openViewModal, setOpenViewModal] = useState<string | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState<string | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const search = useDebounced(searchValue.trim());
  const { page, limit, tableProps } = useServerPagination({
    pageSize: 20,
    resetOn: [search],
  });

  const filter: Filter = {
    limit,
    page,
    sortOrder: 'DESC',
    sortBy: 'createdAt',
    search: search || undefined,
  };

  const { data, isLoading, error, refetch } = useGetAllVouchers(filter);
  const rows = data?.data ?? [];

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row: { original } }) => (
        <div className="text-sm text-foreground">{original.code}</div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row: { original } }) => (
        <div className="text-sm font-medium text-foreground">{original.type}</div>
      ),
    },
    {
      id: 'startDate',
      header: 'Start Date',
      cell: ({ row: { original } }) => (
        <div className="text-sm text-foreground">
          {formatDate(original.scheduling?.programStartDate)}
        </div>
      ),
    },
    {
      id: 'endDate',
      header: 'End Date',
      cell: ({ row: { original } }) => (
        <div className="text-sm text-foreground">
          {original.scheduling?.neverEnds == true
            ? 'NeverEnds'
            : formatDate(original.scheduling?.ProgramEndDate)}
        </div>
      ),
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row: { original } }) => (
        <span
          className={
            original.active
              ? 'text-sm font-medium text-primary'
              : 'text-sm font-medium text-muted-foreground'
          }
        >
          {original.active == true ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row: { original } }) => {
        const actions: PopoverAction[] = [
          {
            label: 'View',
            onClick: () => {
              setOpenViewModal(original.uuid);
              setIsViewOpen(true);
            },
            className: 'hover:bg-black/5',
            icon: <i className="ri-eye-line" />,
          },
          {
            label: 'Delete',
            onClick: () => {
              setOpenDeleteModal(original.uuid);
              setIsDeleteOpen(true);
            },
            className: 'hover:bg-red-100 text-red-600',
            icon: <i className="ri-delete-bin-line" />,
          },
        ];

        return (
          <TableActionPopover
            actions={actions}
            rowUuid={original.uuid}
            openPopover={openPopover}
            setOpenPopover={setOpenPopover}
          />
        );
      },
    },
  ];

  return (
    <>
      <ListToolbar
        actions={
          <>
            <Button
              text={'Export'}
              icon={<i className="ri-upload-2-line" />}
              theme="lightBlue"
              type={'button'}
            />
            <Link href={'/account_receivables/vouchers/new'}>
              <Button
                text={'Create Voucher'}
                icon={<i className="ri-file-add-line" />}
                theme="default"
                type={'button'}
              />
            </Link>
          </>
        }
      >
        <DynamicFilter
          searchValue={searchValue}
          onSearchChange={(e) => setSearchValue(e.target.value)}
          onSearchClear={() => setSearchValue('')}
          searchPlaceholder="Search vouchers by code..."
          filters={[]}
          className="p-0"
        />
      </ListToolbar>
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          withRowSelection
          {...tableProps(data?.meta, rows.length)}
        />
      )}

      {openDeleteModal && (
        <DeleteModal
          voucherID={openDeleteModal}
          open={isDeleteOpen}
          setOpen={setIsDeleteOpen}
        />
      )}
      {openViewModal && (
        <ViewVoucherSlider
          voucherId={openViewModal}
          open={isViewOpen}
          setOpen={setIsViewOpen}
        />
      )}
    </>
  );
};

export default VoucherTable;
