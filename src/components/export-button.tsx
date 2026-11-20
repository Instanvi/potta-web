'use client';

import Button from '@potta/components/button';
import { exportRows, type ExportColumn, type ExportFormat } from '@/lib/export-file';

/** Shared lime Export control used on every list toolbar. */
export function ExportButton<T>({
  filename,
  rows,
  columns,
  format = 'xlsx',
  disabled,
}: {
  filename: string;
  rows: T[];
  columns: ExportColumn<T>[];
  format?: ExportFormat;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      text="Export"
      theme="lightBlue"
      color
      disabled={disabled || rows.length === 0}
      icon={<i className="ri-upload-2-line" />}
      onClick={() =>
        void exportRows({
          filename,
          rows,
          columns,
          format,
        })
      }
    />
  );
}
