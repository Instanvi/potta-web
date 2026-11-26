'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { BillPdfDocument } from '@/components/documents/bill-pdf-document';
import { PdfPreview } from '@/components/documents/pdf-preview';
import { useDocumentLetterhead } from '@/hooks/use-document-letterhead';
import { orgDisplayName, useOrganizationProfile } from '@/hooks/use-organization-profile';
import { formatPartyAddress } from '@/lib/party-address';

interface VendorInvoicePdfViewProps {
  invoiceData: {
    vendorInvoiceNumber?: string;
    orderNumber?: string;
    invoiceDate: Date;
    dueDate: Date;
    currency: string;
    paymentMethod: string;
    paymentTerms: string;
    billingAddress: string;
    shippingAddress: string;
    notes: string;
    lineItems: Array<{
      description?: string;
      quantity?: number;
      unitPrice?: number;
      taxRate?: number;
      discountAmount?: number;
      total?: number;
    }>;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    vendor: {
      name?: string;
      email?: string;
      phone?: string;
      address?: {
        address?: string | null;
        city?: string | null;
        state?: string | null;
        country?: string | null;
        postalCode?: string | null;
      };
    };
  };
}

const formatPaymentMethod = (method: string) => {
  const known: Record<string, string> = {
    MOBILE_MONEY: 'Mobile Money',
    BANK_TRANSFER: 'Bank Transfer',
    CASH: 'Cash',
    CHECK: 'Check',
    CREDIT_CARD: 'Credit Card',
    ACH_TRANSFER: 'ACH Transfer',
  };
  return known[method.toUpperCase()] || method.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const VendorInvoicePdfView = ({ invoiceData }: VendorInvoicePdfViewProps) => {
  const { data: org } = useOrganizationProfile();
  const { prefs } = useDocumentLetterhead();
  const vendor = invoiceData.vendor;
  const document = useMemo(() => {
    const notes = [invoiceData.paymentTerms ? `Terms: ${invoiceData.paymentTerms}` : '', invoiceData.notes]
      .filter(Boolean)
      .join('\n');
    return (
      <BillPdfDocument
        title="Invoice"
        billNumber={invoiceData.orderNumber || invoiceData.vendorInvoiceNumber}
        issueDate={format(invoiceData.invoiceDate, 'MMM dd, yyyy')}
        dueDate={format(invoiceData.dueDate, 'MMM dd, yyyy')}
        currency={invoiceData.currency || 'XAF'}
        paymentMethod={invoiceData.paymentMethod ? formatPaymentMethod(invoiceData.paymentMethod) : ''}
        notes={notes || undefined}
        seller={{
          name: vendor?.name || 'Vendor',
          email: vendor?.email,
          phone: vendor?.phone,
          addressLines: formatPartyAddress(vendor?.address).split('\n').filter(Boolean),
        }}
        vendor={{
          name: orgDisplayName(org) || 'Your organization',
          email: org?.businessEmail,
          phone: org?.businessPhone,
        }}
        lines={(invoiceData.lineItems || []).map((item) => ({
          description: item.description || 'Item',
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          taxRate: Number(item.taxRate) || 0,
          discountAmount: Number(item.discountAmount) || 0,
          lineTotal: Number(item.total) || 0,
        }))}
        subtotal={invoiceData.subtotal}
        discount={invoiceData.discountAmount}
        tax={invoiceData.taxAmount}
        total={invoiceData.totalAmount}
        accent={prefs.accent}
        template={prefs.template}
        draft={false}
      />
    );
  }, [invoiceData, org, prefs.accent, prefs.template, vendor]);

  return <PdfPreview document={document} />;
};

export default VendorInvoicePdfView;
