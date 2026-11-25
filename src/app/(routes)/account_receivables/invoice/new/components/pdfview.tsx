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
import { withDocumentAcronym } from '@potta/components/generated-number-field';
import { downloadReactPdf } from '@/lib/download-react-pdf';
import { pdf } from '@react-pdf/renderer';
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

const PdfView = ({
  onRegisterDownload,
}: {
  /** Receives a stable download callback for the preview shell toolbar. */
  onRegisterDownload?: (download: () => Promise<void>) => void;
} = {}) => {
  const context = useContext(ContextData);
  const contextData = context?.data || {};
  const tableData: TableItem[] = contextData.table || [];
  const customerId = contextData.customerName; // Get customer ID from context
  const { data: org } = useOrganizationProfile();
  const { prefs: letterhead, setPrefs: setLetterhead } = useDocumentLetterhead();

  // Accent follows letterhead prefs (shared with the editor form).
  const invoiceColor = letterhead.accent || '#0b5d1e';
  const setInvoiceColor = (value: string) => setLetterhead({ accent: value });

  // Predefined color options for companies
  const colorOptions = [
    { name: 'Green', value: '#0b5d1e', class: 'bg-green-800' },
    { name: 'Blue', value: '#1d4ed8', class: 'bg-blue-700' },
    { name: 'Purple', value: '#7c3aed', class: 'bg-purple-700' },
    { name: 'Red', value: '#dc2626', class: 'bg-red-700' },
    { name: 'Orange', value: '#ea580c', class: 'bg-orange-700' },
    { name: 'Teal', value: '#0f766e', class: 'bg-teal-700' },
    { name: 'Indigo', value: '#4338ca', class: 'bg-indigo-700' },
    { name: 'Pink', value: '#be185d', class: 'bg-pink-700' },
  ];

  // Format dates if they exist
  const formattedIssueDate = contextData.issueDate
    ? new Date(contextData.issueDate).toLocaleDateString()
    : 'Not set';

  const formattedDueDate = contextData.dueDate
    ? new Date(contextData.dueDate).toLocaleDateString()
    : 'Not set';

  const invoiceType = contextData.invoiceType || 'Invoice';
  const invoiceNumber = withDocumentAcronym(
    String(contextData.invoiceNumber || ''),
    'INV',
  );
  const billingAddress = contextData.billing || '';
  const shippingAddress = contextData.shipping || '';
  const paymentTerms = contextData.paymentTerms || '';
  const paymentReference = contextData.paymentReference || '';

  const { data: customerData } = useGetOneCustomer(
    customerId || ''
  );
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
    return {
      title: invoiceType || 'Invoice',
      invoiceNumber: invoiceNumber ? String(invoiceNumber) : undefined,
      issueDate: formattedIssueDate,
      dueDate: formattedDueDate,
      currency: contextData.currency || 'USD',
      paymentMethod: paymentMethodLabel || undefined,
      paymentReference: paymentReference || undefined,
      paymentTerms: paymentTerms || undefined,
      notes: contextData.note || undefined,
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
      draft: true,
    };
  }, [
    billingAddress,
    contextData.currency,
    contextData.note,
    customerDetails,
    formattedDueDate,
    formattedIssueDate,
    invoiceColor,
    invoiceNumber,
    invoiceType,
    letterhead.logo,
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

  const documentNode = useMemo(
    () => <InvoicePdfDocument {...pdfProps} />,
    [pdfProps],
  );

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPreviewError(null);
    pdf(documentNode)
      .toBlob()
      .then((blob) => {
        if (cancelled) return;
        const objectUrl = URL.createObjectURL(blob);
        setPreviewUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return objectUrl;
        });
      })
      .catch((error) => {
        console.error('Invoice PDF failed', error);
        if (!cancelled) setPreviewError('Could not build the invoice PDF.');
      });
    return () => {
      cancelled = true;
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
    };
  }, [documentNode]);

  const download = useCallback(async () => {
    const filename = pdfProps.invoiceNumber || 'INV-draft';
    await downloadReactPdf(documentNode, filename);
  }, [documentNode, pdfProps.invoiceNumber]);

  useEffect(() => {
    onRegisterDownload?.(download);
  }, [download, onRegisterDownload]);

  return (
    <div className="flex min-h-full flex-col items-start justify-center overflow-y-auto w-full scroll bg-main-bg">
      <div className="flex min-w-[45rem] justify-between w-full p-8 pb-2">
        <h3 className="text-xl font-medium">PDF Preview</h3>
      </div>

      {/* Color Selection */}
      <div className="flex items-center px-8 pb-2 space-x-4">
        <span className="text-sm font-medium text-gray-700">
          Invoice Color:
        </span>
        <div className="flex space-x-2">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              onClick={() => setInvoiceColor(color.value)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                invoiceColor === color.value
                  ? 'border-gray-800 scale-110'
                  : 'border-gray-300 hover:border-gray-500'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
          {/* Custom Color Picker */}
          <div className="relative">
            <input
              type="color"
              value={invoiceColor}
              onChange={(e) => setInvoiceColor(e.target.value)}
              className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
              title="Custom Color"
            />
          </div>
        </div>
      </div>
      <div className="h-[78vh] w-full bg-white">
        {previewError ? (
          <p className="p-8 text-sm text-destructive">{previewError}</p>
        ) : previewUrl ? (
          <iframe
            title="Invoice PDF"
            src={previewUrl}
            className="h-full w-full border-0 bg-white"
          />
        ) : (
          <p className="p-8 text-sm text-muted-foreground">Building invoice PDF…</p>
        )}
      </div>
    </div>
  );
};

export default PdfView;
