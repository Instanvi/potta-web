'use client';
import useGetOneCustomer from '@potta/app/(routes)/customers/hooks/useGetOneCustomer';
import { Customer } from '@potta/app/(routes)/customers/utils/types';
import {
  InvoicePdfDocument,
  type InvoicePdfProps,
} from '@/components/documents/invoice-pdf-document';
import { ContextData } from '@potta/components/providers/DataProvider';
import {
  formatOrgAddress,
  orgDisplayName,
  useOrganizationProfile,
} from '@/hooks/use-organization-profile';
import { useDocumentLetterhead } from '@/hooks/use-document-letterhead';
import { resolveLetterheadLogoUrl, absoluteBrandUrl } from '@/lib/brand';
import { formatPartyAddress } from '@/lib/party-address';
import { PdfPreview } from '@/components/documents/pdf-preview';
import { withDocumentAcronym } from '@potta/components/generated-number-field';
import { downloadReactPdf } from '@/lib/download-react-pdf';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface TableItem {
  name: string;
  qty: number;
  price: number | string;
  tax: number | string;
  productId: string;
  uuid: string;
  id: number;
}

function formatPaymentMethod(raw: unknown): string {
  const value =
    typeof raw === 'string'
      ? raw
      : Array.isArray(raw)
        ? String(raw[0] ?? '')
        : '';
  return (
    value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c: string) => c.toUpperCase()) || ''
  );
}

const EMPTY_TABLE: TableItem[] = [];

const PdfView = ({
  onRegisterDownload,
}: {
  /** Receives a stable download callback for the preview shell toolbar. */
  onRegisterDownload?: (download: () => Promise<void>) => void;
} = {}) => {
  const context = useContext(ContextData);
  const contextData = context?.data || {};
  const tableData: TableItem[] = Array.isArray(contextData.table)
    ? contextData.table
    : EMPTY_TABLE;
  const customerId = contextData.customerName; // Get customer ID from context
  const { data: org } = useOrganizationProfile();
  const { prefs: letterhead } = useDocumentLetterhead();
  const invoiceColor = letterhead.accent || '#0b5d1e';

  const formattedIssueDate = contextData.issueDate
    ? new Date(contextData.issueDate).toLocaleDateString()
    : '';
  const formattedDueDate = contextData.dueDate
    ? new Date(contextData.dueDate).toLocaleDateString()
    : '';
  const previewCurrency =
    typeof contextData.currency === 'string' && contextData.currency.trim()
      ? contextData.currency
      : '';

  const invoiceType = contextData.invoiceType || 'Invoice';
  const invoiceNumber = withDocumentAcronym(
    String(contextData.invoiceNumber || ''),
    'INV',
  );
  const billingAddress = contextData.billing || '';
  const shippingAddress = contextData.shipping || '';
  const paymentTerms = contextData.paymentTerms || '';
  const paymentReference = contextData.paymentReference || '';

  const { data: customerData } = useGetOneCustomer(customerId || '');
  const customerDetails: Customer | null = customerData || null;

  // Calculate totals
  const subtotal = tableData.reduce((sum: number, item: TableItem) => {
    const price = Number(item.price);
    const qty = Number(item.qty);
    return sum + price * qty;
  }, 0);

  const totalTax = tableData.reduce((sum: number, item: TableItem) => {
    const price = Number(item.price);
    const qty = Number(item.qty);
    const tax = Number(item.tax);
    return sum + (price * qty * tax) / 100;
  }, 0);

  const total = subtotal + totalTax;

  const paymentMethodLabel = formatPaymentMethod(
    typeof contextData.payment_method === 'string' ||
      Array.isArray(contextData.payment_method)
      ? contextData.payment_method
      : contextData.paymentMethod,
  );

  const pdfProps: InvoicePdfProps = useMemo(() => {
    const customerName = customerDetails
      ? `${customerDetails.firstName ?? ''} ${customerDetails.lastName ?? ''}`.trim()
      : '';
    const scheduleNote = [
      contextData.frequency ? `Schedule: ${contextData.frequency}` : '',
      contextData.startDate
        ? `Starts ${new Date(contextData.startDate).toLocaleDateString()}`
        : '',
      contextData.endDate
        ? `Ends ${new Date(contextData.endDate).toLocaleDateString()}`
        : '',
      contextData.occurrences ? `${contextData.occurrences} occurrences` : '',
    ]
      .filter(Boolean)
      .join(' · ');
    const notes = [contextData.note, scheduleNote].filter(Boolean).join('\n') || undefined;
    return {
      title: contextData.frequency
        ? `Recurring ${invoiceType || 'Invoice'}`
        : invoiceType || 'Invoice',
      invoiceNumber: invoiceNumber ? String(invoiceNumber) : undefined,
      issueDate: formattedIssueDate,
      dueDate: formattedDueDate,
      currency: previewCurrency,
      paymentMethod: paymentMethodLabel || undefined,
      paymentReference: paymentReference || undefined,
      paymentTerms: paymentTerms || undefined,
      notes,
      shippingAddress: shippingAddress || undefined,
      seller: {
        name: orgDisplayName(org) || 'Your organization',
        email: org?.businessEmail,
        phone: org?.businessPhone,
        addressLines: formatOrgAddress(org),
        logoUrl: (() => {
          const src = resolveLetterheadLogoUrl(letterhead.logo, org?.logo, 'png');
          return src ? absoluteBrandUrl(src) : null;
        })(),
        registrationNumber: org?.registrationNumber,
        taxId: org?.taxIdentificationNumber,
      },
      customer: customerDetails
        ? {
            name: customerName || 'Customer',
            email: customerDetails.email,
            phone: customerDetails.phone,
            address:
              billingAddress ||
              formatPartyAddress(customerDetails.address) ||
              undefined,
          }
        : null,
      lines: tableData.map((item) => {
        const price = Number(item.price) || 0;
        const qty = Number(item.qty) || 0;
        const taxPct = Number(item.tax) || 0;
        const lineSub = price * qty;
        const lineTax = (lineSub * taxPct) / 100;
        return {
          description: item.name || 'Item or service',
          quantity: qty,
          unitPrice: price,
          taxRate: taxPct,
          lineTotal: lineSub + lineTax,
        };
      }),
      subtotal,
      tax: totalTax,
      total,
      accent: invoiceColor,
      template: letterhead.template,
      draft: true,
    };
  }, [
    billingAddress,
    previewCurrency,
    contextData.endDate,
    contextData.frequency,
    contextData.note,
    contextData.occurrences,
    contextData.startDate,
    customerDetails,
    formattedDueDate,
    formattedIssueDate,
    invoiceColor,
    invoiceNumber,
    invoiceType,
    letterhead.logo,
    letterhead.template,
    org,
    paymentMethodLabel,
    paymentReference,
    paymentTerms,
    shippingAddress,
    subtotal,
    tableData,
    total,
    totalTax,
  ]);

  /** Hold last stable props so typing does not rebuild the PDF every keystroke. */
  const [stableProps, setStableProps] = useState(pdfProps);
  useEffect(() => {
    const handle = window.setTimeout(() => setStableProps(pdfProps), 500);
    return () => window.clearTimeout(handle);
  }, [pdfProps]);

  const documentNode = useMemo(
    () => <InvoicePdfDocument {...stableProps} />,
    [stableProps],
  );

  const download = useCallback(async () => {
    const filename = pdfProps.invoiceNumber || 'INV-draft';
    await downloadReactPdf(<InvoicePdfDocument {...pdfProps} />, filename);
  }, [pdfProps]);

  useEffect(() => {
    onRegisterDownload?.(download);
  }, [download, onRegisterDownload]);

  return <PdfPreview document={documentNode} />;
};

export default PdfView;
