'use client';

import moment from 'moment';
import { useMemo } from 'react';
import { InvoicePdfDocument } from '@/components/documents/invoice-pdf-document';
import { PdfPreview } from '@/components/documents/pdf-preview';
import { useDocumentLetterhead } from '@/hooks/use-document-letterhead';
import {
  formatOrgAddress,
  orgDisplayName,
  useOrganizationProfile,
} from '@/hooks/use-organization-profile';

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
  if (!method) return undefined;
  if (method === 'BANK_TRANSFER') return 'Bank Transfer';
  if (method === 'CASH') return 'Cash';
  if (method === 'MOBILE_MONEY') return 'Mobile Money';
  return method;
};

/** Saved invoice preview uses the same react-pdf document as the editor. */
export function InvoicePdfPreview({ invoice }: { invoice: InvoicePreviewModel }) {
  const { data: org } = useOrganizationProfile();
  const { prefs } = useDocumentLetterhead();
  const lines = invoice.lineItems ?? [];
  const document = useMemo(() => {
    const subtotal = lines.reduce(
      (sum, line) => sum + Number(line.unitPrice || 0) * Number(line.quantity || 0),
      0,
    );
    const customerName = invoice.customer
      ? `${invoice.customer.firstName ?? ''} ${invoice.customer.lastName ?? ''}`.trim()
      : '';
    return (
      <InvoicePdfDocument
        title={invoice.invoiceType || 'Invoice'}
        invoiceNumber={invoice.invoiceNumber || invoice.invoiceId}
        issueDate={invoice.issuedDate ? moment(invoice.issuedDate).format('MMM DD, YYYY') : ''}
        dueDate={invoice.dueDate ? moment(invoice.dueDate).format('MMM DD, YYYY') : ''}
        currency={invoice.currency || 'XAF'}
        paymentMethod={paymentMethodLabel(invoice.paymentMethod)}
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
          customerName
            ? {
                name: customerName,
                email: invoice.customer?.email,
                phone: invoice.customer?.phone,
                address: invoice.billingAddress,
              }
            : null
        }
        lines={lines.map((line) => ({
          description: line.description || 'Item',
          quantity: Number(line.quantity) || 0,
          unitPrice: Number(line.unitPrice) || 0,
          taxRate: Number(line.taxRate) || 0,
          lineTotal: Number(line.totalAmount) || 0,
        }))}
        subtotal={subtotal}
        tax={Number(invoice.taxAmount) || 0}
        total={Number(invoice.invoiceTotal) || subtotal}
        accent={prefs.accent}
        template={prefs.template}
        draft={false}
      />
    );
  }, [invoice, lines, org, prefs.accent, prefs.template]);

  return <PdfPreview document={document} />;
}

export default InvoicePdfPreview;
