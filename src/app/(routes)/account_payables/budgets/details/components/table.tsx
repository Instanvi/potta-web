// src/components/PaymentRequestDataTableWrapper.tsx (New File)
'use client';

import React from 'react';

import {
  MoreHorizontal,
  Check as CheckIcon,
  Briefcase,
  Landmark,
} from 'lucide-react'; // Import necessary icons
import { PaymentMethod, PaymentRequest } from '../utils/types';
import { cn } from '@potta/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import { Button } from '@potta/components/shadcn/button';
import MyTable from '@potta/components/table';
import Icon from '@potta/components/icon_fonts/icon';

interface PaymentRequestDataTableWrapperProps {
  requests: PaymentRequest[];
  isLoading?: boolean; // Add a loading state prop
}

// --- Helper Functions (can be moved to utils) ---

// Helper to render payment method icon (same as before)
const PaymentMethodIcon: React.FC<{ method: PaymentMethod }> = ({ method }) => {
  const IconComponent = method.iconComponent;
  const sizeClass = 'h-5 w-5';

  return (
    <div
      className={cn(
        'h-7 w-7 rounded-full flex items-center justify-center',
        method.bgColorClass || 'bg-gray-100'
      )}
    >
      {method.iconUrl ? (
        <img
          src={method.iconUrl}
          alt={method.name}
          className="h-5 w-5 object-contain"
        />
      ) : IconComponent ? (
        <IconComponent
          className={cn(sizeClass, method.iconColorClass || 'text-gray-600')}
        />
      ) : (
        <span className="text-xs font-medium">?</span>
      )}
    </div>
  );
};

// Helper for currency format (same as before)
const formatTableCurrency = (amount: number, currencyCode: string = 'XAF') => {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// --- Main Wrapper Component ---

export function PaymentRequestDataTableWrapper({
  requests,
  isLoading = false,
}: PaymentRequestDataTableWrapperProps) {
  // Define columns for react-data-table-component
  const columns = React.useMemo(
    () => [
      {
        name: 'Ref',
        selector: (row: PaymentRequest) =>
          row.ref === 'Today' ? row.date : row.ref, // Use date if ref is 'Today' for sorting potentially
        sortable: true,
        cell: (row: PaymentRequest) =>
          row.ref === 'Today' ? (
            <span className="italic text-gray-600">Today</span>
          ) : (
            row.date
          ),
        minWidth: '100px',
      },
      {
        name: 'Made By',
        selector: (row: PaymentRequest) => row.madeBy,
        sortable: true,
        cell: (row: PaymentRequest) => (
          <span className="font-medium">{row.madeBy}</span>
        ),
        minWidth: '120px',
      },
      {
        name: 'Made To',
        selector: (row: PaymentRequest) => row.madeTo,
        sortable: true,
        minWidth: '100px',
      },
      {
        name: 'Category',
        selector: (row: PaymentRequest) => row.category,
        sortable: true,
        minWidth: '100px',
      },
      {
        name: 'Amount',
        selector: (row: PaymentRequest) => row.amount,
        sortable: true,

        cell: (row: PaymentRequest) => (
          <span className="font-medium">
            {row.currency} {formatTableCurrency(row.amount)}
          </span>
        ),
        minWidth: '100px',
      },
      {
        name: 'Method',
        cell: (row: PaymentRequest) => (
          <PaymentMethodIcon method={row.method} />
        ),
        center: true,
        width: '100px', // Fixed width for icon column
      },
      {
        name: 'Request Status',
        center: true,
        cell: (row: PaymentRequest) => (
          <div className="border-r">
            <div className="flex items-center gap-3  w-fit px-3 py-0.5 border border-green-500 bg-green-50 text-green-700">
              <div className="flex items-center justify-center text-white bg-green-700 rounded-full size-4">
                <Icon icon="material-symbols:check" width="20" height="20" />
              </div>
              Approved
            </div>
          </div>
        ),
        minWidth: '100px',
      },
      {
        name: 'Actions',
        button: true, // Important for click events on elements within the cell
        allowOverflow: true, // Important for dropdown menus
        ignoreRowClick: true, // Prevent row click when clicking the button/menu
        width: '100px', // Fixed width
        cell: (row: PaymentRequest) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-800"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => alert(`Viewing ${row.id}`)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert(`Editing ${row.id}`)}>
                Edit Request
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert(`Rejecting ${row.id}`)}>
                Reject
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => alert(`Deleting ${row.id}`)}
              >
                Delete Request
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  ); // Empty dependency array ensures columns are defined only once

  return (
    <MyTable
      columns={columns}
      data={requests}
      selectable={true} // Enable checkboxes as per design
      pagination={false} // Disable pagination as per design
      pending={isLoading} // Pass loading state
      // --- Add these if/when implementing server-side pagination ---
      // paginationServer={true}
      // paginationTotalRows={totalRowCount}
      // onChangePage={handlePageChange}
      // onChangeRowsPerPage={handlePerRowsChange}
    />
  );
}
