'use client';

import React, { useState } from 'react';
import Button from '@potta/components/button';
import RecordHistory from '@potta/components/shared/RecordHistory';
import { Can } from '@/components/auth/can';
import { DocumentDetailChrome } from '@potta/components/document-master-detail';
import ConfirmModal from '../../../_shared/ConfirmModal';
import { formatDate, formatDateTime } from '../../../_shared/format';
import { ErrorState, LoadingState } from '../../../_shared/states';
import { DocumentSellerHeader } from '@/components/documents/document-seller-header';
import { Skeleton } from '@/components/ui/loaders';
import { formatMoney } from '../../utils/format';
import { useApproveBill, useBill, useSendBill } from '../hooks';
import { Bill, billExpenseAccount, paymentMethodLabel } from '../utils/types';
import BillStatusBadge from './BillStatusBadge';
import PayBillModal from './PayBillModal';
import RejectBillModal from './RejectBillModal';
import { downloadPreviewAsPdf } from '@/lib/print-preview';
import { toast } from 'sonner';

type TimelineStep = {
  label: string;
  detail?: React.ReactNode;
  date?: string | null;
  tone: 'done' | 'danger' | 'pending';
};

const buildTimeline = (bill: Bill): TimelineStep[] => {
  const steps: TimelineStep[] = [
    {
      label: 'Bill recorded',
      detail: bill.vendorInvoiceNumber
        ? `Vendor invoice ${bill.vendorInvoiceNumber}`
        : undefined,
      date: bill.createdAt ?? bill.issuedDate,
      tone: 'done',
    },
  ];
  if (bill.status === 'REJECTED') {
    steps.push({
      label: 'Rejected',
      detail: bill.rejectionReason || 'No reason given',
      date: bill.rejectedAt,
      tone: 'danger',
    });
    return steps;
  }
  steps.push(
    bill.approvedAt
      ? {
          label: 'Approved and posted',
          detail: `Dr ${billExpenseAccount(bill)} expense / Cr vendor payable`,
          date: bill.approvedAt,
          tone: 'done',
        }
      : { label: 'Awaiting approval', tone: 'pending' }
  );
  if (bill.status === 'PAID') {
    steps.push({
      label: 'Paid',
      detail: [paymentMethodLabel(bill.paymentMethod), bill.paymentReference]
        .filter(Boolean)
        .join(' · '),
      tone: 'done',
    });
  } else if (bill.approvedAt) {
    steps.push({
      label: bill.status === 'OVERDUE' ? 'Payment overdue' : 'Awaiting payment',
      detail: `Due ${formatDate(bill.dueDate)}`,
      tone: bill.status === 'OVERDUE' ? 'danger' : 'pending',
    });
  }
  return steps;
};

const TONE_DOT: Record<TimelineStep['tone'], string> = {
  done: 'bg-green-600',
  danger: 'bg-red-500',
  pending: 'bg-gray-300',
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-0.5 break-all text-sm text-foreground">{children ?? '—'}</p>
  </div>
);

export function BillDetailPanel({ billId }: { billId: string }) {
  const { data: bill, isLoading, error, refetch } = useBill(billId);
  const approve = useApproveBill();
  const sendBill = useSendBill();
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);
  const [toReject, setToReject] = useState<Bill | null>(null);
  const [toPay, setToPay] = useState<Bill | null>(null);

  if (isLoading) return <LoadingState label="Loading bill…" />;
  if (error || !bill) {
    return (
      <div className="p-4">
        <ErrorState error={error || new Error('Bill not found')} onRetry={() => refetch()} />
      </div>
    );
  }

  const lines = bill.lineItems ?? [];
  const totals = lines.reduce(
    (acc, l) => {
      const gross = Number(l.quantity ?? 0) * Number(l.unitPrice ?? 0);
      acc.subtotal += gross;
      acc.discount += Number(l.discountAmount ?? 0);
      return acc;
    },
    { subtotal: 0, discount: 0 }
  );
  const tax = Number(bill.taxAmount ?? 0);
  const total = Number(bill.invoiceTotal ?? 0);
  const canApproveOrReject = bill.status === 'DRAFT' || bill.status === 'ISSUED';
  const canPay = bill.status === 'APPROVED' || bill.status === 'OVERDUE';
  const vendorEmail = (bill.vendor?.email || '').trim();

  const handleSendClick = () => {
    if (!vendorEmail) {
      toast.error('Add a vendor email before sending');
      return;
    }
    setConfirmSend(true);
  };

  const toolbar = (
    <>
      {canApproveOrReject && (
        <>
          <Can resource="Bill" action="reject">
            <Button
              text="Reject"
              type="button"
              theme="danger"
              onClick={() => setToReject(bill)}
            />
          </Can>
          <Can resource="Bill" action="approve">
            <Button
              text="Approve"
              type="button"
              icon={<i className="ri-check-line" />}
              onClick={() => setConfirmApprove(true)}
            />
          </Can>
        </>
      )}
      <Button
        text={vendorEmail ? 'Send' : 'Add vendor email'}
        type="button"
        theme="lightBlue"
        icon={<i className="ri-mail-send-line" />}
        disabled={sendBill.isPending}
        onClick={handleSendClick}
      />
      {canPay && (
        <Can resource="Bill" action="pay">
          <Button
            text="Record payment"
            type="button"
            icon={<i className="ri-bank-card-line" />}
            onClick={() => setToPay(bill)}
          />
        </Can>
      )}
      <Button
        text="Download PDF"
        type="button"
        theme="lightBlue"
        icon={<i className="ri-download-2-line" />}
        onClick={() => {
          const el = document.querySelector(
            '[data-document-preview]'
          ) as HTMLElement | null;
          if (!el) {
            toast.message('Open Preview first, then download the PDF.');
            return;
          }
          downloadPreviewAsPdf(el, bill.code || 'Bill');
        }}
      />
    </>
  );

  return (
    <>
      <DocumentDetailChrome
        title={bill.code}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <BillStatusBadge status={bill.status} />
            <span>{bill.vendor?.name || '—'}</span>
            <span>· {formatMoney(total, bill.currency)}</span>
          </span>
        }
        toolbar={toolbar}
      >
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2">
            <Field label="Vendor invoice no.">{bill.vendorInvoiceNumber || '—'}</Field>
            <Field label="Expense account">{billExpenseAccount(bill)}</Field>
            <Field label="Issued">{formatDate(bill.issuedDate)}</Field>
            <Field label="Due">{formatDate(bill.dueDate)}</Field>
            <Field label="Payment method">{paymentMethodLabel(bill.paymentMethod)}</Field>
            <Field label="Payment reference">{bill.paymentReference || '—'}</Field>
            {bill.notes ? (
              <div className="sm:col-span-2">
                <Field label="Notes">{bill.notes}</Field>
              </div>
            ) : null}
          </section>

          <section>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Vendor
            </h3>
            <div className="grid gap-3 sm:grid-cols-3 text-sm">
              <Field label="Name">{bill.vendor?.name || '—'}</Field>
              <Field label="Email">{bill.vendor?.email || '—'}</Field>
              <Field label="Phone">{bill.vendor?.phone || '—'}</Field>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status timeline
            </h3>
            <ol className="relative ml-1 border-l border-black/[0.08]">
              {buildTimeline(bill).map((step, i) => (
                <li key={i} className="mb-4 ml-4 last:mb-0">
                  <span
                    className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ${TONE_DOT[step.tone]}`}
                  />
                  <p
                    className={`text-sm font-medium ${
                      step.tone === 'danger'
                        ? 'text-red-700'
                        : step.tone === 'pending'
                          ? 'text-muted-foreground'
                          : 'text-foreground'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.detail ? (
                    <p className="text-xs text-muted-foreground">{step.detail}</p>
                  ) : null}
                  {step.date ? (
                    <p className="text-xs text-muted-foreground">{formatDateTime(step.date)}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Line items
            </h3>
            {lines.length === 0 ? (
              <p className="text-sm text-muted-foreground">This bill has no line items.</p>
            ) : (
              <div className="overflow-x-auto border border-black/[0.08]">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">Description</th>
                      <th className="px-3 py-2 text-right font-medium">Qty</th>
                      <th className="px-3 py-2 text-right font-medium">Unit price</th>
                      <th className="px-3 py-2 text-right font-medium">Discount</th>
                      <th className="px-3 py-2 text-right font-medium">Tax</th>
                      <th className="px-3 py-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line) => (
                      <tr key={line.uuid} className="border-t border-black/[0.05]">
                        <td className="px-3 py-2">
                          {line.description}
                          {line.product?.name ? (
                            <span className="block text-xs text-muted-foreground">
                              {line.product.name}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-3 py-2 text-right">{Number(line.quantity)}</td>
                        <td className="px-3 py-2 text-right">
                          {formatMoney(line.unitPrice, bill.currency)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {Number(line.discountAmount ?? 0) > 0
                            ? formatMoney(line.discountAmount, bill.currency)
                            : '—'}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {Number(line.taxRate ?? 0) > 0
                            ? `${Number(line.taxRate)}% · ${formatMoney(line.taxAmount, bill.currency)}`
                            : '—'}
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          {formatMoney(line.totalAmount, bill.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="ml-auto mt-3 w-full max-w-xs space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatMoney(totals.subtotal, bill.currency)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span>−{formatMoney(totals.discount, bill.currency)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT (445)</span>
                <span>{formatMoney(tax, bill.currency)}</span>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-2 text-base font-medium">
                <span>Total</span>
                <span className="text-green-700">{formatMoney(total, bill.currency)}</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              History
            </h3>
            <RecordHistory entityType="bill" entityId={bill.uuid} />
          </section>
        </div>
      </DocumentDetailChrome>

      <ConfirmModal
        open={confirmApprove}
        title={`Approve bill ${bill.code}`}
        message={`Approving posts ${formatMoney(total, bill.currency)} to the books (Dr expense ${billExpenseAccount(
          bill
        )} + VAT 445 / Cr vendor payable). Continue?`}
        confirmText="Approve"
        isLoading={approve.isPending}
        onClose={() => setConfirmApprove(false)}
        onConfirm={() =>
          approve.mutate({ id: bill.uuid }, { onSuccess: () => setConfirmApprove(false) })
        }
      />
      <ConfirmModal
        open={confirmSend}
        title={`Send bill ${bill.code}`}
        message={
          vendorEmail
            ? `Email this bill to ${vendorEmail}? Credits come from the branch notification wallet.`
            : 'Add a vendor email before sending.'
        }
        confirmText="Send"
        isLoading={sendBill.isPending}
        onClose={() => setConfirmSend(false)}
        onConfirm={() =>
          sendBill.mutate(bill.uuid, { onSuccess: () => setConfirmSend(false) })
        }
      />
      <RejectBillModal bill={toReject} onClose={() => setToReject(null)} />
      <PayBillModal bill={toPay} onClose={() => setToPay(null)} />
    </>
  );
}

/** Compact document-style preview for the right column. */
export function BillPreviewPanel({ billId }: { billId: string }) {
  const { data: bill, isLoading } = useBill(billId);

  if (isLoading || !bill) {
    return (
      <div className="space-y-3 p-6" aria-busy="true">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const lines = bill.lineItems ?? [];
  const total = Number(bill.invoiceTotal ?? 0);

  return (
    <div className="h-full overflow-y-auto bg-main-bg p-4 md:p-6">
      <div data-document-preview className="mx-auto w-full max-w-md space-y-6 bg-white p-6 shadow-sm">
        <div className="border-b border-black/[0.08] pb-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bill</p>
          <p className="mt-1 text-xl font-medium text-foreground">{bill.code}</p>
          <div className="mt-2">
            <BillStatusBadge status={bill.status} />
          </div>
        </div>
        <DocumentSellerHeader />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Vendor</span>
            <span className="text-right font-medium">{bill.vendor?.name || '—'}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Issued</span>
            <span>{formatDate(bill.issuedDate)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Due</span>
            <span>{formatDate(bill.dueDate)}</span>
          </div>
        </div>
        <div className="border-t border-black/[0.08] pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Lines
          </p>
          {lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">No line items</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {lines.slice(0, 8).map((line) => (
                <li key={line.uuid} className="flex justify-between gap-3">
                  <span className="truncate text-muted-foreground">{line.description}</span>
                  <span className="shrink-0 tabular-nums">
                    {formatMoney(line.totalAmount, bill.currency)}
                  </span>
                </li>
              ))}
              {lines.length > 8 ? (
                <li className="text-xs text-muted-foreground">+{lines.length - 8} more</li>
              ) : null}
            </ul>
          )}
        </div>
        <div className="flex justify-between border-t border-black/[0.08] pt-4 text-base font-medium">
          <span>Total</span>
          <span className="text-green-700">{formatMoney(total, bill.currency)}</span>
        </div>
      </div>
    </div>
  );
}

export default BillDetailPanel;
