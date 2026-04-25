'use client';
import useGetOneCustomer from '@potta/app/(routes)/customers/hooks/useGetOneCustomer';
import { Customer } from '@potta/app/(routes)/customers/utils/types';
import Button from '@potta/components/button';
import { ContextData } from '@potta/components/providers/DataProvider';
import React, { useContext, useEffect, useState } from 'react';

interface TableItem {
  name: string;
  qty: number;
  price: number | string;
  tax: number | string;
  productId: string;
  uuid: string;
  id: number;
}

const PdfView = () => {
  const context = useContext(ContextData);
  const contextData = context?.data || {};
  const tableData: TableItem[] = contextData.table || [];
  const customerId = contextData.customerName; // Get customer ID from context

  // Format dates if they exist
  const formattedIssueDate = contextData.issueDate
    ? new Date(contextData.issueDate).toLocaleDateString()
    : 'Not set';

  const formattedDueDate = contextData.dueDate
    ? new Date(contextData.dueDate).toLocaleDateString()
    : 'Not set';

  // Recurring invoice specific data
  const frequency = contextData.frequency || 'Monthly';
  const formattedStartDate = contextData.startDate
    ? new Date(contextData.startDate).toLocaleDateString()
    : 'Not set';
  const formattedEndDate = contextData.endDate
    ? new Date(contextData.endDate).toLocaleDateString()
    : null;
  const occurrences = contextData.occurrences || null;

  const invoiceType = contextData.invoiceType || 'Invoice';
  const invoiceNumber = contextData.invoiceNumber || '0025';
  const billingAddress = contextData.billing || '';
  const shippingAddress = contextData.shipping || '';
  const paymentTerms = contextData.paymentTerms || '';
  const paymentReference = contextData.paymentReference || '';
  const taxRate = contextData.taxRate || 0;

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

  // Use the getOneCustomer hook with the customer ID
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

  return (
    <div className="flex min-h-full flex-col items-center justify-center overflow-y-auto w-full scroll bg-[#F2F2F2]">
      <div className="flex min-w-[45rem] justify-between w-full p-8">
        <h3 className="text-xl font-medium">PDF Preview</h3>
      </div>
      <div className="max-w-[48rem] bg-white space-y-8 min-w-[45rem] w-full mb-10">
        <div className="h-36 w-full flex items-center justify-between px-8 bg-yellow-800">
          <div>
            <p className="text-3xl font-medium text-white">Recurring {invoiceType}</p>
            <p className="text-white mt-2">#{invoiceNumber}</p>
          </div>
          <div className="text-right text-white">
            <p>
              <strong>Issue Date:</strong> {formattedIssueDate}
            </p>
            <p>
              <strong>Due Date:</strong> {formattedDueDate}
            </p>
            <p>
              <strong>Currency:</strong> {contextData.currency || 'USD'}
            </p>
          </div>
        </div>
        
        {/* Recurring Information Box */}
        <div className="px-8 py-4 bg-blue-50 border-l-4 border-blue-500">
          <h3 className="font-medium text-blue-800 mb-2">Recurring Schedule</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Frequency:</strong> {frequency}</p>
              <p><strong>Start Date:</strong> {formattedStartDate}</p>
            </div>
            <div>
              {formattedEndDate ? (
                <p><strong>End Date:</strong> {formattedEndDate}</p>
              ) : occurrences ? (
                <p><strong>Occurrences:</strong> {occurrences}</p>
              ) : (
                <p><strong>End:</strong> Not specified</p>
              )}
            </div>
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

          {/* Subtotal and Tax Rows */}
          <div className="w-full mt-10 pb-4 flex">
            <div className="w-[50%]">
              {/* Payment Method and Notes */}
              <div className="pl-4">
                <p>
                  <strong>Payment Method:</strong>{' '}
                  {contextData.payment_method?.[0]
                    ?.replace(/([A-Z])/g, ' $1')
                    .toUpperCase() || 'Not selected'}
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
              {/* Horizontal Line */}
              <hr className="my-4 border-t-2 border-gray-300" />
              <div className="flex justify-between font-medium">
                <div className="w-1/2">Total:</div>
                <div className="w-1/2 text-right pr-20">
                  {currencySymbol}
                  {total.toFixed(2)}
                </div>
              </div>
              
              {/* Recurring payment information */}
              <div className="mt-6 pt-4 border-t border-gray-300">
                <p className="font-medium text-gray-700">This is a recurring invoice. You will be billed {frequency.toLowerCase()}.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfView;