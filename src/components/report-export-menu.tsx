'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Button from '@potta/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import { isExpenseReportId } from '@/lib/expense-reports';
import { exportRows } from '@/lib/export-file';
import {
  reportsApi,
  type ReportColumn,
  type ReportExportFormat,
  type ReportRunParams,
} from '@/app/(routes)/reports/utils/api';

const FORMATS: { format: ReportExportFormat; label: string }[] = [
  { format: 'xlsx', label: 'Excel (.xlsx)' },
  { format: 'csv', label: 'CSV (.csv)' },
  { format: 'pdf', label: 'PDF (.pdf)' },
];

type Props = {
  reportId: string;
  title: string;
  params: ReportRunParams;
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  disabled?: boolean;
};

/** Format picker: backend export for catalog reports; client fallback for expense-proxied ids. */
export function ReportExportMenu({
  reportId,
  title,
  params,
  columns,
  rows,
  disabled,
}: Props) {
  const [busy, setBusy] = useState(false);

  const onExport = async (format: ReportExportFormat) => {
    if (busy || disabled) return;
    setBusy(true);
    try {
      if (isExpenseReportId(reportId)) {
        if (format === 'pdf') {
          window.print();
          return;
        }
        await exportRows({
          filename: reportId,
          rows,
          columns: columns.map((c) => ({
            key: c.key,
            header: c.label,
          })),
          format,
        });
        return;
      }
      await reportsApi.export(reportId, { ...params, format });
    } finally {
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          text={busy ? 'Exporting…' : 'Export'}
          theme="lightBlue"
          color
          disabled={disabled || busy || rows.length === 0}
          icon={<i className="ri-upload-2-line" />}
          rightIcon={<ChevronDown className="size-4" />}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 bg-white">
        {FORMATS.map(({ format, label }) => (
          <DropdownMenuItem
            key={format}
            className="cursor-pointer"
            onSelect={() => void onExport(format)}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
