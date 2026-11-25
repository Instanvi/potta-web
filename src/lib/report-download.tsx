import { pdf, type DocumentProps } from '@react-pdf/renderer';
import type { ReactElement } from 'react';
import type { ReportColumn } from '@/app/(routes)/reports/utils/api';
import { ReportPdfDocument } from '@/components/documents/report-pdf-document';
import { buildReportDocxBlob } from '@/lib/export-docx';
import { buildSpreadsheetBlob, type ExportColumn } from '@/lib/export-file';
import type { PdfSeller } from '@/lib/org-to-seller';

export type ReportDownloadFormat = 'pdf' | 'docx' | 'xlsx' | 'csv';

export const REPORT_DOWNLOAD_FORMATS: { format: ReportDownloadFormat; label: string }[] = [
  { format: 'pdf', label: 'PDF (.pdf)' },
  { format: 'docx', label: 'Word (.docx)' },
  { format: 'xlsx', label: 'Excel (.xlsx)' },
  { format: 'csv', label: 'CSV (.csv)' },
];

export function rowsWithTotals(
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

function spreadsheetCell(row: Record<string, unknown>, column: ReportColumn) {
  const value = row[column.key];
  if (column.type === 'money' || column.type === 'number') {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : value == null || value === '' ? '' : String(value);
  }
  return value == null || value === '' ? '' : String(value);
}

function spreadsheetColumns(columns: ReportColumn[]): ExportColumn<Record<string, unknown>>[] {
  return columns.map((column) => ({
    key: column.key,
    header: column.label,
    value: (row) => spreadsheetCell(row, column),
  }));
}

async function pdfBlob(document: ReactElement<DocumentProps>) {
  const raw = await pdf(document).toBlob();
  return raw.type === 'application/pdf' ? raw : new Blob([raw], { type: 'application/pdf' });
}

/** Build one report file from the rows on screen. Does not touch the browser download. */
export async function buildReportDownload({
  format,
  filename,
  title,
  description,
  period,
  columns,
  rows,
  totals,
  seller,
  pdfDocument,
}: {
  format: ReportDownloadFormat;
  filename: string;
  title: string;
  description?: string;
  period?: string;
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  totals?: Record<string, number>;
  seller: PdfSeller;
  pdfDocument?: ReactElement<DocumentProps>;
}): Promise<{ blob: Blob; filename: string }> {
  if (!columns.length) throw new Error('This report has no columns to download');
  const base = filename.replace(/\.(pdf|docx|xlsx|csv)$/i, '') || 'report';
  const sheetRows = rowsWithTotals(rows, columns, totals);

  if (format === 'pdf') {
    return {
      blob: await pdfBlob(
        pdfDocument ?? (
          <ReportPdfDocument
            seller={seller}
            title={title}
            description={description}
            period={period}
            columns={columns}
            rows={rows}
            totals={totals}
          />
        ),
      ),
      filename: `${base}.pdf`,
    };
  }

  if (format === 'docx') {
    return {
      blob: await buildReportDocxBlob({
        title,
        description,
        period,
        columns,
        rows: sheetRows,
      }),
      filename: `${base}.docx`,
    };
  }

  return buildSpreadsheetBlob({
    filename: base,
    rows: sheetRows,
    columns: spreadsheetColumns(columns),
    format,
  });
}
