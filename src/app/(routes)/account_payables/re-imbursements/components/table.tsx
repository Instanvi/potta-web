// Reimbursement Data Table Wrapper
'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  MoreVertical,
  Eye,
  Edit,
  CheckCircle,
  DollarSign,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@potta/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import { Button } from '@potta/components/shadcn/button';
import { Badge } from '@potta/components/shadcn/badge';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
import { Reimbursement } from '../utils/api-types';
import {
  REIMBURSEMENT_STATUS_COLORS,
  REIMBURSEMENT_TYPE_COLORS,
} from '../utils/api-types';
import RightSideModal from './RightSideModal';
import ReimbursementDetails from './ReimbursementDetails';
import ReimbursementForm from './ReimbursementForm';
import Slider from '@potta/components/slideover';
import { ColumnDef } from '@tanstack/react-table';
import moment from 'moment';
import {
  useApproveReimbursement,
  usePayReimbursement,
  useDeleteReimbursement,
  useGetEmployees,
} from '../hooks/useReimbursements';

interface ReimbursementDataTableWrapperProps {
  reimbursements: Reimbursement[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

// --- Helper Functions ---

// Helper for currency format
const formatTableCurrency = (amount: number, currencyCode: string = 'XAF') => {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper to get employee name from employees data
const getEmployeeName = (employeeId: string, employees: any[]) => {
  const employee = employees?.find((emp) => emp.uuid === employeeId);
  if (employee) {
    return `${employee.firstName} ${employee.lastName}`;
  }
  return `Employee ${employeeId.slice(0, 8)}...`;
};

// --- Main Wrapper Component ---

export function ReimbursementDataTableWrapper({
  reimbursements,
  isLoading = false,
  onRefresh,
}: ReimbursementDataTableWrapperProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Reimbursement | null>(null);

  // API mutations and data
  const approveMutation = useApproveReimbursement();
  const payMutation = usePayReimbursement();
  const deleteMutation = useDeleteReimbursement();
  const { data: employees } = useGetEmployees({
    limit: 100,
    sortBy: ['firstName:ASC'],
  });

  const handleApprove = (reimbursement: Reimbursement) => {
    // Show loading toast
    toast.loading('Approving...', { id: `approve-${reimbursement.uuid}` });

    // You might want to get the current user's ID from context/auth
    const approverId = 'current-user-id'; // Replace with actual approver ID
    approveMutation.mutate({
      reimbursementId: reimbursement.uuid,
      approverId,
    });
  };

  const handlePay = (reimbursement: Reimbursement) => {
    const paymentRef = `PAY-REF-${Date.now()}`;
    payMutation.mutate({
      reimbursementId: reimbursement.uuid,
      paymentRef,
    });
  };

  const handleDelete = (reimbursement: Reimbursement) => {
    if (window.confirm('Are you sure you want to delete this reimbursement?')) {
      deleteMutation.mutate(reimbursement.uuid);
    }
  };

  // Define columns for TanStack Table
  const columns: ColumnDef<Reimbursement>[] = [
    {
      accessorKey: 'employeeId',
      header: 'Employee',
      cell: ({ row: { original } }) => (
        <span className="font-medium">
          {getEmployeeName(original.employeeId, employees?.data || [])}
        </span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row: { original } }) => (
        <Badge
          variant="outline"
          className={cn('text-xs', REIMBURSEMENT_TYPE_COLORS[original.type])}
        >
          {original.type.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      accessorKey: 'expenseType',
      header: 'Expense Type',
      cell: ({ row: { original } }) => (
        <span className="text-sm">{original.expenseType}</span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row: { original } }) => (
        <span className="font-medium">
          XAF {formatTableCurrency(original.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row: { original } }) => (
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            REIMBURSEMENT_STATUS_COLORS[original.status]
          )}
        >
          {original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row: { original } }) => (
        <span className="text-sm text-gray-600">
          {moment(original.createdAt).format('MMM DD, YYYY')}
        </span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row: { original } }) => (
        <span className="text-sm text-gray-600 truncate max-w-[200px]">
          {original.description}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row: { original } }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-800 hover:bg-transparent focus:bg-transparent active:bg-transparent"
            >
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSelectedRow(original);
                setDetailsOpen(true);
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedRow(original);
                setEditOpen(true);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {original.status === 'PENDING' && (
              <DropdownMenuItem
                onClick={() => handleApprove(original)}
                className="text-green-600"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </DropdownMenuItem>
            )}
            {original.status === 'APPROVED' && (
              <DropdownMenuItem
                onClick={() => handlePay(original)}
                className="text-blue-600"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Mark as Paid
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => handleDelete(original)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <DataGrid columns={columns} data={reimbursements} isLoading={isLoading} />

      <RightSideModal
        open={detailsOpen}
        setOpen={setDetailsOpen}
        title="Reimbursement Details"
      >
        {selectedRow && <ReimbursementDetails reimbursement={selectedRow} />}
      </RightSideModal>

      <Slider
        edit={true}
        title="Edit Reimbursement"
        open={editOpen}
        setOpen={setEditOpen}
      >
        {selectedRow && (
          <ReimbursementForm
            onSubmit={() => {
              setEditOpen(false);
              onRefresh?.();
            }}
            onClose={() => setEditOpen(false)}
            initialData={selectedRow}
          />
        )}
      </Slider>
    </>
  );
}
