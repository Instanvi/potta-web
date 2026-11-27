'use client';

import { useState, type ReactElement } from 'react';
import { ChevronDown } from 'lucide-react';
import type { DocumentProps } from '@react-pdf/renderer';
import { toast } from 'sonner';
import Button from '@potta/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import { useOrganizationProfile } from '@/hooks/use-organization-profile';
import { saveBlob } from '@/lib/export-file';
import { orgToSeller, type PdfSeller } from '@/lib/org-to-seller';
import {
  buildReportDownload,
  REPORT_DOWNLOAD_FORMATS,
  type ReportDownloadFormat,
} from '@/lib/report-download';
import type { ReportColumn } from '@/app/(routes)/reports/utils/api';

type Props = {
  reportId: string;
  title: string;
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  totals?: Record<string, number>;
  disabled?: boolean;
  /** Period / as-of label printed under the title. */
  period?: string;
  description?: string;
  /** Statement PDFs (profit and loss, balance sheet) keep their section layout. */
  renderPdf?: (seller: PdfSeller) => ReactElement<DocumentProps>;
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
  renderPdf,
}: Props) {
  const [busy, setBusy] = useState(false);
  const { data: org } = useOrganizationProfile();

  const onExport = async (format: ReportDownloadFormat) => {
    if (busy || disabled) return;
    setBusy(true);
    const filename = (title || reportId).trim() || 'report';
    try {
      const seller = orgToSeller(org);
      const built = await buildReportDownload({
        format,
        filename,
        title: filename,
        description,
        period,
        columns,
        rows,
        totals,
        seller,
        pdfDocument: renderPdf?.(seller),
      });
      saveBlob(built.blob, built.filename);
      toast.success(`Downloaded ${built.filename}`);
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
          text={
            <span className="inline-flex items-center gap-1">
              {busy ? 'Downloading…' : 'Download'}
              <ChevronDown className="size-4" />
            </span>
          }
          theme="lightBlue"
          color
          disabled={disabled || busy || rows.length === 0}
          icon={<i className="ri-download-2-line" />}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[200] w-48 bg-white">
        {REPORT_DOWNLOAD_FORMATS.map(({ format, label }) => (
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

export type { ReportDownloadFormat };
