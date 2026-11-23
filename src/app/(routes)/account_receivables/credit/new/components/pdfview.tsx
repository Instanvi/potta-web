'use client';
import useGetOneCustomer from '@potta/app/(routes)/customers/hooks/useGetOneCustomer';
import { Customer } from '@potta/app/(routes)/customers/utils/types';
import {
  CreditNotePdfDocument,
  type CreditNotePdfProps,
} from '@/components/documents/credit-note-pdf-document';
import { ContextData } from '@potta/components/providers/DataProvider';
import {
  formatOrgAddress,
  orgDisplayName,
  useOrganizationProfile,
} from '@/hooks/use-organization-profile';
import { downloadReactPdf } from '@/lib/download-react-pdf';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import useGetOneInvoice from '../../../invoice/_hooks/useGetOneInvoice';

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
  const creditAmount = Number(contextData.creditAmount) || 0;
  const reason = contextData.reason || '';

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
  const currency = contextData.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);

  const { data: customerData, isLoading: customerLoading } = useGetOneCustomer(
    customerId || '',
  );
  const customerDetails: Customer | null = customerData || null;

  const { data: invoiceData, isLoading: invoiceLoading } = useGetOneInvoice(
    invoiceId || '',
  );
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
      draft: true,
    };
  }, [
    contextData.note,
    creditAmount,
    currency,
    customerDetails,
    formattedIssueDate,
    invoiceDetails,
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

  return (
    <div className="flex min-h-full flex-col items-center justify-center overflow-y-auto w-full scroll bg-main-bg">
      <div className="flex min-w-[45rem] justify-between w-full p-8">
        <h3 className="text-xl font-medium">Credit Note Preview</h3>
      </div>

      <div className="max-w-[48rem] bg-white space-y-8 min-w-[45rem] w-full mb-10">
        <div className="h-36 w-full flex items-center justify-between px-8 bg-blue-800">
          <div>
            <p className="text-3xl font-medium text-white">Credit Note</p>
            <p className="text-white mt-2">#{reference}</p>
          </div>
          <div className="text-right text-white">
            <p>
              <strong>Issue Date:</strong> {formattedIssueDate}
            </p>
            <p>
              <strong>Currency:</strong> {currency}
            </p>
          </div>
        </div>

        <div className="p-5 space-y-16 bg-white">
          <div className="mt-5 w-full flex space-x-5">
            <div className="flex w-[40%] space-x-2">
              <h3 className="font-medium">From: </h3>
              <div className="space-y-2 text-sm text-gray-600 flex-col">
                <p>{orgDisplayName(org) || 'Your organization'}</p>
                {org?.businessEmail ? <p>{org.businessEmail}</p> : null}
                {(formatOrgAddress(org) ?? []).map((line) => (
                  <p key={line}>{line}</p>
                ))}
                {org?.businessPhone ? <p>{org.businessPhone}</p> : null}
              </div>
            </div>
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
                    <p>{customerDetails.address?.address || 'No address'}</p>
                    <p>{customerDetails.phone || 'No phone'}</p>
                  </>
                ) : (
                  <p>No customer selected</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-md">
            <h3 className="text-lg font-medium mb-4">Credit Note Details</h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Reference Invoice:</p>
                <p className="font-medium">
                  {invoiceLoading
                    ? 'Loading...'
                    : invoiceDetails
                      ? `Invoice #${invoiceDetails.invoiceNumber}`
                      : 'No invoice selected'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Invoice Date:</p>
                <p className="font-medium">
                  {invoiceLoading
                    ? 'Loading...'
                    : invoiceDetails
                      ? new Date(invoiceDetails.issuedDate).toLocaleDateString()
                      : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Credit Amount:</p>
                <p className="font-medium text-xl text-green-600">
                  {currencySymbol}
                  {creditAmount.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Reason for Credit:</p>
                <p className="font-medium">{reason || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {contextData.note && (
            <div className="mt-4">
              <h3 className="font-medium">Notes:</h3>
              <p className="text-sm text-gray-600 mt-2 p-4 bg-gray-50 rounded-md">
                {contextData.note}
              </p>
            </div>
          )}

          <div className="border-t pt-6 mt-6">
            <p className="text-center text-sm text-gray-500">
              This credit note is issued with reference to the original invoice. For any
              questions, please contact our finance department.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfView;
