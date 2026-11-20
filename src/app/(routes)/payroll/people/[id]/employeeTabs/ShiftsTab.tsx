import React from 'react';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';

const ShiftsTab = ({ employee }: { employee: any }) => (
  <div className="mt-6">
    <DataGrid
      columns={[
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'start_time', header: 'Start Time' },
        { accessorKey: 'end_time', header: 'End Time' },
        { accessorKey: 'break_minutes', header: 'Break (min)' },
        {
          accessorKey: 'is_active',
          header: 'Active',
          cell: ({ row: { original } }) => (original.is_active ? 'Yes' : 'No'),
        },
      ]}
      data={employee?.shifts || []}
    />
  </div>
);

export default ShiftsTab;
