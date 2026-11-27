'use client';

import { useState } from 'react';
import Button from '@potta/components/button';
import { DropdownMenuItem } from '@potta/components/shadcn/dropdown';
import { exportRows, type ExportColumn, type ExportFormat } from '@/lib/export-file';

/** Shared lime Export control used on every list toolbar. */
export function ExportButton<T>({
  filename,
  rows,
  columns,
  format = 'xlsx',
  disabled,
  /** When set, fetch all matching rows before exporting (not just the visible page). */
  fetchAllRows,
  /** Render as an item inside ListActionsMenu instead of a toolbar button. */
  asItem,
}: {
  filename: string;
  rows: T[];
  columns: ExportColumn<T>[];
  format?: ExportFormat;
  disabled?: boolean;
  fetchAllRows?: () => Promise<T[]>;
  asItem?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const blocked = disabled || busy || (!fetchAllRows && rows.length === 0);
  const run = () => {
    void (async () => {
      try {
        setBusy(true);
        const exportData = fetchAllRows ? await fetchAllRows() : rows;
        if (!exportData.length) return;
        await exportRows({
          filename,
          rows: exportData,
          columns,
          format,
        });
      } finally {
        setBusy(false);
      }
    })();
  };

  if (asItem) {
    return (
      <DropdownMenuItem disabled={blocked} className="cursor-pointer" onSelect={run}>
        <i className="ri-upload-2-line mr-2" />
        {busy ? 'Exporting…' : 'Export'}
      </DropdownMenuItem>
    );
  }

  return (
    <Button
      type="button"
      text={busy ? 'Exporting…' : 'Export'}
      theme="lightBlue"
      color
      disabled={blocked}
      icon={<i className="ri-upload-2-line" />}
      onClick={run}
    />
  );
}
