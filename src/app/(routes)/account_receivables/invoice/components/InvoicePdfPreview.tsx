'use client';

import moment from 'moment';

export type InvoicePreviewLine = {
  uuid: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  taxRate?: number | null;
  taxAmount?: number | null;
  discountRate?: number | null;
  discountAmount?: number | null;
};

export type InvoicePreviewModel = {
  invoiceId: string;
  invoiceNumber?: string | null;
  issuedDate: string;
  dueDate: string;
  invoiceType: string;
  invoiceTotal: number;
  currency: string;
  taxRate?: number | null;
  taxAmount?: number | null;
  paymentMethod?: string | null;
  paymentTerms?: string | null;
  paymentReference?: string | null;
  billingAddress?: string | null;
  notes?: string | null;
  voucherCode?: string;
  lineItems?: InvoicePreviewLine[];
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  } | null;
};

const paymentMethodLabel = (method?: string | null) => {
  if (!method) return 'Not specified';
  if (method === 'BANK_TRANSFER') return 'Bank Transfer';
  if (method === 'CASH') return 'Cash';
  if (method === 'MOBILE_MONEY') return 'Mobile Money';
  return method;
};

/** Document-style PDF preview for an invoice (right column). */
export function InvoicePdfPreview({ invoice }: { invoice: InvoicePreviewModel }) {
  const lines = invoice.lineItems ?? [];

  return (
    <div className="h-full overflow-y-auto bg-main-bg p-4 md:p-6">
      <div className="mx-auto min-h-full w-full max-w-xl space-y-6 bg-white shadow-sm">
        <div className="flex items-center justify-between bg-green-700 px-6 py-8 text-white">
          <div>
            <p className="text-2xl font-medium">{invoice.invoiceType}</p>
            <p className="mt-1 text-sm opacity-90">
              #{invoice.invoiceNumber || invoice.invoiceId}
            </p>
          </div>
          <div className="space-y-1 text-right text-xs">
            <p>
              <strong>Issue:</strong> {moment(invoice.issuedDate).format('MMM DD, YYYY')}
            </p>
            <p>
              <strong>Due:</strong> {moment(invoice.dueDate).format('MMM DD, YYYY')}
            </p>
            <p>
              <strong>Currency:</strong> {invoice.currency}
            </p>
          </div>
        </div>

        <div className="space-y-8 px-6 pb-8">
          <div className="flex flex-wrap gap-8 text-sm">
            <div className="min-w-[140px] flex-1">
              <p className="mb-1 font-medium text-foreground">From</p>
              <div className="space-y-0.5 text-muted-foreground">
                <p>Instanvi Sarl</p>
                <p>hello@instanvi.com</p>
                <p>Douala, Cameroon</p>
              </div>
            </div>
            <div className="min-w-[140px] flex-1">
              <p className="mb-1 font-medium text-foreground">To</p>
              <div className="space-y-0.5 text-muted-foreground">
                <p>
                  {invoice.customer
                    ? `${invoice.customer.firstName ?? ''} ${invoice.customer.lastName ?? ''}`.trim() ||
                      'Customer'
                    : '—'}
                </p>
                <p>{invoice.customer?.email || '—'}</p>
                <p>{invoice.billingAddress || '—'}</p>
                <p>{invoice.customer?.phone || '—'}</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden border border-black/[0.08]">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 font-medium">Qty</th>
                  <th className="px-3 py-2 font-medium">Price</th>
                  <th className="px-3 py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06]">
                {lines.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                      No line items
                    </td>
                  </tr>
                ) : (
                  lines.map((item, index) => {
                    const taxAmount = item.taxAmount || 0;
                    const total = item.totalAmount + taxAmount;
                    return (
                      <tr key={item.uuid}>
                        <td className="px-3 py-2">{index + 1}</td>
                        <td className="max-w-[10rem] truncate px-3 py-2" title={item.description}>
                          {item.description}
                        </td>
                        <td className="px-3 py-2">{item.quantity}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {invoice.currency} {item.unitPrice.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap font-medium">
                          {invoice.currency} {total.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <div className="min-w-[140px] flex-1 space-y-1 text-muted-foreground">
              <p>
                <strong className="text-foreground">Payment:</strong>{' '}
                {paymentMethodLabel(invoice.paymentMethod)}
              </p>
              {invoice.paymentTerms ? (
                <p>
                  <strong className="text-foreground">Terms:</strong> {invoice.paymentTerms}
                </p>
              ) : null}
              {invoice.notes ? <p className="pt-2">{invoice.notes}</p> : null}
            </div>
            <div className="ml-auto w-full max-w-[220px] space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>
                  {invoice.currency}{' '}
                  {(invoice.invoiceTotal - (invoice.taxAmount || 0)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax ({invoice.taxRate || 0}%)</span>
                <span>
                  {invoice.currency} {(invoice.taxAmount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-2 text-base font-medium">
                <span>Total</span>
                <span>
                  {invoice.currency} {invoice.invoiceTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoicePdfPreview;
