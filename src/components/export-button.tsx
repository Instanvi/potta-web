'use client';

import { useState } from 'react';
import Button from '@potta/components/button';
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
}: {
  filename: string;
  rows: T[];
  columns: ExportColumn<T>[];
  format?: ExportFormat;
  disabled?: boolean;
  fetchAllRows?: () => Promise<T[]>;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <Button
      type="button"
      text={busy ? 'Exporting…' : 'Export'}
      theme="lightBlue"
      color
      disabled={disabled || busy || (!fetchAllRows && rows.length === 0)}
      icon={<i className="ri-upload-2-line" />}
      onClick={() => {
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
      }}
    />
  );
}
