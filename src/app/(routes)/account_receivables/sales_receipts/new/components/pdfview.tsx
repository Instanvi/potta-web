'use client';
import useGetOneCustomer from '@potta/app/(routes)/customers/hooks/useGetOneCustomer';
import { Customer } from '@potta/app/(routes)/customers/utils/types';
import { DocumentSellerHeader } from '@/components/documents/document-seller-header';
import {
  SalesReceiptPdfDocument,
  type SalesReceiptPdfProps,
} from '@/components/documents/sales-receipt-pdf-document';
import { ContextData } from '@potta/components/providers/DataProvider';
import {
  formatOrgAddress,
  orgDisplayName,
  useOrganizationProfile,
} from '@/hooks/use-organization-profile';
import { downloadReactPdf } from '@/lib/download-react-pdf';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { paymentMethodLabel } from '../../utils/types';

interface TableItem {
  name: string;
  qty: number;
  price: number | string;
  tax: number | string;
  productId: string;
  uuid: string;
  id: number;
}

const PdfView = ({
  onRegisterDownload,
}: {
  /** Receives a stable download callback for the preview shell toolbar. */
  onRegisterDownload?: (download: () => Promise<void>) => void;
} = {}) => {
  const context = useContext(ContextData);
  const [currentCustomerId, setCurrentCustomerId] = useState<string>('');
  const { data: org } = useOrganizationProfile();

  const contextData = context?.data || {};
  const tableData: TableItem[] = contextData.table || [];

  useEffect(() => {
    if (
      contextData.customerName &&
      contextData.customerName !== currentCustomerId
    ) {
      setCurrentCustomerId(contextData.customerName);
    }
  }, [contextData.customerName, currentCustomerId]);

  const getCurrencySymbol = (currencyCode: string): string => {
    switch (currencyCode) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'XAF':
        return 'XAF';
      default:
        return currencyCode;
    }
  };

  const currencySymbol = getCurrencySymbol(contextData.currency || '');
  const { data: customerData, isLoading: customerLoading } = useGetOneCustomer(
    currentCustomerId || '',
  );
  const customerDetails: Customer | null = customerData || null;

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

  const rawPayment =
    typeof contextData.payment_method === 'string'
      ? contextData.payment_method
      : contextData.payment_method?.[0] ||
        contextData.paymentMethod ||
        '';
  const methodLabel = paymentMethodLabel(rawPayment) || '';

  const saleDateLabel = contextData.saleDate
    ? new Date(contextData.saleDate).toLocaleDateString()
    : 'Not set';

  const receiptNumber =
    contextData.receiptNumber || contextData.invoiceNumber || undefined;

  const pdfProps: SalesReceiptPdfProps = useMemo(() => {
    const customerName = customerDetails
      ? `${customerDetails.firstName ?? ''} ${customerDetails.lastName ?? ''}`.trim()
      : '';
    return {
      title: 'Sales receipt',
      receiptNumber: receiptNumber ? String(receiptNumber) : undefined,
      saleDate: saleDateLabel,
      currency: contextData.currency || 'USD',
      paymentMethod: methodLabel || undefined,
      paymentReference: contextData.paymentReference || undefined,
      notes: contextData.note || undefined,
      seller: {
        name: orgDisplayName(org) || 'Your organization',
        email: org?.businessEmail,
        phone: org?.businessPhone,
        addressLines: formatOrgAddress(org),
        logoUrl: org?.logo,
        registrationNumber: org?.registrationNumber,
        taxId: org?.taxIdentificationNumber,
      },
      customer: customerDetails
        ? {
            name: customerName || 'Customer',
            email: customerDetails.email,
            phone: customerDetails.phone,
            address: customerDetails.address?.address || undefined,
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
      draft: true,
    };
  }, [
    contextData.currency,
    contextData.note,
    contextData.paymentReference,
    customerDetails,
    methodLabel,
    org,
    receiptNumber,
    saleDateLabel,
    subtotal,
    tableData,
    total,
    totalTax,
  ]);

  const documentNode = useMemo(
    () => <SalesReceiptPdfDocument {...pdfProps} />,
    [pdfProps],
  );

  const download = useCallback(async () => {
    const filename = pdfProps.receiptNumber
      ? `sales-receipt-${pdfProps.receiptNumber}`
      : 'draft-sales-receipt';
    await downloadReactPdf(documentNode, filename);
  }, [documentNode, pdfProps.receiptNumber]);

  useEffect(() => {
    onRegisterDownload?.(download);
  }, [download, onRegisterDownload]);

  return (
    <div
      data-pdf-capture
      className="flex min-h-full w-full flex-col items-center justify-center overflow-y-auto scroll bg-main-bg"
    >
      <div className="flex w-full min-w-[30rem] justify-between p-8 pb-2">
        <h3 className="text-xl font-medium">PDF Preview</h3>
      </div>
      <div className="mb-10 w-full min-w-[45rem] max-w-[48rem] space-y-4 bg-white">
        <div className="flex h-36 w-full items-center justify-between bg-green-800 px-8">
          <div>
            <p className="text-3xl font-medium text-white">Sales Receipt</p>
            {receiptNumber ? (
              <p className="mt-2 text-white">#{receiptNumber}</p>
            ) : null}
          </div>
          <div className="text-right text-white">
            <p>Date: {saleDateLabel}</p>
            <p>Currency: {contextData.currency || 'USD'}</p>
          </div>
        </div>
        <div className="space-y-16 bg-white p-5">
          <div className="mt-5 flex w-full space-x-5">
            <DocumentSellerHeader className="w-[40%]" />
            <div className="flex space-x-2">
              <h3 className="font-medium">To: </h3>
              <div className="flex-col space-y-2 text-sm text-gray-600">
                {customerLoading ? (
                  <p>Loading customer details...</p>
                ) : customerDetails ? (
                  <>
                    <p>
                      {customerDetails.firstName} {customerDetails.lastName}
                    </p>
                    <p>{customerDetails.email || 'No email'}</p>
                    <p>{customerDetails.address?.address || 'No address'}</p>
                    <p>{customerDetails.phone || 'No phone'}</p>
                  </>
                ) : (
                  <p>No customer selected</p>
                )}
              </div>
            </div>
          </div>

          <table className="mt-5 min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tax
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
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

          <div className="mt-10 flex w-full pb-4">
            <div className="w-1/2 pl-4">
              <p>
                <strong>Payment Method:</strong>{' '}
                {methodLabel || 'Not selected'}
              </p>
              {contextData.note ? (
                <div className="mt-4">
                  <strong>Notes:</strong>
                  <p className="mt-1 text-gray-600">{contextData.note}</p>
                </div>
              ) : null}
            </div>
            <div className="w-1/2">
              <div className="mt-4 flex justify-between">
                <div className="w-1/2">Sub Total:</div>
                <div className="w-1/2 pr-20 text-right">
                  {currencySymbol}
                  {subtotal.toFixed(2)}
                </div>
              </div>
              <div className="mt-2 flex justify-between">
                <div className="w-1/2">Tax:</div>
                <div className="w-1/2 pr-20 text-right">
                  {currencySymbol}
                  {totalTax.toFixed(2)}
                </div>
              </div>
              <hr className="my-4 border-t-2 border-gray-300" />
              <div className="flex justify-between font-medium">
                <div className="w-1/2">Total:</div>
                <div className="w-1/2 pr-20 text-right">
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
