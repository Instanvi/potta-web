'use client';
import useGetOneCustomer from '@potta/app/(routes)/customers/hooks/useGetOneCustomer';
import { Customer } from '@potta/app/(routes)/customers/utils/types';
import { PdfPreview } from '@/components/documents/pdf-preview';
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

const EMPTY_TABLE: TableItem[] = [];

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
  const tableData: TableItem[] = Array.isArray(contextData.table)
    ? contextData.table
    : EMPTY_TABLE;

  useEffect(() => {
    if (
      contextData.customerName &&
      contextData.customerName !== currentCustomerId
    ) {
      setCurrentCustomerId(contextData.customerName);
    }
  }, [contextData.customerName, currentCustomerId]);

  const { data: customerData } = useGetOneCustomer(
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


  return <PdfPreview document={documentNode} />;
};

export default PdfView;
