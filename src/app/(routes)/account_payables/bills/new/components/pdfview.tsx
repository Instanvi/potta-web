'use client';
import Button from '@potta/components/button';
import { ContextData } from '@potta/components/providers/DataProvider';
import React, { useContext, useEffect, useState } from 'react';
import { Customer } from '../../../../customers/utils/types';
import useGetOneCustomer from '../../../../customers/hooks/useGetOneCustomer';
import useGetOneVendor from '../../../../vendors/hooks/useGetOneVendor';

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
  const vendorId = contextData.vendorId; // Get vendor ID from context

  const getCurrencySymbol = (currencyCode: string): string => {
    switch (currencyCode) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'FCFA':
        return 'FCFA';
      default:
        return currencyCode;
    }
  };
  const currencySymbol = getCurrencySymbol(contextData.currency || '');
  // Use the getOneVendor hook with the vendor ID
  const { data: vendorData, isLoading: vendorLoading } = useGetOneVendor(
    vendorId || ''
  );
  const vendorDetails = vendorData || null;

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
    <div className=" flex min-h-full flex-col items-center justify-center overflow-y-auto  w-full bg-[#F2F2F2]">
      <div className="flex  min-w-[45rem]  justify-between w-full p-8">
        <h3 className="text-xl font-medium">PDF Preview</h3>
        {/* <Button
          text={'Download'}
          icon={<i className="ri-download-line"></i>}
          type={'submit'}
        /> */}
      </div>
      <div className=" max-w-[48rem] bg-white space-y-8 min-w-[45rem] w-full">
        <div className=" h-36 w-full flex items-center justify-between px-4 bg-green-800">
          <p className="text-3xl mt-5 font-medium text-white">Bill</p>
          <div className="text-right text-white">
            <p>Date: {contextData.saleDate || 'Not set'}</p>
            <p>Currency: {contextData.currency || 'USD'}</p>
            <p>Bill Number: {contextData.invoiceNumber || 'Not set'}</p>
            <p>Payment Terms: {contextData.paymentTerms || 'Not set'}</p>
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
                {vendorLoading ? (
                  <p>Loading vendor details...</p>
                ) : vendorDetails ? (
                  <>
                    <p>{vendorDetails.name || 'No name'}</p>
                    <p>{vendorDetails.email || 'No email'}</p>
                    <p>{vendorDetails.address?.address || 'No address'}</p>
                    <p>{vendorDetails.phone || 'No phone'}</p>
                  </>
                ) : (
                  <p>No vendor selected</p>
                )}
              </div>
            </div>
          </div>

          <table className="min-w-full h-40 table-auto mt-10 ">
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
                      {price.toLocaleString()} {currencySymbol}
                    </td>
                    <td className="border-b px-4 py-2">
                      {itemTax.toLocaleString()} {currencySymbol}
                    </td>
                    <td className="border-b px-4 py-2">
                      {totalWithTax.toLocaleString()} {currencySymbol}
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
                  {contextData.payment_method?.[0] ||
                    contextData.paymentMethod ||
                    'Not selected'}
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
                  {subtotal.toLocaleString()} {currencySymbol}
                </div>
              </div>

              <div className="mt-2 flex justify-between ">
                <div className="w-1/2">Tax:</div>
                <div className="w-1/2 text-right pr-20">
                  {totalTax.toLocaleString()} {currencySymbol}
                </div>
              </div>
              {/* Horizontal Line */}
              <hr className="my-4 border-t-2 border-gray-300" />
              <div className="flex justify-between font-medium">
                <div className="w-1/2">Total:</div>
                <div className="w-1/2 text-right pr-20">
                  {total.toLocaleString()} {currencySymbol}
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
