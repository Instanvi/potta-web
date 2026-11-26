'use client';
import useGetOneCustomer from '@potta/app/(routes)/customers/hooks/useGetOneCustomer';
import { Customer } from '@potta/app/(routes)/customers/utils/types';
import {
  SalesReceiptPdfDocument,
  type SalesReceiptPdfProps,
} from '@/components/documents/sales-receipt-pdf-document';
import { ContextData } from '@potta/components/providers/DataProvider';
import { useDocumentLetterhead } from '@/hooks/use-document-letterhead';
import {
  formatOrgAddress,
  orgDisplayName,
  useOrganizationProfile,
} from '@/hooks/use-organization-profile';
import { PdfPreview } from '@/components/documents/pdf-preview';
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

const EMPTY_TABLE: TableItem[] = [];

const PdfView = ({
  onRegisterDownload,
}: {
  onRegisterDownload?: (download: () => Promise<void>) => void;
} = {}) => {
  const context = useContext(ContextData);
  const [currentCustomerId, setCurrentCustomerId] = useState('');
  const { data: org } = useOrganizationProfile();
  const { prefs: letterhead } = useDocumentLetterhead();
  const contextData = context?.data || {};
  const tableData: TableItem[] = Array.isArray(contextData.table)
    ? contextData.table
    : EMPTY_TABLE;

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
      accent: letterhead.accent,
      template: letterhead.template,
      draft: true,
    };
  }, [
    contextData.currency,
    contextData.note,
    contextData.paymentReference,
    customerDetails,
    letterhead.accent,
    letterhead.template,
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

  return <PdfPreview document={documentNode} />;
};

export default PdfView;
