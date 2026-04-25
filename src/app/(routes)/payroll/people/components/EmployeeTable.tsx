import React from 'react';
import moment from 'moment';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@potta/components/shadcn/dropdown';
import { Employee } from '../utils/types';

interface EmployeeTableProps {
  employees: Employee[];
  onViewEmployee: (id: string) => void;
  onEditEmployee: (id: string) => void;
  onDeleteEmployee: (id: string) => void;
  onRowClick: (employee: Employee) => void;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  onViewEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onRowClick,
  totalPages,
  pageSize,
  onPageChange,
}) => {
  const columns = [
    {
      accessorKey: 'employee',
      header: 'Employee',
      cell: ({ row }: { row: { original: Employee } }) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {row.original.profilePicture ? (
              <img
                src={row.original.profilePicture}
                alt={`${row.original.firstName} ${row.original.lastName}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={
                  'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
                }
                alt={`${row.original.firstName} ${row.original.lastName}`}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {row.original.firstName} {row.original.lastName}
            </div>
            <div className="text-sm text-gray-500">{row.original.email}</div>
            <div className="text-xs text-gray-400">{row.original.phone}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'matricule',
      header: 'Employee ID',
      cell: ({ row }: { row: { original: Employee } }) => (
        <div className="font-mono text-sm font-medium text-gray-700">
          {row.original.matricule || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'employment_type',
      header: 'Department & Role',
      cell: ({ row }: { row: { original: Employee } }) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {row.original.employment_type}
          </div>
          <div className="text-xs text-gray-500">
            {row.original.compensation_schedule} Pay
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Location',
      cell: ({ row }: { row: { original: Employee } }) => (
        <div>
          <div className="text-sm text-gray-900">
            {row.original.address?.city || 'N/A'}
          </div>
          <div className="text-xs text-gray-500">
            {row.original.address?.country || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'compensation',
      header: 'Compensation',
      cell: ({ row }: { row: { original: Employee } }) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {row.original.base_pay
              ? `${row.original.currency} ${Number(
                  row.original.base_pay
                ).toLocaleString()}`
              : row.original.hourly_rate
              ? `${row.original.currency} ${row.original.hourly_rate}/hr`
              : 'N/A'}
          </div>
          <div className="text-xs text-gray-500">
            {row.original.compensation_schedule}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'benefits',
      header: 'Benefits',
      cell: ({ row }: { row: { original: Employee } }) => (
        <div className="flex flex-col">
          <div className="text-sm font-medium text-gray-900">
            {row.original.benefits?.length || 0} Benefits
          </div>
          <div className="text-xs text-gray-500">
            {row.original.paid_time_off?.length || 0} PTO Plans
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'start_date',
      header: 'Employment',
      cell: ({ row }: { row: { original: Employee } }) => (
        <div>
          <div className="text-sm text-gray-900">
            {row.original.start_date
              ? moment(row.original.start_date).format('MMM DD, YYYY')
              : 'N/A'}
          </div>
          <div className="text-xs text-gray-500">Start Date</div>
        </div>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }: { row: { original: Employee } }) => (
        <div>
          {row.original.is_active ? (
            <span className="px-2 py-1 inline-flex text-md leading-5 font-medium rounded-full text-green-800">
              Active
            </span>
          ) : (
            <span className="px-2 py-1 inline-flex text-md leading-5 font-medium rounded-full bg-red-100 text-red-800">
              Inactive
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: Employee } }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <i className="ri-more-2-fill text-xl text-gray-600"></i>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onViewEmployee(row.original.uuid)}>
              <i className="ri-eye-line mr-2"></i> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditEmployee(row.original.uuid)}>
              <i className="ri-edit-line mr-2"></i> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteEmployee(row.original.uuid)}
              className="text-red-600"
            >
              <i className="ri-delete-bin-line mr-2"></i> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="bg-white">
      <DataGrid
        data={employees}
        columns={columns}
        isLoading={false}
        onRowClick={onRowClick}
      />
    </div>
  );
};

export default EmployeeTable;
export type { Employee };
