import React from 'react';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';

const PTOTab = ({ employee }: { employee: any }) => (
  <div className="mt-6">
    <DataGrid
      columns={[
        { accessorKey: 'type', header: 'Type' },
        { accessorKey: 'cycle_type', header: 'Cycle' },
        { accessorKey: 'accrual_rate', header: 'Accrual Rate' },
        { accessorKey: 'total_entitled_days', header: 'Entitled Days' },
        { accessorKey: 'days_used', header: 'Used' },
        { accessorKey: 'days_remaining', header: 'Remaining' },
        { accessorKey: 'status', header: 'Status' },
      ]}
      data={employee?.paid_time_off || []}
    />
  </div>
);

export default PTOTab;
