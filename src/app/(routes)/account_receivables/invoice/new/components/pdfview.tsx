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
import { DocumentSellerHeader } from '@/components/documents/document-seller-header';
import { withDocumentAcronym } from '@potta/components/generated-number-field';
import { downloadReactPdf } from '@/lib/download-react-pdf';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';

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

function getCurrencySymbol(currencyCode: string): string {
  switch (currencyCode) {
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'XAF':
      return 'XAF ';
    default:
      return currencyCode ? `${currencyCode} ` : '';
  }
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
  const taxRate = contextData.taxRate || 0;
  const currencySymbol = getCurrencySymbol(contextData.currency || 'USD');

  const { data: customerData, isLoading: customerLoading } = useGetOneCustomer(
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
      currency: previewCurrency,
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
    previewCurrency,
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

      <div className="mb-10 w-full min-w-[45rem] max-w-[48rem] space-y-8 bg-white">
        <div
          className="h-36 w-full flex items-center justify-between px-8"
          style={{ backgroundColor: invoiceColor }}
        >
          <div>
            <p className="text-3xl font-medium text-white">{invoiceType}</p>
            <p className="text-white mt-2">#{invoiceNumber}</p>
          </div>
          <div className="space-y-1 text-right text-white">
            {formattedIssueDate ? (
              <p>
                <strong>Issue Date:</strong> {formattedIssueDate}
              </p>
            ) : null}
            {formattedDueDate ? (
              <p>
                <strong>Due Date:</strong> {formattedDueDate}
              </p>
            ) : null}
            {previewCurrency ? (
              <p>
                <strong>Currency:</strong> {previewCurrency}
              </p>
            ) : null}
          </div>
        </div>
        <div className="p-5 space-y-16 bg-white">
          <div className="mt-5 w-full flex space-x-5">
            <DocumentSellerHeader className="w-[40%]" />
            <div className="flex space-x-2">
              <h3 className="font-medium">To: </h3>
              <div className="space-y-2 text-sm text-gray-600 flex-col">
                {customerLoading ? (
                  <p>Loading customer details...</p>
                ) : customerDetails ? (
                  <>
                    <p>
                      {customerDetails.firstName} {customerDetails.lastName}
                    </p>
                    <p>{customerDetails.email || 'No email'}</p>
                    <p>
                      {billingAddress ||
                        customerDetails.address?.address ||
                        'No address'}
                    </p>
                    <p>{customerDetails.phone || 'No phone'}</p>
                  </>
                ) : (
                  <p>No customer selected</p>
                )}
              </div>
            </div>
          </div>

          {shippingAddress && (
            <div className="mt-4">
              <h3 className="font-medium">Shipping Address:</h3>
              <p className="text-sm text-gray-600">{shippingAddress}</p>
            </div>
          )}

          <table className="min-w-full h-40 table-auto mt-10">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item: TableItem, index: number) => {
                const price = Number(item.price);
                const qty = Number(item.qty);
                const tax = Number(item.tax);
                const itemTotal = price * qty;
                const itemTax = (itemTotal * tax) / 100;
                const totalWithTax = itemTotal + itemTax;

                return (
                  <tr key={item.id || index}>
                    <td className="border-b px-4 py-2">{index + 1}</td>
                    <td className="border-b px-4 py-2">{item.name}</td>
                    <td className="border-b px-4 py-2">{qty}</td>
                    <td className="border-b px-4 py-2">
                      {currencySymbol}
                      {price.toFixed(2)}
                    </td>
                    <td className="border-b px-4 py-2">
                      {currencySymbol}
                      {itemTax.toFixed(2)}
                    </td>
                    <td className="border-b px-4 py-2">
                      {currencySymbol}
                      {totalWithTax.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="w-full mt-10 pb-4 flex">
            <div className="w-[50%]">
              <div className="pl-4">
                <p>
                  <strong>Payment Method:</strong>{' '}
                  {paymentMethodLabel || 'Not selected'}
                </p>
                {paymentReference && (
                  <p className="mt-2">
                    <strong>Payment Reference:</strong> {paymentReference}
                  </p>
                )}
                {paymentTerms && (
                  <div className="mt-2">
                    <strong>Payment Terms:</strong>
                    <p className="text-gray-600 mt-1">{paymentTerms}</p>
                  </div>
                )}
                {contextData.note && (
                  <div className="mt-4">
                    <strong>Notes:</strong>
                    <p className="text-gray-600 mt-1">{contextData.note}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="w-[50%]">
              <div className="mt-4 flex justify-between">
                <div className="w-1/2">Sub Total:</div>
                <div className="w-1/2 text-right pr-20">
                  {currencySymbol}
                  {subtotal.toFixed(2)}
                </div>
              </div>
              <div className="mt-2 flex justify-between">
                <div className="w-1/2">Tax ({taxRate || 0}%):</div>
                <div className="w-1/2 text-right pr-20">
                  {currencySymbol}
                  {totalTax.toFixed(2)}
                </div>
              </div>
              <hr className="my-4 border-t-2 border-gray-300" />
              <div className="flex justify-between font-medium">
                <div className="w-1/2">Total:</div>
                <div className="w-1/2 text-right pr-20">
                  {currencySymbol}
                  {total.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfView;
