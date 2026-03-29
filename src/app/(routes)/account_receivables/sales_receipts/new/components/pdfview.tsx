'use client';
import Button from '@potta/components/button';
import { ContextData } from '@potta/components/providers/DataProvider';
import React, { useContext, useEffect, useState } from 'react';
import { Customer } from '../../../../customers/utils/types';
import useGetOneCustomer from '../../../../customers/hooks/useGetOneCustomer';

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
  const [currentCustomerId, setCurrentCustomerId] = useState<string>('');

  // Get the latest context data on each render
  const contextData = context?.data || {};
  const tableData: TableItem[] = contextData.table || [];

  // Track customer ID changes from context
  useEffect(() => {
    if (
      contextData.customerName &&
      contextData.customerName !== currentCustomerId
    ) {
      setCurrentCustomerId(contextData.customerName);
    }
  }, [contextData.customerName]);

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

  // Use the getOneCustomer hook with the customer ID from state
  // This will re-fetch when currentCustomerId changes
  const { data: customerData, isLoading: customerLoading } = useGetOneCustomer(
    currentCustomerId || ''
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
    <div className="flex  flex-col items-center justify-center overflow-y-auto w-full bg-[#F2F2F2]">
      <div className="flex min-w-[30rem] justify-between w-full p-8">
        <h3 className="text-xl font-semibold">PDF Preview</h3>
      </div>
      <div className="max-w-[48rem] bg-white space-y-4 min-w-[45rem] w-full">
        <div className="h-36 w-full flex items-center justify-between px-4 bg-green-800">
          <p className="text-3xl mt-5 font-semibold text-white">
            Sales Receipt
          </p>
          <div className="text-right text-white">
            <p>Date: {contextData.saleDate || 'Not set'}</p>
            <p>Currency: {contextData.currency || 'USD'}</p>
          </div>
        </div>
        <div className="p-5 space-y-16 bg-white">
          <div className="mt-5 w-full flex space-x-5">
            <div className="flex w-[40%] space-x-2">
              <h3>From : </h3>
              <div className="space-y-2 text-sm text-gray-400 flex-col">
                <p>ABC Company</p>
                <p>hello@ABCcompany.com</p>
                <p>ABC, Street, D'la Cameroon</p>
                <p>+237 695904751</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <h3>To : </h3>
              <div className="space-y-2 text-sm text-gray-400 flex-col">
                {customerLoading ? (
                  <p>Loading customer details...</p>
                ) : customerDetails ? (
                  <>
                    <p>
                      {customerDetails.firstName} {customerDetails.lastName}
                    </p>
                    <p>{customerDetails.email || 'No email'}</p>
                    <p>{customerDetails.address.address || 'No address'}</p>
                    <p>{customerDetails.phone || 'No phone'}</p>
                  </>
                ) : (
                  <p>No customer selected</p>
                )}
              </div>
            </div>
          </div>

          <table className="min-w-full h-40 mt-5 ">
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
                  <tr className="h-fit" key={item.id || index}>
                    <td className="border-b px-4 h-fit">{index + 1}</td>
                    <td className="border-b px-4 h-fit">{item.name}</td>
                    <td className="border-b px-4 h-fit">{qty}</td>
                    <td className="border-b px-4 h-fit">
                      {price.toFixed(2)}
                      {currencySymbol}
                    </td>
                    <td className="border-b px-4 h-fit">
                      {itemTax.toFixed(2)}
                    </td>
                    <td className="border-b px-4 h-fit">
                      {totalWithTax.toFixed(2)}
                      {currencySymbol}
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
                  {contextData.payment_method?.[0] || 'Not selected'}
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
              <div className="mt-4 flex justify-between ">
                <div className="w-1/2">Sub Total:</div>
                <div className="w-1/2 text-right pr-20">
                  {subtotal.toFixed(2)}
                  {currencySymbol}
                </div>
              </div>

              <div className="mt-2 flex justify-between ">
                <div className="w-1/2">Tax:</div>
                <div className="w-1/2 text-right pr-20">
                  {totalTax.toFixed(2)}
                  {currencySymbol}
                </div>
              </div>
              {/* Horizontal Line */}
              <hr className="my-4 border-t-2 border-gray-300" />
              <div className="flex justify-between font-bold">
                <div className="w-1/2">Total:</div>
                <div className="w-1/2 text-right pr-20">
                  {total.toFixed(2)}
                  {currencySymbol}
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
