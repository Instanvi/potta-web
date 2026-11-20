import React from 'react';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';

// Define the deduction type
interface Deduction {
  id: string;
  motif?: string;
  Motif?: string;
  type?: string;
  Type?: string;
  rate?: string;
  Rate?: string;
}

interface TaxTableProps {
  deductions?: Deduction[];
  onRemove?: (id: string) => void;
}

const TaxTable: React.FC<TaxTableProps> = ({ deductions = [], onRemove }) => {
  const columns = [
    {
      accessorKey: 'motif',
      header: 'Motif',
      cell: ({ row: { original } }) => (
        <div>{original.motif || original.Motif}</div>
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
      accessorKey: 'actions',
      header: '',
      cell: ({ row: { original } }) => (
        <div
          className="text-red-500 cursor-pointer"
          onClick={() => onRemove && onRemove(original.id)}
        >
          Delete
        </div>
      ),
    },
  ];

  // Use the provided deductions data or fallback to default
  const data =
    deductions.length > 0
      ? deductions
      : [
          {
            id: '1',
            motif: 'Child support',
            type: 'Legal',
            rate: 'XAF 36,000',
          },
          {
            id: '2',
            motif: 'Student Loan',
            type: 'Legal',
            rate: 'XAF 17,000',
          },
        ];

  return (
    <div className="mt-10">
      <DataGrid columns={columns} data={data} />
    </div>
  );
};

export default TaxTable;
