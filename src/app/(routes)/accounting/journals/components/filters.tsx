'use client';
import React, { useState } from 'react';
import Search from '@potta/components/search';
import { Can } from '@/components/auth/can';
import type { Table } from '@tanstack/react-table';
import { ListActionsMenu } from '@/components/list-actions-menu';
import { ListToolbar } from '../../../_shared/states';
import { ExportButton } from '@/components/export-button';
import { formatAmount, formatDate } from '../../../_shared/format';
import { Journal } from '../utils/types';
import JournalSlider from './journalSlider';

const sumLines = (journal: Journal, key: 'debit' | 'credit') =>
  (journal.lines ?? []).reduce((sum, line) => sum + Number(line[key] ?? 0), 0);

interface FilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  rows?: Journal[];
  table?: Table<Journal> | null;
}

const Filter = ({ search, onSearchChange, rows = [], table }: FilterProps) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <ListToolbar
      className="mb-4"
      actions={
        <>
                    <ListActionsMenu table={table}>
          <ExportButton
            asItem
            filename="journals"
            rows={rows}
            columns={[
              {
                key: 'number',
                header: 'Entry #',
                value: (row) => row.number || row.referenceNumber || '',
              },
              {
                key: 'date',
                header: 'Date',
                value: (row) => formatDate(row.date),
              },
              { key: 'type', header: 'Type' },
              { key: 'description', header: 'Description' },
              {
                key: 'debit',
                header: 'Debit',
                value: (row) => formatAmount(sumLines(row, 'debit')),
              },
              {
                key: 'credit',
                header: 'Credit',
                value: (row) => formatAmount(sumLines(row, 'credit')),
              },
              {
                key: 'source',
                header: 'Source',
                value: (row) => row.sourceDocumentType || 'Manual',
              },
            ]}
          />
          </ListActionsMenu>
          <Can resource="JournalEntries" action="create">
            <JournalSlider open={isCreateOpen} setOpen={setIsCreateOpen} />
          </Can>
        </>
      }
    >
      <Search
        placeholder="Search entries"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onClear={() => onSearchChange('')}
        className="w-full sm:max-w-xs"
      />
    </ListToolbar>
  );
};

export default Filter;
