// apps/potta/src/app/(routes)/payroll/people/components/benefit/components/benefitTable.tsx

import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
import React from 'react';

// Define the benefit type to match the parent component
interface Benefit {
  uuid?: string;
  id?: string;
  name?: string;
  Benefit?: string;
  type?: string;
  Type?: string;
  rate?: string;
  Rate?: string;
  provider?: string;
  Provider?: string;
}

interface BenefitTableProps {
  benefits?: Benefit[];
  onRemove?: (id: string) => void;
}

const BenefitTable: React.FC<BenefitTableProps> = ({
  benefits = [],
  onRemove,
}) => {
  const columns = [
    {
      accessorKey: 'name',
      header: 'Benefit',
      cell: ({ row: { original } }) => (
        <div>{original.name || original.Benefit}</div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row: { original } }) => (
        <div>{original.type || original.Type}</div>
      ),
    },
    {
      accessorKey: 'rate',
      header: 'Rate',
      cell: ({ row: { original } }) => (
        <div>{original.rate || original.Rate}</div>
      ),
    },
    {
      accessorKey: 'provider',
      header: 'Provider',
      cell: ({ row: { original } }) => (
        <div>{original.provider || original.Provider}</div>
      ),
    },
    {
      accessorKey: 'actions',
      header: '',
      cell: ({ row: { original } }) => (
        <div
          className="text-red-500 cursor-pointer"
          onClick={() =>
            onRemove && onRemove(original.uuid || original.id || '')
          }
        >
          Delete
        </div>
      ),
    },
  ];

  // FIX: Always ensure we pass an array to the MyTable component
  const data = benefits && benefits.length > 0 ? benefits : [];

  return (
    <div className="mt-10">
      <DataGrid columns={columns} data={data} />
    </div>
  );
};

export default BenefitTable;
