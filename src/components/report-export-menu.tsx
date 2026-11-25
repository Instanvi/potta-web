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
import { toast } from 'sonner';
import { exportRows } from '@/lib/export-file';
import { downloadReportDocx } from '@/lib/export-docx';
import { ReportPdfDocument } from '@/components/documents/report-pdf-document';
import { useOrganizationProfile } from '@/hooks/use-organization-profile';
import { downloadReactPdf } from '@/lib/download-react-pdf';
import { orgToSeller } from '@/lib/org-to-seller';
import type { ReportColumn } from '@/app/(routes)/reports/utils/api';

export type ReportDownloadFormat = 'pdf' | 'docx' | 'xlsx' | 'csv';

const FORMATS: { format: ReportDownloadFormat; label: string }[] = [
  { format: 'pdf', label: 'PDF (.pdf)' },
  { format: 'docx', label: 'Word (.docx)' },
  { format: 'xlsx', label: 'Excel (.xlsx)' },
  { format: 'csv', label: 'CSV (.csv)' },
];

type Props = {
  reportId: string;
  title: string;
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  totals?: Record<string, number>;
  disabled?: boolean;
  /** Period / as-of label printed under the title on generated PDFs. */
  period?: string;
  description?: string;
};

/** Download the report on screen as PDF, Word, Excel, or CSV. */
export function ReportExportMenu({
  reportId,
  title,
  columns,
  rows,
  totals,
  disabled,
  period,
  description,
}: Props) {
  const [busy, setBusy] = useState(false);
  const { data: org } = useOrganizationProfile();

  const onExport = async (format: ReportDownloadFormat) => {
    if (busy || disabled) return;
    setBusy(true);
    const filename = (title || reportId).trim() || 'report';
    try {
      if (!columns.length) throw new Error('This report has no columns to download');
      const sheetRows = rowsWithTotals(rows, columns, totals);
      if (format === 'pdf') {
        await downloadReactPdf(
          <ReportPdfDocument
            seller={orgToSeller(org)}
            title={filename}
            description={description}
            period={period}
            columns={columns}
            rows={rows}
            totals={totals}
          />,
          filename,
        );
      } else if (format === 'docx') {
        await downloadReportDocx({
          filename,
          title: filename,
          description,
          period,
          columns,
          rows: sheetRows,
        });
      } else {
        await exportRows({
          filename,
          rows: sheetRows,
          columns: columns.map((column) => ({
            key: column.key,
            header: column.label,
            value: (row) => spreadsheetCell(row, column),
          })),
          format,
        });
      }
      toast.success(`Downloaded ${filename}`);
    } catch (err) {
      console.error(err);
      toast.error('Could not download this report. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          text={busy ? 'Downloading…' : 'Download'}
          theme="lightBlue"
          color
          disabled={disabled || busy || rows.length === 0}
          icon={<i className="ri-download-2-line" />}
          rightIcon={<ChevronDown className="size-4" />}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white">
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

function spreadsheetCell(row: Record<string, unknown>, column: ReportColumn) {
  const value = row[column.key];
  if (column.type === 'money' || column.type === 'number') {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : value == null || value === '' ? '' : String(value);
  }
  return value == null || value === '' ? '' : String(value);
}

function rowsWithTotals(
  rows: Record<string, unknown>[],
  columns: ReportColumn[],
  totals?: Record<string, number>,
) {
  if (!totals || !Object.keys(totals).length || columns.length === 0) return rows;
  const matched = columns.some((column) => totals[column.key] != null);
  if (matched) {
    const totalRow: Record<string, unknown> = {};
    columns.forEach((column, index) => {
      if (totals[column.key] != null) totalRow[column.key] = totals[column.key];
      else if (index === 0) totalRow[column.key] = 'Total';
    });
    return [...rows, totalRow];
  }
  return [
    ...rows,
    ...Object.entries(totals).map(([label, amount]) => ({
      [columns[0].key]: label,
      [columns[Math.min(1, columns.length - 1)].key]: amount,
    })),
  ];
}
