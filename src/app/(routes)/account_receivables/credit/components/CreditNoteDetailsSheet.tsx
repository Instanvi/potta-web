'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  CreditNotePdfDocument,
  type CreditNotePdfProps,
} from '@/components/documents/credit-note-pdf-document';
import { useOrganizationProfile } from '@/hooks/use-organization-profile';
import { downloadReactPdf } from '@/lib/download-react-pdf';
import { orgToSeller } from '@/lib/org-to-seller';
import { printReactPdf } from '@/lib/print-react-pdf';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@potta/components/ui/sheet';
import { formatAmount, formatDate } from '../../../_shared/format';
import { ErrorState, LoadingState } from '../../../_shared/states';
import { useCreditNote } from '../_hooks';
import { partyName } from '../_utils/types';
import CreditNoteStatusBadge from './CreditNoteStatusBadge';

interface Props {
  creditNoteId: string | null;
  onClose: () => void;
}

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between gap-4 border-b border-gray-100 py-2.5 text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="text-right font-medium text-gray-900">{value}</span>
  </div>
);

const CreditNoteDetailsSheet = ({ creditNoteId, onClose }: Props) => {
  const { data, isLoading, error, refetch } = useCreditNote(creditNoteId ?? '');
  const { data: org } = useOrganizationProfile();
  const [pdfBusy, setPdfBusy] = useState<'download' | 'print' | null>(null);
  const currency = data?.currency || data?.invoice?.currency || undefined;
  const lineItems = Array.isArray(data?.lineItems) ? data.lineItems : [];

  const buildPdf = () => {
    if (!data) return null;
    const customer = data.customer ?? data.salePerson;
    const pdfProps: CreditNotePdfProps = {
      title: `Credit note ${data.creditNoteId}`,
      reference: data.creditNoteId,
      issueDate: formatDate(data.issueDate),
      currency: currency || 'XAF',
      creditAmount: Number(data.creditAmount) || 0,
      reason: data.reason || undefined,
      referenceInvoice: data.invoice
        ? `Invoice #${data.invoice.invoiceNumber || data.invoice.invoiceId || data.invoice.code || ''}`
        : undefined,
      invoiceDate: data.invoice?.issuedDate ? formatDate(data.invoice.issuedDate) : undefined,
      notes: data.notes || undefined,
      seller: orgToSeller(org),
      customer: customer
        ? {
            name: partyName(customer),
            email: customer.email,
            phone: customer.phone,
          }
        : null,
      lineItems: lineItems.map((l) => ({
        description: l.description,
        quantity: Number(l.quantity) || 0,
        unitPrice: Number(l.unitPrice) || 0,
        taxRate: Number(l.taxRate) || 0,
        total: Number(l.total) || 0,
      })),
      status: data.status,
      draft: data.status === 'DRAFT',
    };
    return {
      node: <CreditNotePdfDocument {...pdfProps} />,
      filename: `credit-note-${data.creditNoteId}`,
    };
  };

  const runPdf = async (mode: 'download' | 'print') => {
    const built = buildPdf();
    if (!built || pdfBusy) return;
    setPdfBusy(mode);
    try {
      if (mode === 'download') await downloadReactPdf(built.node, built.filename);
      else await printReactPdf(built.node, built.filename);
    } catch (err) {
      console.error(err);
      toast.error(mode === 'download' ? 'Could not download PDF' : 'Could not print PDF');
    } finally {
      setPdfBusy(null);
    }
  };

  return (
    <Sheet open={!!creditNoteId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            Credit note {data?.creditNoteId ? `· ${data.creditNoteId}` : ''}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : data ? (
            <div>
              <div className="mb-3 flex justify-end gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                  disabled={pdfBusy !== null}
                  onClick={() => void runPdf('download')}
                >
                  <i className="ri-download-2-line" />
                  {pdfBusy === 'download' ? 'Preparing…' : 'Download PDF'}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                  disabled={pdfBusy !== null}
                  onClick={() => void runPdf('print')}
                >
                  <i className="ri-printer-line" />
                  {pdfBusy === 'print' ? 'Preparing…' : 'Print'}
                </button>
              </div>
              <Row label="Status" value={<CreditNoteStatusBadge status={data.status} />} />
              <Row label="Issue date" value={formatDate(data.issueDate)} />
              <Row label="Customer" value={partyName(data.customer)} />
              <Row label="Currency" value={currency ?? '—'} />
              <Row label="Amount" value={formatAmount(data.creditAmount, currency)} />
              <Row label="Reason" value={data.reason} />
              <Row
                label="Invoice"
                value={
                  data.invoice
                    ? `${data.invoice.invoiceNumber || data.invoice.invoiceId || data.invoice.code} (${formatAmount(
                        data.invoice.invoiceTotal,
                        data.invoice.currency
                      )})`
                    : '—'
                }
              />
              {data.approvedAt && <Row label="Approved" value={formatDate(data.approvedAt)} />}
              {data.refundedAt && (
                <>
                  <Row label="Refunded" value={formatDate(data.refundedAt)} />
                  <Row label="Refund amount" value={formatAmount(data.refundAmount, currency)} />
                  <Row label="Refund method" value={data.refundMethod ?? '—'} />
                  {data.refundDescription && (
                    <Row label="Refund note" value={data.refundDescription} />
                  )}
                </>
              )}
              {lineItems.length > 0 && (
                <div className="mt-4">
                  <p className="mb-1 text-sm text-gray-500">Line items</p>
                  <div className="border border-gray-100">
                    {lineItems.map((line, index) => (
                      <div
                        key={`${line.productId ?? 'line'}-${index}`}
                        className="flex justify-between gap-4 border-b border-gray-100 px-3 py-2 text-sm last:border-b-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">
                            {line.description || '—'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {Number(line.quantity) || 0} ×{' '}
                            {formatAmount(line.unitPrice, currency)}
                            {Number(line.taxRate) ? ` · ${Number(line.taxRate)}% tax` : ''}
                          </p>
                        </div>
                        <span className="shrink-0 font-medium text-gray-900">
                          {formatAmount(line.total, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {data.notes && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm bg-gray-50 p-3">{data.notes}</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CreditNoteDetailsSheet;
