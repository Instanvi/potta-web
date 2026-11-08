'use client';
import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Trash2 } from 'lucide-react';
import { DataTable } from '@potta/components/ui/data-table';
import { Can } from '@/components/auth/can';
import { formatAmount, formatDate } from '../../../_shared/format';
import { EmptyState, ErrorState } from '../../../_shared/states';
import useGetJournalEntries from '../hooks/useGetJournalEntries';
import { Journal } from '../utils/types';
import DeleteModal from './deleteModal';
import JournalViewSlider from './journalViewSlider';

const sumLines = (journal: Journal, key: 'debit' | 'credit') =>
  (journal.lines ?? []).reduce((sum, line) => sum + Number(line[key] ?? 0), 0);

const JournalEntriesTable = () => {
  const { data, isLoading, error, refetch } = useGetJournalEntries();
  const [viewId, setViewId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      [...(data ?? [])].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [data]
  );

  const columns: ColumnDef<Journal>[] = [
    {
      accessorKey: 'number',
      header: 'Entry #',
      cell: ({ row }) => row.original.number || row.original.referenceNumber || '—',
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.date),
    },
    { accessorKey: 'type', header: 'Type' },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="line-clamp-1 max-w-[320px]">{row.original.description}</span>
      ),
    },
    {
      id: 'debit',
      header: 'Debit',
      cell: ({ row }) => formatAmount(sumLines(row.original, 'debit')),
    },
    {
      id: 'credit',
      header: 'Credit',
      cell: ({ row }) => formatAmount(sumLines(row.original, 'credit')),
    },
    {
      id: 'source',
      header: 'Source',
      cell: ({ row }) => row.original.sourceDocumentType || 'Manual',
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            title="View"
            className="p-2 hover:bg-gray-100"
            onClick={() => setViewId(row.original.uuid)}
          >
            <Eye className="h-4 w-4" />
          </button>
          <Can resource="JournalEntries" action="delete">
            <button
              type="button"
              title="Delete"
              className="p-2 text-red-600 hover:bg-red-50"
              onClick={() => setDeleteId(row.original.uuid)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Can>
        </div>
      ),
    },
  ];

  if (error) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (!isLoading && rows.length === 0)
    return (
      <EmptyState
        title="No journal entries"
        description="Entries posted from sales, purchases and manual journals appear here."
      />
    );

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        withRowSelection={false}
        onRowClick={(row) => setViewId(row.uuid)}
      />
      <JournalViewSlider
        journalId={viewId ?? undefined}
        open={!!viewId}
        setOpen={(open) => !open && setViewId(null)}
      />
      <DeleteModal
        journalID={deleteId ?? ''}
        open={!!deleteId}
        setOpen={(open) => !open && setDeleteId(null)}
      />
    </>
  );
};

export default JournalEntriesTable;
