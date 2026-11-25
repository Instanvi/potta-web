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
import { ReportPdfDocument } from '@/components/documents/report-pdf-document';
import { useOrganizationProfile } from '@/hooks/use-organization-profile';
import { downloadReactPdf } from '@/lib/download-react-pdf';
import { orgToSeller } from '@/lib/org-to-seller';
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
  /** Period / as-of label printed under the title on generated PDFs. */
  period?: string;
  description?: string;
};

/** Format picker: backend export for catalog reports; client fallback for expense-proxied ids. */
export function ReportExportMenu({
  reportId,
  title,
  params,
  columns,
  rows,
  disabled,
  period,
  description,
}: Props) {
  const [busy, setBusy] = useState(false);
  const { data: org } = useOrganizationProfile();

  const onExport = async (format: ReportExportFormat) => {
    if (busy || disabled) return;
    setBusy(true);
    try {
      if (isExpenseReportId(reportId)) {
        if (format === 'pdf') {
          await downloadReactPdf(
            <ReportPdfDocument
              seller={orgToSeller(org)}
              title={title || reportId}
              description={description}
              period={period}
              columns={columns}
              rows={rows}
            />,
            title || reportId,
          );
          return;
        }
        await exportRows({
          filename: title || reportId,
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
