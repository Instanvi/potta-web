'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import moment from 'moment';
import { toast } from 'sonner';
import { CheckCircle, XCircle } from 'lucide-react';
import Button from '@potta/components/button';
import RecordHistory from '@potta/components/shared/RecordHistory';
import { DocumentDetailChrome } from '@potta/components/document-master-detail';
import { InvoicePdfDocument } from '@/components/documents/invoice-pdf-document';
import { ErrorState } from '../../../_shared/states';
import { Skeleton } from '@potta/components/ui/loaders';
import ConfirmModal from '../../../_shared/ConfirmModal';
import useApproveInvoice from '../_hooks/useApproveInvoice';
import useGetOneInvoice from '../_hooks/useGetOneInvoice';
import useSendInvoice from '../_hooks/useSendInvoice';
import InvoicePdfPreview, { InvoicePreviewModel } from './InvoicePdfPreview';
import EditInvoiceModal from './EditInvoiceModal';
import {
  formatOrgAddress,
  orgDisplayName,
  useOrganizationProfile,
} from '@/hooks/use-organization-profile';
import { downloadReactPdf } from '@/lib/download-react-pdf';

/** Statuses that are considered posted / non-editable — use a credit note instead. */
export const POSTED_INVOICE_STATUSES = [
  'APPROVED',
  'SENT',
  'PAID',
  'OVERDUE',
  'ARCHIVED',
];

const PAYABLE_STATUSES = ['APPROVED', 'OVERDUE'];

const statusTone = (status: string) => {
  const s = status.toUpperCase();
  if (s === 'PAID' || s === 'APPROVED') return 'text-green-700';
  if (s === 'OVERDUE' || s === 'REJECTED') return 'text-red-600';
  if (s === 'ISSUED') return 'text-yellow-700';
  if (s === 'DRAFT') return 'text-gray-600';
  return 'text-foreground';
};

type InvoiceDetailPanelProps = {
  invoiceId: string;
  /** List-row fallback while detail loads. */
  fallback?: InvoicePreviewModel | null;
};

export function InvoiceDetailPanel({ invoiceId, fallback }: InvoiceDetailPanelProps) {
  const { data, isLoading, error, refetch } = useGetOneInvoice(invoiceId);
  const invoice = (data as InvoicePreviewModel & { uuid?: string; status?: string }) || fallback;
  const approveMutation = useApproveInvoice();
  const sendMutation = useSendInvoice();
  const { data: org } = useOrganizationProfile();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);

  if (isLoading && !fallback) {
    return (
      <div className="space-y-4 p-4" aria-busy="true">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if ((error && !fallback) || !invoice) {
    return (
      <div className="p-4">
        <ErrorState error={error || new Error('Invoice not found')} onRetry={() => refetch()} />
      </div>
    );
  }

  const status = (invoice as { status?: string }).status || '';
  const statusUpper = status.toUpperCase();
  const isPosted = POSTED_INVOICE_STATUSES.includes(statusUpper);
  const canEdit = !isPosted && Boolean(status);
  const canApprove = statusUpper === 'ISSUED';
  const canPay = PAYABLE_STATUSES.includes(statusUpper);
  const uuid = (invoice as { uuid?: string }).uuid || invoiceId;
  const customerEmail = (invoice.customer?.email || '').trim();
  const customerName = invoice.customer
    ? `${invoice.customer.firstName ?? ''} ${invoice.customer.lastName ?? ''}`.trim()
    : '';

  const handleApprove = async () => {
    const loadingToast = toast.loading('Approving invoice...');
    try {
      await approveMutation.mutateAsync(uuid);
      toast.success('Invoice approved successfully!', { id: loadingToast });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to approve invoice', {
        id: loadingToast,
      });
    }
  };

  const handleSendClick = () => {
    if (!customerEmail) {
      toast.error('Add a customer email before sending');
      return;
    }
    setConfirmSend(true);
  };

  const handleSendConfirm = async () => {
    const loadingToast = toast.loading('Sending invoice…');
    try {
      const res = await sendMutation.mutateAsync(uuid);
      toast.success(`Invoice sent to ${res.to}`, { id: loadingToast });
      setConfirmSend(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send invoice', {
        id: loadingToast,
      });
    }
  };

  const toolbar = (
    <>
      {canEdit ? (
        <Button
          text="Edit"
          type="button"
          theme="lightBlue"
          icon={<i className="ri-pencil-line" />}
          onClick={() => setEditOpen(true)}
        />
      ) : (
        <Button
          text="Edit"
          type="button"
          theme="lightBlue"
          icon={<i className="ri-pencil-line" />}
          disabled
          onClick={() => undefined}
        />
      )}
      <Button
        text={customerEmail ? 'Send' : 'Add customer email'}
        type="button"
        theme="lightBlue"
        icon={<i className="ri-mail-send-line" />}
        disabled={sendMutation.isPending}
        onClick={handleSendClick}
      />
      {canPay ? (
        <Link href={`/account_receivables/paynow/${uuid}`}>
          <Button
            text="Record Payment"
            type="button"
            theme="default"
            icon={<i className="ri-bank-card-line" />}
          />
        </Link>
      ) : null}
      {canApprove ? (
        <Button
          text={approveMutation.isPending ? 'Approving…' : 'Approve'}
          type="button"
          theme="default"
          icon={<i className="ri-check-line" />}
          disabled={approveMutation.isPending}
          onClick={() => void handleApprove()}
        />
      ) : null}
      <Button
        text="Download PDF"
        type="button"
        theme="lightBlue"
        icon={<i className="ri-download-2-line" />}
        onClick={() => {
          void (async () => {
            const lines = invoice.lineItems ?? [];
            const subtotal = lines.reduce(
              (sum, line) => sum + Number(line.unitPrice || 0) * Number(line.quantity || 0),
              0,
            );
            const tax = Number(invoice.taxAmount ?? 0);
            const customerName = invoice.customer
              ? `${invoice.customer.firstName ?? ''} ${invoice.customer.lastName ?? ''}`.trim()
              : '';
            const filename =
              invoice.invoiceNumber || invoice.invoiceId || 'invoice';
            try {
              await downloadReactPdf(
                <InvoicePdfDocument
                  title={invoice.invoiceType || 'Invoice'}
                  invoiceNumber={invoice.invoiceNumber || invoice.invoiceId}
                  issueDate={moment(invoice.issuedDate).format('MMM DD, YYYY')}
                  dueDate={moment(invoice.dueDate).format('MMM DD, YYYY')}
                  currency={invoice.currency || 'USD'}
                  paymentMethod={invoice.paymentMethod || undefined}
                  paymentReference={invoice.paymentReference || undefined}
                  paymentTerms={invoice.paymentTerms || undefined}
                  notes={invoice.notes || undefined}
                  seller={{
                    name: orgDisplayName(org) || 'Your organization',
                    email: org?.businessEmail,
                    phone: org?.businessPhone,
                    addressLines: formatOrgAddress(org),
                    logoUrl: org?.logo,
                    registrationNumber: org?.registrationNumber,
                    taxId: org?.taxIdentificationNumber,
                  }}
                  customer={
                    invoice.customer
                      ? {
                          name: customerName || 'Customer',
                          email: invoice.customer.email,
                          phone: invoice.customer.phone,
                          address: invoice.billingAddress || undefined,
                        }
                      : null
                  }
                  lines={lines.map((line) => ({
                    description: line.description || 'Item',
                    quantity: Number(line.quantity || 0),
                    unitPrice: Number(line.unitPrice || 0),
                    taxRate: Number(line.taxRate || 0),
                    lineTotal: Number(line.totalAmount || 0),
                  }))}
                  subtotal={subtotal}
                  tax={tax}
                  total={Number(invoice.invoiceTotal || subtotal + tax)}
                  draft={statusUpper === 'DRAFT'}
                />,
                `invoice-${filename}`,
              );
            } catch {
              toast.error('Could not generate PDF');
            }
          })();
        }}
      />
    </>
  );

  return (
    <>
      <DocumentDetailChrome
        title={invoice.invoiceNumber || invoice.invoiceId}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={statusTone(status)}>{status || '—'}</span>
            {customerName ? <span>· {customerName}</span> : null}
            <span>
              · {invoice.currency} {Number(invoice.invoiceTotal).toLocaleString()}
            </span>
          </span>
        }
        toolbar={toolbar}
      >
        {isPosted ? (
          <div className="mb-4 rounded-[2px] border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            This invoice is posted and can no longer be edited. Issue a{' '}
            <Link
              href="/account_receivables/credit"
              className="font-medium underline underline-offset-2"
            >
              credit note
            </Link>{' '}
            to adjust amounts.
          </div>
        ) : null}

        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2">
            <Field label="Issue date">{moment(invoice.issuedDate).format('MMM DD, YYYY')}</Field>
            <Field label="Due date">{moment(invoice.dueDate).format('MMM DD, YYYY')}</Field>
            <Field label="Type">{invoice.invoiceType}</Field>
            <Field label="Payment method">
              {invoice.paymentMethod === 'BANK_TRANSFER'
                ? 'Bank Transfer'
                : invoice.paymentMethod === 'CASH'
                  ? 'Cash'
                  : invoice.paymentMethod === 'MOBILE_MONEY'
                    ? 'Mobile Money'
                    : invoice.paymentMethod || '—'}
            </Field>
            <Field label="Payment terms">{invoice.paymentTerms || '—'}</Field>
            <Field label="Billing address">{invoice.billingAddress || '—'}</Field>
            {invoice.notes ? (
              <div className="sm:col-span-2">
                <Field label="Notes">{invoice.notes}</Field>
              </div>
            ) : null}
          </section>

          <section>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Line items
            </h3>
            <div className="overflow-x-auto border border-black/[0.08]">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Description</th>
                    <th className="px-3 py-2 text-right font-medium">Qty</th>
                    <th className="px-3 py-2 text-right font-medium">Unit price</th>
                    <th className="px-3 py-2 text-right font-medium">Tax</th>
                    <th className="px-3 py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.lineItems ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                        No line items
                      </td>
                    </tr>
                  ) : (
                    (invoice.lineItems ?? []).map((line) => (
                      <tr key={line.uuid} className="border-t border-black/[0.05]">
                        <td className="px-3 py-2">{line.description}</td>
                        <td className="px-3 py-2 text-right">{line.quantity}</td>
                        <td className="px-3 py-2 text-right">
                          {invoice.currency} {Number(line.unitPrice).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {invoice.currency} {Number(line.taxAmount || 0).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          {invoice.currency}{' '}
                          {(
                            Number(line.totalAmount) + Number(line.taxAmount || 0)
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="ml-auto mt-3 w-full max-w-xs space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>
                  {invoice.currency} {Number(invoice.taxAmount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-2 text-base font-medium">
                <span>Total</span>
                <span>
                  {invoice.currency} {Number(invoice.invoiceTotal).toLocaleString()}
                </span>
              </div>
            </div>
          </section>

          {(invoice as any).approvedBy || (invoice as any).rejectedBy ? (
            <section className="space-y-2 text-sm">
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Approval
              </h3>
              {(invoice as any).approvedBy ? (
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    Approved
                    {(invoice as any).approvedAt
                      ? ` · ${moment((invoice as any).approvedAt).format('MMM DD, YYYY')}`
                      : ''}
                  </span>
                </div>
              ) : null}
              {(invoice as any).rejectedBy ? (
                <div className="flex items-center gap-2 text-red-800">
                  <XCircle className="h-4 w-4" />
                  <span>
                    Rejected
                    {(invoice as any).rejectionReason
                      ? ` · ${(invoice as any).rejectionReason}`
                      : ''}
                  </span>
                </div>
              ) : null}
            </section>
          ) : null}

          <section>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              History
            </h3>
            <RecordHistory entityType="invoice" entityId={uuid} />
          </section>
        </div>
      </DocumentDetailChrome>

      <EditInvoiceModal
        open={editOpen}
        setOpen={setEditOpen}
        invoice={invoice as any}
      />
      <ConfirmModal
        open={confirmSend}
        title={`Send invoice ${invoice.invoiceNumber || invoice.invoiceId}`}
        message={
          customerEmail
            ? `Email this invoice to ${customerEmail}? Credits come from the branch notification wallet.`
            : 'Add a customer email before sending.'
        }
        confirmText="Send"
        isLoading={sendMutation.isPending}
        onClose={() => setConfirmSend(false)}
        onConfirm={() => void handleSendConfirm()}
      />
    </>
  );
}

export function InvoiceDetailPreview({
  invoiceId,
  fallback,
}: {
  invoiceId: string;
  fallback?: InvoicePreviewModel | null;
}) {
  const { data, isLoading } = useGetOneInvoice(invoiceId);
  const invoice = (data as InvoicePreviewModel) || fallback;
  if (!invoice) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
        {isLoading ? 'Loading preview…' : 'No preview'}
      </div>
    );
  }
  return <InvoicePdfPreview invoice={invoice} />;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm text-foreground">{children}</p>
    </div>
  );
}

export default InvoiceDetailPanel;
