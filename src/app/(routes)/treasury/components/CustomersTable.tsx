import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
import DynamicFilter from '@potta/components/dynamic-filter';
import { Filter, Calendar, DollarSign, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import { Button } from '@potta/components/shadcn/button';
import {
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';
import Image from 'next/image';
import useGetAllCustomers from '../../customers/hooks/useGetAllCustomers';
import { CustomerFilter } from '../../customers/utils/types';

const PhoneFlag = ({ phoneNumber }: { phoneNumber: string | number }) => {
  const convertToE164 = (phoneNumber: string | number) => {
    if (typeof phoneNumber === 'number') {
      return phoneNumber.toString();
    }
    return phoneNumber;
  };
  const phoneNumberObj = parsePhoneNumberFromString(convertToE164(phoneNumber));
  const countryCode = phoneNumberObj?.country;
  const number = phoneNumberObj?.number;
  return countryCode ? (
    <div className="flex items-center">
      <div className="">
        <Image
          width={200}
          height={200}
          className="w-full h-full object-cover"
          src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`}
          alt={countryCode}
        />
      </div>
      {number}
    </div>
  ) : (
    <p>Invalid Number</p>
  );
};

const CustomersTable: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const filter: CustomerFilter = { page, limit };
  const { data: customer, isLoading, error } = useGetAllCustomers(filter);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredData = React.useMemo(() => {
    if (!customer?.data) return [];

    return customer.data.filter((customer) => {
      const searchMatch =
        !searchValue ||
        customer.firstName?.toLowerCase().includes(searchValue.toLowerCase()) ||
        customer.lastName?.toLowerCase().includes(searchValue.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchValue.toLowerCase()) ||
        customer.phone?.includes(searchValue);

      const statusMatch =
        statusFilter === 'all' || customer.status === statusFilter;
      const typeMatch = typeFilter === 'all' || customer.type === typeFilter;

      return searchMatch && statusMatch && typeMatch;
    });
  }, [customer?.data, searchValue, statusFilter, typeFilter]);

  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      icon: <Filter className="w-4 h-4 text-gray-400" />,
      options: [
        { label: 'All Status', value: 'all' },
        { label: 'Enabled', value: 'enabled' },
        { label: 'Disabled', value: 'disabled' },
        { label: 'Pending', value: 'pending' },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
    {
      key: 'type',
      label: 'Type',
      icon: <Filter className="w-4 h-4 text-gray-400" />,
      options: [
        { label: 'All Types', value: 'all' },
        { label: 'Individual', value: 'individual' },
        { label: 'Business', value: 'business' },
        { label: 'Corporate', value: 'corporate' },
      ],
      value: typeFilter,
      onChange: setTypeFilter,
    },
  ];

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'firstName',
      header: 'Customer Name',
      cell: ({ row: { original } }) => (
        <div className="font-medium text-gray-900">
          {original.firstName} {original.lastName}
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Telephone',
      cell: ({ row: { original } }) => (
        <PhoneFlag phoneNumber={original.phone} />
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row: { original } }) => (
        <div className="text-gray-600">{original.email}</div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row: { original } }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {original.type}
        </span>
      ),
    },
    {
      accessorKey: 'creditLimit',
      header: 'Credit Limit',
      cell: ({ row: { original } }) => (
        <div className="font-medium">
          {original.creditLimit
            ? formatCurrency(original.creditLimit, 'XAF')
            : 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row: { original } }) => {
        const status = original.status || 'enabled';
        const statusColorMap: Record<string, string> = {
          pending: 'bg-yellow-100 text-yellow-800',
          schedule: 'bg-blue-100 text-blue-800',
          complete: 'bg-green-100 text-green-800',
          enabled: 'bg-green-100 text-green-800',
          disabled: 'bg-red-100 text-red-800',
          available: 'bg-teal-100 text-teal-800',
          expired: 'bg-gray-100 text-gray-800',
          taken: 'bg-purple-100 text-purple-800',
        };

        const colorClass =
          statusColorMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created Date',
      cell: ({ row: { original } }) => (
        <div className="text-gray-900">
          {original.createdAt ? formatDate(original.createdAt) : 'N/A'}
        </div>
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
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-800"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => console.log('View customer:', original.uuid)}
            >
              <i className="ri-eye-line mr-2"></i>
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log('Edit customer:', original.uuid)}
            >
              <i className="ri-edit-line mr-2"></i>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => console.log('Delete customer:', original.uuid)}
            >
              <i className="ri-delete-bin-line mr-2"></i>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (error) {
    return (
      <div className="bg-white p-6 ">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-gray-900">Customers</h2>
        </div>
        <div className="min-h-60 items-center flex justify-center">
          <p className="text-red-600 text-center">
            An error occurred while fetching customers. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 ">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-gray-900">Customers</h2>
        <span className="text-sm text-gray-500">
          {filteredData.length} of {customer?.data?.length || 0} customers
        </span>
      </div>

      <DynamicFilter
        searchValue={searchValue}
        onSearchChange={(e) => setSearchValue(e.target.value)}
        onSearchClear={() => setSearchValue('')}
        searchPlaceholder="Search customers, emails, or phone numbers..."
        filters={filterConfig}
        className="mb-6"
      />

      <DataGrid
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        onRowClick={(row) => console.log('Clicked customer:', row)}
      />
    </div>
  );
};

export default CustomersTable;
