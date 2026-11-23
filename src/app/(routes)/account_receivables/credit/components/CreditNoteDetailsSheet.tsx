'use client';
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
  const currency = data?.invoice?.currency;

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
              <Row label="Status" value={<CreditNoteStatusBadge status={data.status} />} />
              <Row label="Issue date" value={formatDate(data.issueDate)} />
              <Row label="Customer" value={partyName(data.customer)} />
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
