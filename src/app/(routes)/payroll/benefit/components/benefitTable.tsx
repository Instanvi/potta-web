import React from 'react';
import moment from 'moment';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@potta/components/shadcn/dropdown';
import {
  formatCurrencyWithoutDecimals,
  formatPercentageWithoutDecimals,
} from '../utils/formUtils';

interface Benefit {
  uuid: string;
  name: string;
  description: string;
  type: 'FINANCIAL' | 'SERVICE' | 'REDEEMABLE';
  value: string;
  cycle:
    | 'DAILY'
    | 'WEEKLY'
    | 'MONTHLY'
    | 'QUARTERLY'
    | 'ANNUALLY'
    | 'ONE_TIME'
    | 'NONE';
  is_taxable: boolean;
  tax_cap: string;
  rate: string;
  salary_cap: string;
  max_amount: string;
  provider: string;
  expires_at: string | null;
  role_based: boolean;
  is_default: boolean;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  eligible_roles: any[];
  createdAt: string;
  updatedAt: string;
}

interface BenefitTableProps {
  benefits: Benefit[];
  onViewBenefit: (id: string) => void;
  onEditBenefit: (id: string) => void;
  onDeleteBenefit: (id: string) => void;
  onRowClick: (benefit: Benefit) => void;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const BenefitTable: React.FC<BenefitTableProps> = ({
  benefits,
  onViewBenefit,
  onEditBenefit,
  onDeleteBenefit,
  onRowClick,
  totalPages,
  pageSize,
  onPageChange,
  isLoading = false,
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: 'bg-green-100 text-green-800', text: 'Active' },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      EXPIRED: { color: 'bg-red-100 text-red-800', text: 'Expired' },
      SUSPENDED: { color: 'bg-gray-100 text-gray-800', text: 'Suspended' },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <span
        className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const getBenefitTypeIcon = (type: string) => {
    switch (type) {
      case 'FINANCIAL':
        return <i className="ri-money-dollar-circle-line text-green-600"></i>;
      case 'SERVICE':
        return <i className="ri-service-line text-blue-600"></i>;
      case 'REDEEMABLE':
        return <i className="ri-gift-line text-purple-600"></i>;
      default:
        return <i className="ri-gift-line text-gray-600"></i>;
    }
  };

  const formatCurrency = (value: string) => {
    return formatCurrencyWithoutDecimals(value);
  };

  const formatCycle = (cycle: string) => {
    const cycleMap = {
      DAILY: 'Daily',
      WEEKLY: 'Weekly',
      MONTHLY: 'Monthly',
      QUARTERLY: 'Quarterly',
      ANNUALLY: 'Annually',
      ONE_TIME: 'One Time',
      NONE: 'None',
    };
    return cycleMap[cycle as keyof typeof cycleMap] || cycle;
  };

  const determineRateType = (rate: string, value: string) => {
    const rateNum = parseFloat(rate);
    const valueNum = parseFloat(value);

    // If rate is a reasonable percentage value (1-100), it's likely a percentage
    if (rateNum >= 1 && rateNum <= 100) {
      return 'Percentage';
    }

    // If the rate is the same as the value, it's likely a flat rate
    if (valueNum > 0 && Math.abs(rateNum - valueNum) < 1) {
      return 'Flat Rate';
    }

    // If value is very large, it's likely a flat rate
    if (valueNum > 100) {
      return 'Flat Rate';
    }

    // Default to flat rate
    return 'Flat Rate';
  };

  const formatRate = (rate: string, value: string) => {
    if (!rate || rate === '0') return 'N/A';

    // If rate is already a percentage (contains %), return as is
    if (rate.includes('%')) {
      return rate;
    }

    const rateNum = parseFloat(rate);
    if (isNaN(rateNum)) return 'N/A';

    const rateType = determineRateType(rate, value);

    if (rateType === 'Percentage') {
      return `${rateNum.toFixed(1)}%`;
    } else {
      return formatCurrency(rate);
    }
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Benefit',
      cell: ({ row: { original } }) => (
        <div className="flex items-center py-2">
          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
            {getBenefitTypeIcon(original.type)}
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {original.name}
            </div>
            <div
              className="text-xs text-gray-500 truncate max-w-[180px]"
              title={original.description}
            >
              {original.description || 'No description'}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type & Category',
      cell: ({ row: { original } }) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {original.type.charAt(0) + original.type.slice(1).toLowerCase()}
          </div>
          <div className="text-xs text-gray-500">
            {formatCycle(original.cycle)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'value',
      header: 'Value & Rate',
      cell: ({ row: { original } }) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {formatCurrency(original.value)}
          </div>
          <div className="text-xs text-gray-500">
            Rate: {formatRate(original.rate, original.value)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'salary_cap',
      header: 'Salary Cap',
      cell: ({ row: { original } }) => (
        <div className="text-sm text-gray-900">
          {formatCurrency(original.salary_cap)}
        </div>
      ),
    },
    {
      accessorKey: 'is_taxable',
      header: 'Tax Info',
      cell: ({ row: { original } }) => (
        <div>
          <div className="text-sm text-gray-900">
            {original.is_taxable ? 'Taxable' : 'Tax-free'}
          </div>
          {original.is_taxable && original.tax_cap && (
            <div className="text-xs text-gray-500">
              Cap: {formatCurrency(original.tax_cap)}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'provider',
      header: 'Provider',
      cell: ({ row: { original } }) => (
        <div className="text-sm text-gray-900">
          {original.provider || 'Internal'}
        </div>
      ),
    },
    {
      accessorKey: 'expires_at',
      header: 'Expires',
      cell: ({ row: { original } }) => (
        <div className="text-sm text-gray-900">
          {original.expires_at
            ? moment(original.expires_at).format('MMM DD, YYYY')
            : 'No expiry'}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row: { original } }) => getStatusBadge(original.status),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row: { original } }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <i className="ri-more-2-fill text-xl text-gray-600"></i>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onViewBenefit(original.uuid)}>
              <i className="ri-eye-line mr-2"></i> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditBenefit(original.uuid)}>
              <i className="ri-edit-line mr-2"></i> Edit
            </DropdownMenuItem>
            {/* <DropdownMenuItem
              onClick={() => onDeleteBenefit(original.uuid)}
              className="text-red-600"
            >
              <i className="ri-delete-bin-line mr-2"></i> Delete
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="bg-white">
      <DataGrid
        columns={columns}
        data={benefits || []}
        onRowClick={onRowClick}
        isLoading={isLoading}
        noDataComponent={
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <i className="ri-inbox-line text-4xl mb-4"></i>
            <p className="text-lg font-medium mb-2">No benefits found</p>
            <p className="text-sm">Create your first benefit to get started</p>
          </div>
        }
      />
    </div>
  );
};

export default BenefitTable;
export type { Benefit, BenefitTableProps };
