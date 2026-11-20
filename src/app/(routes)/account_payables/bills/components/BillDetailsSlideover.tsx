'use client';
import React, { useState } from 'react';
import Slider from '@potta/components/slideover';
import Button from '@potta/components/button';
import RecordHistory from '@potta/components/shared/RecordHistory';
import { Can } from '@/components/auth/can';
import ConfirmModal from '../../../_shared/ConfirmModal';
import { formatDate, formatDateTime } from '../../../_shared/format';
import { ErrorState, LoadingState } from '../../../_shared/states';
import { formatMoney } from '../../utils/format';
import { useApproveBill, useBill } from '../hooks';
import { Bill, billExpenseAccount, paymentMethodLabel } from '../utils/types';
import BillStatusBadge from './BillStatusBadge';
import PayBillModal from './PayBillModal';
import RejectBillModal from './RejectBillModal';

interface BillDetailsSlideoverProps {
  billId: string | null;
  onClose: () => void;
}

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="whitespace-nowrap text-sm font-medium text-gray-500">{children}</span>
);

const Value: React.FC<{ children: React.ReactNode; highlight?: boolean }> = ({ children, highlight }) => (
  <span className={`break-all text-gray-900 ${highlight ? 'text-lg font-medium text-green-700' : ''}`}>
    {children ?? '—'}
  </span>
);

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-4 mt-2 text-xs font-medium uppercase tracking-wide text-gray-400">{children}</div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-2">
    <Label>{label}:</Label>
    <Value>{children}</Value>
  </div>
);

type TimelineStep = { label: string; detail?: React.ReactNode; date?: string | null; tone: 'done' | 'danger' | 'pending' };

const buildTimeline = (bill: Bill): TimelineStep[] => {
  const steps: TimelineStep[] = [
    {
      label: 'Bill recorded',
      detail: bill.vendorInvoiceNumber ? `Vendor invoice ${bill.vendorInvoiceNumber}` : undefined,
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
      detail: [paymentMethodLabel(bill.paymentMethod), bill.paymentReference].filter(Boolean).join(' · '),
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

const BillDetailsSlideover: React.FC<BillDetailsSlideoverProps> = ({ billId, onClose }) => {
  const { data: bill, isLoading, error, refetch } = useBill(billId);
  const approve = useApproveBill();
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [toReject, setToReject] = useState<Bill | null>(null);
  const [toPay, setToPay] = useState<Bill | null>(null);

  const lines = bill?.lineItems ?? [];
  const totals = lines.reduce(
    (acc, l) => {
      const gross = Number(l.quantity ?? 0) * Number(l.unitPrice ?? 0);
      acc.subtotal += gross;
      acc.discount += Number(l.discountAmount ?? 0);
      return acc;
    },
    { subtotal: 0, discount: 0 }
  );
  const tax = Number(bill?.taxAmount ?? 0);
  const total = Number(bill?.invoiceTotal ?? 0);
  const canApproveOrReject = bill?.status === 'DRAFT' || bill?.status === 'ISSUED';
  const canPay = bill?.status === 'APPROVED' || bill?.status === 'OVERDUE';

  return (
    <Slider
      edit={false}
      title="Bill Details"
      open={!!billId}
      setOpen={(value) => !value && onClose()}
    >
      {isLoading ? (
        <LoadingState label="Loading bill..." />
      ) : error ? (
        <div className="w-full max-w-6xl py-4">
          <ErrorState error={error} onRetry={() => refetch()} />
        </div>
      ) : bill ? (
        <div className="w-full max-w-6xl px-2 py-4">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2 text-2xl font-semibold text-gray-800">
                Bill <span className="text-gray-400">#</span>
                {bill.code}
              </div>
              <BillStatusBadge status={bill.status} />
            </div>
            <div className="flex flex-wrap gap-2">
              {canApproveOrReject && (
                <>
                  <Can resource="Bill" action="reject">
                    <Button text="Reject" type="button" theme="danger" onClick={() => setToReject(bill)} />
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
            </div>
          </div>

          <div className="flex flex-col gap-0 md:flex-row">
            <div className="min-w-[260px] flex-1 border-gray-100 pr-8 md:border-r">
              <SectionHeader>Bill Summary</SectionHeader>
              <div className="space-y-4">
                <Field label="Vendor invoice no.">{bill.vendorInvoiceNumber || '—'}</Field>
                <div className="flex items-center gap-2">
                  <Label>Amount:</Label>
                  <Value highlight>{formatMoney(total, bill.currency)}</Value>
                </div>
                <Field label="Issued date">{formatDate(bill.issuedDate)}</Field>
                <Field label="Due date">{formatDate(bill.dueDate)}</Field>
                <Field label="Payment method">{paymentMethodLabel(bill.paymentMethod)}</Field>
                <Field label="Payment reference">{bill.paymentReference || '—'}</Field>
                <Field label="Expense account">{billExpenseAccount(bill)}</Field>
                <Field label="Notes">{bill.notes || '—'}</Field>
              </div>
            </div>

            <div className="min-w-[300px] flex-1 bg-gray-50 p-6 md:ml-8">
              <SectionHeader>Vendor Information</SectionHeader>
              <div className="space-y-4">
                <Field label="Name">{bill.vendor?.name || '—'}</Field>
                <Field label="Email">{bill.vendor?.email || '—'}</Field>
                <Field label="Phone">{bill.vendor?.phone || '—'}</Field>
              </div>

              <div className="mt-8">
                <SectionHeader>Status timeline</SectionHeader>
              </div>
              <ol className="relative ml-1 border-l border-gray-200">
                {buildTimeline(bill).map((step, i) => (
                  <li key={i} className="mb-5 ml-4 last:mb-0">
                    <span className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ${TONE_DOT[step.tone]}`} />
                    <p
                      className={`text-sm font-medium ${
                        step.tone === 'danger' ? 'text-red-700' : step.tone === 'pending' ? 'text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.detail && <p className="text-xs text-gray-500">{step.detail}</p>}
                    {step.date && <p className="text-xs text-gray-400">{formatDateTime(step.date)}</p>}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mt-8">
            <SectionHeader>Line items</SectionHeader>
            {lines.length === 0 ? (
              <p className="text-sm text-gray-500">This bill has no line items.</p>
            ) : (
              <div className="overflow-x-auto border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500">
                    <tr>
                      <th className="px-4 py-2 font-medium">Description</th>
                      <th className="px-4 py-2 text-right font-medium">Qty</th>
                      <th className="px-4 py-2 text-right font-medium">Unit price</th>
                      <th className="px-4 py-2 text-right font-medium">Discount</th>
                      <th className="px-4 py-2 text-right font-medium">Tax</th>
                      <th className="px-4 py-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line) => (
                      <tr key={line.uuid} className="border-t border-gray-100">
                        <td className="px-4 py-2">
                          {line.description}
                          {line.product?.name && (
                            <span className="block text-xs text-gray-400">{line.product.name}</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right">{Number(line.quantity)}</td>
                        <td className="px-4 py-2 text-right">{formatMoney(line.unitPrice, bill.currency)}</td>
                        <td className="px-4 py-2 text-right">
                          {Number(line.discountAmount ?? 0) > 0 ? formatMoney(line.discountAmount, bill.currency) : '—'}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {Number(line.taxRate ?? 0) > 0
                            ? `${Number(line.taxRate)}% · ${formatMoney(line.taxAmount, bill.currency)}`
                            : '—'}
                        </td>
                        <td className="px-4 py-2 text-right font-medium">
                          {formatMoney(line.totalAmount, bill.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="ml-auto mt-4 w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatMoney(totals.subtotal, bill.currency)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span>−{formatMoney(totals.discount, bill.currency)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">VAT (445)</span>
                <span>{formatMoney(tax, bill.currency)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-medium">
                <span>Total</span>
                <span className="text-green-700">{formatMoney(total, bill.currency)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pb-8">
            <SectionHeader>History</SectionHeader>
            <RecordHistory entityType="bill" entityId={bill.uuid} />
          </div>

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
          <RejectBillModal bill={toReject} onClose={() => setToReject(null)} />
          <PayBillModal bill={toPay} onClose={() => setToPay(null)} />
        </div>
      ) : null}
    </Slider>
  );
};

export default BillDetailsSlideover;
