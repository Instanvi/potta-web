'use client';
import React, { useState } from 'react';
import RootLayout from '../../layout';
import { PageContainer } from '../../_shared/states';
import { useDataTableHandle } from '@potta/components/ui/data-table';
import TableComponents from './components/table';
import Filter from './components/filters';
import { Journal } from './utils/types';

const JournalsPage = () => {
  const [search, setSearch] = useState('');
  const [exportRows, setExportRows] = useState<Journal[]>([]);
  const { table, onTableChange } = useDataTableHandle<Journal>();

  return (
    <RootLayout>
      <PageContainer>
        
        <Filter search={search} onSearchChange={setSearch} rows={exportRows} table={table} />
        <TableComponents search={search} onRowsChange={setExportRows} onTableChange={onTableChange} />
      </PageContainer>
    </RootLayout>
  );
};

export default JournalsPage;
