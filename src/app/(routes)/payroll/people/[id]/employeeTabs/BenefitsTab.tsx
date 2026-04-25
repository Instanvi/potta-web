import React from 'react';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';

const BenefitsTab = ({ employee }: { employee: any }) => (
  <div className="mt-6">
    <DataGrid
      columns={[
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'type', header: 'Type' },
        { accessorKey: 'value', header: 'Value' },
        { accessorKey: 'provider', header: 'Provider' },
      ]}
      data={employee?.benefits || []}
    />
  </div>
);

export default BenefitsTab;
