'use client';
import React, { useState } from 'react';
import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';
import TableComponents from './components/table';
import Filter from './components/filters';

const JournalsPage = () => {
  const [search, setSearch] = useState('');

  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Journals"
          description="Every posted journal entry, from sales, purchases and manual journals."
        />
        <Filter search={search} onSearchChange={setSearch} />
        <TableComponents search={search} />
      </PageContainer>
    </RootLayout>
  );
};

export default JournalsPage;
