'use client';
import useGetOneCustomer from '@potta/app/(routes)/customers/hooks/useGetOneCustomer';
import { Customer } from '@potta/app/(routes)/customers/utils/types';
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
import { DocumentSellerHeader } from '@/components/documents/document-seller-header';
import { formatPartyAddress } from '@/lib/party-address';
import { downloadReactPdf } from '@/lib/download-react-pdf';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PAYMENT_METHODS } from '../../../utils/sale';

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
  onRegisterDownload?: (download: () => Promise<void>) => void;
} = {}) => {
  const context = useContext(ContextData);
  const [currentCustomerId, setCurrentCustomerId] = useState('');
  const { data: org } = useOrganizationProfile();
  const contextData = context?.data || {};
  const tableData: TableItem[] = contextData.table || [];

  useEffect(() => {
    if (contextData.customerName && contextData.customerName !== currentCustomerId) {
      setCurrentCustomerId(contextData.customerName);
    }
  }, [contextData.customerName, currentCustomerId]);

  const { data: customerData } = useGetOneCustomer(currentCustomerId || '');
  const customerDetails: Customer | null = customerData || null;

  const subtotal = tableData.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
  const totalTax = tableData.reduce((sum, item) => {
    const line = Number(item.price) * Number(item.qty);
    return sum + (line * Number(item.tax)) / 100;
  }, 0);
  const total = subtotal + totalTax;

  const rawPayment =
    typeof contextData.payment_method === 'string'
      ? contextData.payment_method
      : contextData.payment_method?.[0] || contextData.paymentMethod || '';
  const methodLabel = PAYMENT_METHODS.find((method) => method.value === rawPayment)?.label || rawPayment || '';
  const saleDateLabel = contextData.saleDate
    ? new Date(contextData.saleDate).toLocaleDateString()
    : 'Not set';
  const receiptNumber = contextData.receiptNumber || contextData.invoiceNumber || undefined;

  const pdfProps: SalesReceiptPdfProps = useMemo(() => {
    const customerName = customerDetails
      ? `${customerDetails.firstName ?? ''} ${customerDetails.lastName ?? ''}`.trim()
      : '';
    return {
      title: 'Sales receipt',
      receiptNumber: receiptNumber ? String(receiptNumber) : undefined,
      saleDate: saleDateLabel,
      currency: contextData.currency || 'XAF',
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
        return {
          description: item.name || 'Item or service',
          quantity: qty,
          unitPrice: price,
          taxRate: taxPct,
          lineTotal: lineSub + (lineSub * taxPct) / 100,
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

  const documentNode = useMemo(() => <SalesReceiptPdfDocument {...pdfProps} />, [pdfProps]);

  const download = useCallback(async () => {
    const filename = pdfProps.receiptNumber
      ? `sales-receipt-${pdfProps.receiptNumber}`
      : 'draft-sales-receipt';
    await downloadReactPdf(documentNode, filename);
  }, [documentNode, pdfProps.receiptNumber]);

  useEffect(() => {
    onRegisterDownload?.(download);
  }, [download, onRegisterDownload]);

  const currency = contextData.currency || 'XAF';

  return (
    <div className="flex min-h-full flex-col items-center justify-center overflow-y-auto w-full bg-white">
      <div className="flex min-w-[30rem] justify-between w-full p-8">
        <h3 className="text-xl font-medium">PDF Preview</h3>
      </div>
      <div className="max-w-[48rem] bg-white space-y-4 min-w-[45rem] w-full">
        <div className="h-36 w-full flex items-center justify-between px-4 bg-green-800">
          <p className="text-3xl mt-5 font-medium text-white">Sales Receipt</p>
          <div className="text-right text-white">
            <p>Date: {saleDateLabel}</p>
            <p>Currency: {currency}</p>
          </div>
        </div>
        <div className="p-5 space-y-16 bg-white">
          <div className="mt-5 w-full flex space-x-5">
            <DocumentSellerHeader className="w-[40%]" />
            <div className="flex space-x-2">
              <h3>To : </h3>
              <div className="space-y-2 text-sm text-gray-600 flex-col">
                {customerDetails ? (
                  <>
                    <p>
                      {customerDetails.firstName} {customerDetails.lastName}
                    </p>
                    <p>{customerDetails.email || 'No email'}</p>
                    <p>{formatPartyAddress(customerDetails.address) || 'No address'}</p>
                    <p>{customerDetails.phone || 'No phone'}</p>
                  </>
                ) : (
                  <p>No customer selected</p>
                )}
              </div>
            </div>
          </div>

          <table className="min-w-full h-40 mt-5">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item, index) => {
                const price = Number(item.price);
                const qty = Number(item.qty);
                const tax = Number(item.tax);
                const itemTotal = price * qty;
                const itemTax = (itemTotal * tax) / 100;
                const totalWithTax = itemTotal + itemTax;
                return (
                  <tr key={item.id || index}>
                    <td className="border-b px-4">{index + 1}</td>
                    <td className="border-b px-4">{item.name}</td>
                    <td className="border-b px-4">{qty}</td>
                    <td className="border-b px-4">{price.toFixed(2)} {currency}</td>
                    <td className="border-b px-4">{itemTax.toFixed(2)}</td>
                    <td className="border-b px-4">{totalWithTax.toFixed(2)} {currency}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="w-full mt-10 pb-4 flex">
            <div className="w-[50%]">
              <div className="pl-4">
                <p>
                  <strong>Payment Method:</strong> {methodLabel || 'Not selected'}
                </p>
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
                <div className="w-1/2 text-right pr-20">{subtotal.toFixed(2)} {currency}</div>
              </div>
              <div className="mt-2 flex justify-between">
                <div className="w-1/2">Tax:</div>
                <div className="w-1/2 text-right pr-20">{totalTax.toFixed(2)} {currency}</div>
              </div>
              <hr className="my-4 border-t-2 border-gray-300" />
              <div className="flex justify-between font-medium">
                <div className="w-1/2">Total:</div>
                <div className="w-1/2 text-right pr-20">{total.toFixed(2)} {currency}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfView;
