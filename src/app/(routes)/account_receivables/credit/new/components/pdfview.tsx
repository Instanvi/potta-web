'use client';
import useGetOneCustomer from '@potta/app/(routes)/customers/hooks/useGetOneCustomer';
import { Customer } from '@potta/app/(routes)/customers/utils/types';
import { ContextData } from '@potta/components/providers/DataProvider';
import React, { useContext } from 'react';
import useGetOneInvoice from '../hooks/useGetOneInvoice';

interface Invoice {
  uuid: string;
  invoiceNumber: string;
  issuedDate: string;
  dueDate: string;
  totalAmount: number;
}

const PdfView = () => {
  const context = useContext(ContextData);
  const contextData = context?.data || {};
  
  // Format dates if they exist
  const formattedIssueDate = contextData.issueDate
    ? new Date(contextData.issueDate).toLocaleDateString()
    : 'Not set';
  
  const customerId = contextData.customerName;
  const invoiceId = contextData.invoiceId;
  const creditAmount = contextData.creditAmount || 0;
  const reason = contextData.reason || '';
  
  // Get currency symbol
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
  const currencySymbol = getCurrencySymbol(contextData.currency || 'USD');
  
  // Fetch customer details
  const { data: customerData, isLoading: customerLoading } = useGetOneCustomer(customerId || '');
  const customerDetails: Customer | null = customerData || null;
  
  // Fetch invoice details (you'll need to create this hook)
  const { data: invoiceData, isLoading: invoiceLoading } = useGetOneInvoice(invoiceId || '');
  const invoiceDetails: Invoice | null = invoiceData || null;

  return (
    <div className="flex min-h-full flex-col items-center justify-center overflow-y-auto w-full scroll bg-[#F2F2F2]">
      <div className="flex min-w-[45rem] justify-between w-full p-8">
        <h3 className="text-xl font-medium">Credit Note Preview</h3>
      </div>
      
      <div className="max-w-[48rem] bg-white space-y-8 min-w-[45rem] w-full mb-10">
        <div className="h-36 w-full flex items-center justify-between px-8 bg-blue-800">
          <div>
            <p className="text-3xl font-medium text-white">Credit Note</p>
            <p className="text-white mt-2">#{invoiceDetails?.invoiceNumber || 'New'}-CR</p>
          </div>
          <div className="text-right text-white">
            <p>
              <strong>Issue Date:</strong> {formattedIssueDate}
            </p>
            <p>
              <strong>Currency:</strong> {contextData.currency || 'USD'}
            </p>
          </div>
        </div>
        
        <div className="p-5 space-y-16 bg-white">
          <div className="mt-5 w-full flex space-x-5">
            <div className="flex w-[40%] space-x-2">
              <h3 className="font-medium">From: </h3>
              <div className="space-y-2 text-sm text-gray-600 flex-col">
                <p>ABC Company</p>
                <p>hello@ABCcompany.com</p>
                <p>ABC, Street, D'la Cameroon</p>
                <p>+237 695904751</p>
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
                    <p>
                      {customerDetails.address?.address || 'No address'}
                    </p>
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
                  {invoiceLoading ? 'Loading...' : 
                    invoiceDetails ? `Invoice #${invoiceDetails.invoiceNumber}` : 'No invoice selected'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Invoice Date:</p>
                <p className="font-medium">
                  {invoiceLoading ? 'Loading...' : 
                    invoiceDetails ? new Date(invoiceDetails.issuedDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Credit Amount:</p>
                <p className="font-medium text-xl text-green-600">
                  {currencySymbol}{creditAmount.toFixed(2)}
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
              This credit note is issued with reference to the original invoice.
              For any questions, please contact our finance department.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfView;