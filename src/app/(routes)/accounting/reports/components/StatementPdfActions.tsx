'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  StatementPdfDocument,
  type StatementPdfProps,
} from '@/components/documents/report-pdf-document';
import { useOrganizationProfile } from '@/hooks/use-organization-profile';
import { downloadReactPdf } from '@/lib/download-react-pdf';
import { orgToSeller } from '@/lib/org-to-seller';
import { printReactPdf } from '@/lib/print-react-pdf';

const btn =
  'inline-flex items-center gap-1.5 border border-black/10 bg-white px-3 py-2 text-sm font-medium text-foreground hover:bg-gray-50 disabled:opacity-50';

/** Download / Print buttons that render a letterhead statement PDF. */
export function StatementPdfActions({
  statement,
  filename,
  disabled,
}: {
  statement: Omit<StatementPdfProps, 'seller'>;
  filename: string;
  disabled?: boolean;
}) {
  const { data: org } = useOrganizationProfile();
  const [busy, setBusy] = useState<'download' | 'print' | null>(null);

  const run = async (mode: 'download' | 'print') => {
    if (busy || disabled) return;
    setBusy(mode);
    try {
      const node = <StatementPdfDocument {...statement} seller={orgToSeller(org)} />;
      if (mode === 'download') await downloadReactPdf(node, filename);
      else await printReactPdf(node, filename);
    } catch (err) {
      console.error(err);
      toast.error('Could not generate PDF');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={btn}
        disabled={disabled || busy !== null}
        onClick={() => void run('download')}
      >
        <i className="ri-file-pdf-2-line" />
        {busy === 'download' ? 'Preparing…' : 'PDF'}
      </button>
      <button
        type="button"
        className={btn}
        disabled={disabled || busy !== null}
        onClick={() => void run('print')}
      >
        <i className="ri-printer-line" />
        {busy === 'print' ? 'Preparing…' : 'Print'}
      </button>
    </div>
  );
}
