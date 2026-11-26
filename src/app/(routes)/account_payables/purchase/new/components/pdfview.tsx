'use client';
import useGetOneVendor from '@potta/app/(routes)/vendors/hooks/useGetOneVendor';
import {
  PurchaseOrderPdfDocument,
  type PurchaseOrderPdfProps,
} from '@/components/documents/purchase-order-pdf-document';
import { PdfPreview } from '@/components/documents/pdf-preview';
import { ContextData } from '@potta/components/providers/DataProvider';
import { useDocumentLetterhead } from '@/hooks/use-document-letterhead';
import { useOrganizationProfile } from '@/hooks/use-organization-profile';
import { absoluteBrandUrl, resolveLetterheadLogoUrl } from '@/lib/brand';
import { downloadReactPdf } from '@/lib/download-react-pdf';
import { orgToSeller } from '@/lib/org-to-seller';
import { formatPartyAddress } from '@/lib/party-address';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';

interface TableItem {
  name: string;
  qty: number;
  productId: string;
  uuid: string;
  id: number;
  price: number;
  tax: number;
}

const PAYMENT_LABELS: Record<string, string> = {
  CREDIT_CARD: 'Credit Card',
  BANK_TRANSFER: 'Bank Transfer',
  ACH_TRANSAFER: 'ACH Transfer',
  MOBILE_MONEY: 'Mobile Money',
  CASH: 'Cash',
  CREDIT: 'Credit',
  OTHER: 'Other',
};

const EMPTY_TABLE: TableItem[] = [];

const PdfView = ({
  onRegisterDownload,
}: {
  onRegisterDownload?: (download: () => Promise<void>) => void;
} = {}) => {
  const context = useContext(ContextData);
  const contextData = context?.data || {};
  const tableData: TableItem[] = Array.isArray(contextData.table)
    ? contextData.table
    : EMPTY_TABLE;
  const { data: org } = useOrganizationProfile();
  const { prefs: letterhead } = useDocumentLetterhead();
  const { data: vendorData } = useGetOneVendor(contextData.vendorId || '');

  const formattedOrderDate = contextData.orderDate
    ? new Date(contextData.orderDate).toLocaleDateString()
    : '';
  const formattedRequiredDate = contextData.requiredDate
    ? new Date(contextData.requiredDate).toLocaleDateString()
    : '';

  const subtotal = tableData.reduce((sum, item) => sum + Number(item.qty) * Number(item.price), 0);
  const totalTax = tableData.reduce((sum, item) => {
    const line = Number(item.qty) * Number(item.price);
    return sum + (line * Number(item.tax)) / 100;
  }, 0);
  const total = subtotal + totalTax;

  const pdfProps: PurchaseOrderPdfProps = useMemo(() => {
    const logoSrc = resolveLetterheadLogoUrl(letterhead.logo, org?.logo, 'png');
    const method = String(contextData.paymentMethod || '');
    return {
      title: 'Purchase order',
      orderDate: formattedOrderDate,
      requiredDate: formattedRequiredDate,
      currency: contextData.currency || 'XAF',
      paymentMethod: method ? PAYMENT_LABELS[method] || method : undefined,
      paymentTerms: contextData.paymentTerms || undefined,
      notes: contextData.note || undefined,
      shippingAddress: contextData.shippingAddress || undefined,
      seller: {
        ...orgToSeller(org),
        logoUrl: logoSrc ? absoluteBrandUrl(logoSrc) : null,
      },
      vendor: vendorData
        ? {
            name: vendorData.name || contextData.vendorName || 'Vendor',
            email: vendorData.email,
            phone: vendorData.phone,
            address: formatPartyAddress(vendorData.address) || undefined,
            contactPerson: vendorData.contactPerson,
          }
        : contextData.vendorName
          ? { name: contextData.vendorName }
          : null,
      lines: tableData.map((item) => {
        const price = Number(item.price) || 0;
        const qty = Number(item.qty) || 0;
        const taxPct = Number(item.tax) || 0;
        const lineSub = price * qty;
        return {
          description: item.name || 'Item',
          quantity: qty,
          unitPrice: price,
          taxRate: taxPct,
          lineTotal: lineSub + (lineSub * taxPct) / 100,
        };
      }),
      subtotal,
      tax: totalTax,
      total,
      accent: letterhead.accent || '#0b5d1e',
      draft: true,
    };
  }, [
    contextData.currency,
    contextData.note,
    contextData.paymentMethod,
    contextData.paymentTerms,
    contextData.shippingAddress,
    contextData.vendorName,
    formattedOrderDate,
    formattedRequiredDate,
    letterhead.accent,
    letterhead.logo,
    org,
    subtotal,
    tableData,
    total,
    totalTax,
    vendorData,
  ]);

  const documentNode = useMemo(
    () => <PurchaseOrderPdfDocument {...pdfProps} />,
    [pdfProps],
  );

  const download = useCallback(async () => {
    await downloadReactPdf(documentNode, 'purchase-order-draft');
  }, [documentNode]);

  useEffect(() => {
    onRegisterDownload?.(download);
  }, [download, onRegisterDownload]);

  return <PdfPreview document={documentNode} />;
};

export default PdfView;
