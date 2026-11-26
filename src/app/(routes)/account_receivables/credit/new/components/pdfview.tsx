'use client';
import useGetOneCustomer from '@potta/app/(routes)/customers/hooks/useGetOneCustomer';
import { Customer } from '@potta/app/(routes)/customers/utils/types';
import {
  CreditNotePdfDocument,
  type CreditNotePdfProps,
} from '@/components/documents/credit-note-pdf-document';
import { ContextData } from '@potta/components/providers/DataProvider';
import { PdfPreview } from '@/components/documents/pdf-preview';
import { useOrganizationProfile } from '@/hooks/use-organization-profile';
import { downloadReactPdf } from '@/lib/download-react-pdf';
import { orgToSeller } from '@/lib/org-to-seller';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import useGetOneInvoice from '../../../invoice/_hooks/useGetOneInvoice';
import {
  CreditNoteTableRow,
  computeCreditAmount,
  rowTotal,
} from '../../_utils/lines';

interface Invoice {
  uuid: string;
  invoiceNumber: string;
  issuedDate: string;
  dueDate: string;
  totalAmount: number;
}

const PdfView = ({
  onRegisterDownload,
}: {
  onRegisterDownload?: (download: () => Promise<void>) => void;
} = {}) => {
  const context = useContext(ContextData);
  const contextData = context?.data || {};
  const { data: org } = useOrganizationProfile();

  const formattedIssueDate = contextData.issueDate
    ? new Date(contextData.issueDate).toLocaleDateString()
    : 'Not set';

  const customerId = contextData.customerName;
  const invoiceId = contextData.invoiceId;
  // Amount comes from the form lines (tax included); fall back to a stored amount.
  const tableRows: CreditNoteTableRow[] = useMemo(
    () => (Array.isArray(contextData.table) ? contextData.table : []),
    [contextData.table],
  );
  const lineRows = useMemo(
    () => tableRows.filter((r) => Number(r.qty) > 0 || Number(r.price) > 0),
    [tableRows],
  );
  const creditAmount =
    computeCreditAmount(tableRows) || Number(contextData.creditAmount) || 0;
  const reason = contextData.reason || '';

  const currency = contextData.currency || 'USD';

  const { data: customerData } = useGetOneCustomer(customerId || '');
  const customerDetails: Customer | null = customerData || null;

  const { data: invoiceData } = useGetOneInvoice(invoiceId || '');
  const invoiceDetails: Invoice | null = invoiceData || null;

  const reference = invoiceDetails?.invoiceNumber
    ? `${invoiceDetails.invoiceNumber}-CR`
    : 'New-CR';

  const pdfProps: CreditNotePdfProps = useMemo(() => {
    const customerName = customerDetails
      ? `${customerDetails.firstName ?? ''} ${customerDetails.lastName ?? ''}`.trim()
      : '';
    return {
      title: 'Credit note',
      reference,
      issueDate: formattedIssueDate,
      currency,
      creditAmount,
      reason: reason || undefined,
      referenceInvoice: invoiceDetails
        ? `Invoice #${invoiceDetails.invoiceNumber}`
        : undefined,
      invoiceDate: invoiceDetails
        ? new Date(invoiceDetails.issuedDate).toLocaleDateString()
        : undefined,
      notes: contextData.note || undefined,
      seller: orgToSeller(org),
      lineItems: lineRows.map((row) => ({
        description: row.name || undefined,
        quantity: Number(row.qty) || 0,
        unitPrice: Number(row.price) || 0,
        taxRate: Number(row.tax) || 0,
        total: rowTotal(row),
      })),
      customer: customerDetails
        ? {
            name: customerName || 'Customer',
            email: customerDetails.email,
            phone: customerDetails.phone,
            address: customerDetails.address?.address || undefined,
          }
        : null,
      draft: true,
    };
  }, [
    contextData.note,
    creditAmount,
    currency,
    customerDetails,
    formattedIssueDate,
    invoiceDetails,
    lineRows,
    org,
    reason,
    reference,
  ]);

  const documentNode = useMemo(
    () => <CreditNotePdfDocument {...pdfProps} />,
    [pdfProps],
  );

  const download = useCallback(async () => {
    const filename = pdfProps.reference
      ? `credit-note-${pdfProps.reference}`
      : 'draft-credit-note';
    await downloadReactPdf(documentNode, filename);
  }, [documentNode, pdfProps.reference]);

  useEffect(() => {
    onRegisterDownload?.(download);
  }, [download, onRegisterDownload]);


  return <PdfPreview document={documentNode} />;
};

export default PdfView;
