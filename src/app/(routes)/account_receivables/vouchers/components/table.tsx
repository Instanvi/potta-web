'use client';
import React, { useState } from 'react';
import MyTable from '@potta/components/table';

import { Filter } from '../_utils/types';
import TableActionPopover, {
  PopoverAction,
} from '@potta/components/tableActionsPopover';
import { MoreVertical } from 'lucide-react';

import Search from '@potta/components/search';
import Button from '@potta/components/button';
import ModalInvoice from './modal';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useGetAllVouchers } from '../_hooks/hooks';
import DeleteModal from './deleteModal';
import ViewVoucherSlider from './viewVoucherSlider.tsx';
import CustomSelect, { IOption } from '../../invoice/components/CustomSelect';

const VoucherTable = () => {
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [openViewModal, setOpenViewModal] = useState<string | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState<string | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const filter: Filter = {
    limit,
    page,
    sortOrder: 'DESC',
    sortBy: 'createdAt',
  };

  const { data, isLoading, error } = useGetAllVouchers(filter);

  const formatDate = (date: string) => {
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
  const options: IOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const columns = [
    {
      name: 'Code',
      selector: (row: any) => (
        <div className="text-sm font-normal text-black">{row.code}</div>
      ),
    },
    {
      name: 'Type',
      selector: (row: any) => (
        <div className="text-sm font-semibold text-black">{row.type}</div>
      ),
    },
    {
      name: 'Start Date',
      selector: (row: any) => (
        <div className="text-sm font-normal text-black">
          {formatDate(row.scheduling?.programStartDate)}
        </div>
      ),
    },
    {
      name: 'End Date',
      selector: (row: any) => (
        <div className="text-sm font-normal text-black">
          {row.scheduling?.neverEnds == true
            ? 'NeverEnds'
            : formatDate(row.scheduling?.ProgramEndDate)}
        </div>
      ),
    },

    {
      name: 'Status',
      selector: (row: any) => (
        <span
          className={
            row.active
              ? 'text-sm font-semibold text-[#154406]'
              : 'text-sm font-semibold text-black'
          }
        >
          {row.active == true ? 'Active' : 'Inactive'}
        </span>
      ),
      hasBorderLeft: true,
      headerBorderLeft: true,
      width: '150px',
    },
    {
      name: '',
      selector: (row: any) => {
        const actions: PopoverAction[] = [
          {
            label: 'View',
            onClick: () => {
              setOpenViewModal(row.uuid);
              setIsViewOpen(true);
            },
            className: 'hover:bg-black/5',
            icon: <i className="ri-eye-line" />,
          },
          {
            label: 'Delete',
            onClick: () => {
              setOpenDeleteModal(row.uuid);
              setIsDeleteOpen(true);
            },
            className: 'hover:bg-red-100 text-red-600',
            icon: <i className="ri-delete-bin-line" />,
          },
        ];

        return (
          <TableActionPopover
            actions={actions}
            rowUuid={row.uuid}
            openPopover={openPopover}
            setOpenPopover={setOpenPopover}
          />
        );
      },
      width: '50px',
    },
  ];
  if (error) {
    return (
      <div
        className={
          'flex w-full flex-col items-center justify-center py-24 text-black'
        }
      >
        An Error Occured
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex w-full flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
          <div className="min-w-0 flex-1 sm:max-w-md">
            <Search />
          </div>
          <CustomSelect
            options={options}
            value={selectedValue}
            onChange={setSelectedValue}
            placeholder="Filter: All"
          />
          <CustomSelect
            options={options}
            value={selectedValue}
            onChange={setSelectedValue}
            placeholder="Date: All time"
          />
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <Button
            text={'Export'}
            icon={<i className="ri-upload-2-line" />}
            theme="outline"
            type={'button'}
            className="!border-[#154406] !bg-[#e8f5e9] !py-2.5 !text-[#154406]"
          />
          <Link href={'/account_receivables/vouchers/new'}>
            <Button
              text={'Create Voucher'}
              icon={<i className="ri-file-add-line" />}
              theme="default"
              type={'button'}
              className="!bg-[#154406]"
            />
          </Link>
        </div>
      </div>
      <MyTable
        columns={columns}
        selectable={true}
        data={data?.data || []}
        pagination
        pending={isLoading}
        paginationServer
        paginationTotalRows={data?.meta?.totalItems ?? 0}
        onChangePage={setPage}
        onChangeRowsPerPage={(n) => {
          setLimit(n);
          setPage(1);
        }}
        currentPage={page}
        rowsPerPage={limit}
      />

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
    </div>
  );
};

export default VoucherTable;
