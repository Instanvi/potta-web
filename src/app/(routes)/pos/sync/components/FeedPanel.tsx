'use client';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@potta/components/ui/data-table';
import { DateRangePicker } from '@potta/components/ui/date-picker';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@potta/components/ui/sheet';
import { formatDateTime } from '../../../_shared/format';
import { EmptyState, ErrorState } from '../../../_shared/states';
import { useFeed } from '../hooks';
import { FeedItem, PosSyncKind } from '../utils/api';
import { KindFilter, Mono, useCursorTable } from './shared';

const LIMIT = 100;

const FeedPanel = () => {
  const [kinds, setKinds] = useState<PosSyncKind[]>([]);
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const [payloadItem, setPayloadItem] = useState<FeedItem | null>(null);
  const pager = useCursorTable(LIMIT);
  const { data, isLoading, error, refetch } = useFeed({
    cursor: pager.cursor,
    limit: pager.limit,
    kinds: kinds.length ? kinds : undefined,
    from: range.from ? `${range.from}T00:00:00.000Z` : undefined,
    to: range.to ? `${range.to}T23:59:59.999Z` : undefined,
  });
  const items = data?.items ?? [];

  const resetWith = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    pager.reset();
  };

  const columns: ColumnDef<FeedItem>[] = [
    {
      accessorKey: 'updatedAt',
      header: 'Updated',
      cell: ({ row }) => <span className="whitespace-nowrap">{formatDateTime(row.original.updatedAt)}</span>,
    },
    { accessorKey: 'kind', header: 'Kind' },
    {
      accessorKey: 'externalId',
      header: 'External id',
      cell: ({ row }) => <Mono>{row.original.externalId}</Mono>,
    },
    { accessorKey: 'op', header: 'Op' },
    {
      id: 'payload',
      header: '',
      enableSorting: false,
      cell: ({ row }) =>
        row.original.payload ? (
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => setPayloadItem(row.original)}
          >
            Payload
          </button>
        ) : null,
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <KindFilter value={kinds} onChange={resetWith(setKinds)} />
        <DateRangePicker
          label="Updated between"
          className="w-72"
          clearable
          value={range}
          onChange={resetWith(setRange)}
        />
        {data?.highWatermark && (
          <p className="pb-3 text-xs text-muted-foreground">
            High watermark: {formatDateTime(data.highWatermark)}
          </p>
        )}
      </div>
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !isLoading && items.length === 0 && pager.pageIndex === 0 ? (
        <EmptyState
          title="No changes"
          description="The feed lists catalog and document changes the desktop app will pull."
        />
      ) : (
        <DataTable
          columns={columns}
          data={items}
          isLoading={isLoading}
          withRowSelection={false}
          {...pager.tableProps(data, items.length)}
        />
      )}
      <Sheet open={!!payloadItem} onOpenChange={(open) => !open && setPayloadItem(null)}>
        <SheetContent side="right" className="flex h-full w-full flex-col p-0 sm:max-w-[560px]">
          <SheetHeader className="border-b border-black/10 px-4 py-4">
            <SheetTitle>Payload</SheetTitle>
            <SheetDescription className="text-muted-foreground">
              {payloadItem?.kind} · <Mono>{payloadItem?.externalId}</Mono>
            </SheetDescription>
          </SheetHeader>
          <pre className="flex-1 overflow-auto bg-main-bg p-4 text-xs">
            {JSON.stringify(payloadItem?.payload, null, 2)}
          </pre>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default FeedPanel;
