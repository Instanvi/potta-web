'use client';

import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { DocumentSellerHeader } from '@/components/documents/document-seller-header';
import { formatDate } from '../../../../_shared/format';
import { formatMoney } from '../../../utils/format';
import { paymentMethodLabel } from '../../utils/types';
import { BillFormValues, lineTotals } from '../validations/billValidation';

type VendorLite = { uuid: string; name: string; email?: string | null; phone?: string | null };

/** Live bill document preview driven by the create form (FormProvider). */
export default function BillDraftPreview({ vendors = [] }: { vendors?: VendorLite[] }) {
  const { control } = useFormContext<BillFormValues>();

  const vendorId = useWatch({ control, name: 'vendorId' });
  const billNo = useWatch({ control, name: 'vendorInvoiceNumber' });
  const issueDate = useWatch({ control, name: 'issueDate' });
  const dueDate = useWatch({ control, name: 'dueDate' });
  const currency = useWatch({ control, name: 'currency' }) || 'XAF';
  const paymentMethod = useWatch({ control, name: 'paymentMethod' });
  const expenseAccountCode = useWatch({ control, name: 'expenseAccountCode' });
  const notes = useWatch({ control, name: 'notes' });
  const lines = useWatch({ control, name: 'lineItems' }) ?? [];

  const vendor = useMemo(
    () => vendors.find((v) => v.uuid === vendorId) ?? null,
    [vendors, vendorId],
  );

  const summary = useMemo(
    () =>
      lines.reduce(
        (acc, line) => {
          const t = lineTotals(line ?? {});
          acc.subtotal += t.gross;
          acc.discount += t.discount;
          acc.tax += t.tax;
          acc.total += t.total;
          return acc;
        },
        { subtotal: 0, discount: 0, tax: 0, total: 0 },
      ),
    [lines],
  );

  const title = billNo?.trim() || 'Draft bill';

  return (
    <div className="h-full overflow-y-auto bg-main-bg p-4 md:p-6">
      <div className="mx-auto w-full max-w-lg space-y-6 bg-white p-6 shadow-sm">
        <div className="border-b border-black/[0.08] pb-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bill</p>
          <p className="mt-1 text-xl font-medium text-foreground">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">Draft · not saved</p>
        </div>

        <DocumentSellerHeader />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Vendor</span>
            <span className="text-right font-medium">{vendor?.name || 'Select a vendor'}</span>
          </div>
          {vendor?.email ? (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Email</span>
              <span className="text-right">{vendor.email}</span>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Bill date</span>
            <span>{issueDate ? formatDate(issueDate) : '—'}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Due</span>
            <span>{dueDate ? formatDate(dueDate) : '—'}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Payment</span>
            <span>{paymentMethodLabel(paymentMethod)}</span>
          </div>
          {expenseAccountCode ? (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Expense acct</span>
              <span className="tabular-nums">{expenseAccountCode}</span>
            </div>
          ) : null}
        </div>

        <div className="border-t border-black/[0.08] pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Lines
          </p>
          {lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">No line items</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-normal">Description</th>
                  <th className="pb-2 text-right font-normal">Qty</th>
                  <th className="pb-2 text-right font-normal">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06]">
                {lines.map((line, i) => {
                  const t = lineTotals(line ?? {});
                  return (
                    <tr key={i}>
                      <td className="py-2 pr-2">
                        <span className="line-clamp-2">
                          {line?.description?.trim() || 'Item or service'}
                        </span>
                      </td>
                      <td className="py-2 text-right tabular-nums text-muted-foreground">
                        {Number(line?.quantity || 0)}
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {formatMoney(t.total, currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="space-y-1.5 border-t border-black/[0.08] pt-4 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatMoney(summary.subtotal, currency)}</span>
          </div>
          {summary.discount > 0 ? (
            <div className="flex justify-between text-muted-foreground">
              <span>Discounts</span>
              <span className="tabular-nums">−{formatMoney(summary.discount, currency)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-muted-foreground">
            <span>VAT</span>
            <span className="tabular-nums">{formatMoney(summary.tax, currency)}</span>
          </div>
          <div className="flex justify-between border-t border-black/[0.08] pt-3 text-base font-medium">
            <span>Total</span>
            <span className="tabular-nums text-green-700">
              {formatMoney(summary.total, currency)}
            </span>
          </div>
        </div>

        {notes?.trim() ? (
          <div className="border-t border-black/[0.08] pt-4 text-sm">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Message
            </p>
            <p className="whitespace-pre-wrap text-muted-foreground">{notes}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
