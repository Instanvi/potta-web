'use client';
import React, { useState } from 'react';
import RootLayout from '../../layout';
import { PageContainer } from '../../_shared/states';
import TableComponents from './components/table';
import Filter from './components/filters';
import { Journal } from './utils/types';

const JournalsPage = () => {
  const [search, setSearch] = useState('');
  const [exportRows, setExportRows] = useState<Journal[]>([]);

  return (
    <RootLayout>
      <PageContainer>
        
        <Filter search={search} onSearchChange={setSearch} rows={exportRows} />
        <TableComponents search={search} onRowsChange={setExportRows} />
      </PageContainer>
    </RootLayout>
  );
};

export default JournalsPage;
