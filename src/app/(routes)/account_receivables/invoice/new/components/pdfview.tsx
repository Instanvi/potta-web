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

  // User information is already loaded in AuthGuard and available in context
  console.log('PDF View Context Data:', contextData);
  console.log('User Permissions:', contextData.userPermissions);
  console.log('Organization Info:', {
    name: contextData.organizationName,
    branch: contextData.branchName,
    address: contextData.branchAddress,
  });

  // Get user role information
  const userRole =
    contextData.userPermissions?.[0]?.roleName ||
    contextData.userRole ||
    'User';
  const userName = `${contextData.userFirstName || 'Abayo'} ${
    contextData.userLastName || 'Joram'
  }`;

  // State for invoice color
  const [invoiceColor, setInvoiceColor] = useState('#059669'); // Default green-700

  // Predefined color options for companies
  const colorOptions = [
    { name: 'Green', value: '#059669', class: 'bg-green-700' },
    { name: 'Blue', value: '#1d4ed8', class: 'bg-blue-700' },
    { name: 'Purple', value: '#7c3aed', class: 'bg-purple-700' },
    { name: 'Red', value: '#dc2626', class: 'bg-red-700' },
    { name: 'Orange', value: '#ea580c', class: 'bg-orange-700' },
    { name: 'Teal', value: '#0f766e', class: 'bg-teal-700' },
    { name: 'Indigo', value: '#4338ca', class: 'bg-indigo-700' },
    { name: 'Pink', value: '#be185d', class: 'bg-pink-700' },
  ];

  // Format dates if they exist
  const formattedIssueDate = contextData.issueDate
    ? new Date(contextData.issueDate).toLocaleDateString()
    : 'Not set';

  const formattedDueDate = contextData.dueDate
    ? new Date(contextData.dueDate).toLocaleDateString()
    : 'Not set';

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
    <div className="flex min-h-full flex-col items-start justify-center overflow-y-auto w-full scroll bg-[#F2F2F2]">
      <div className="flex min-w-[45rem] justify-between w-full p-8 pb-2">
        <h3 className="text-xl font-medium">PDF Preview</h3>
      </div>

      {/* Color Selection */}
      <div className="flex items-center px-8 pb-2 space-x-4">
        <span className="text-sm font-medium text-gray-700">
          Invoice Color:
        </span>
        <div className="flex space-x-2">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              onClick={() => setInvoiceColor(color.value)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                invoiceColor === color.value
                  ? 'border-gray-800 scale-110'
                  : 'border-gray-300 hover:border-gray-500'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
          {/* Custom Color Picker */}
          <div className="relative">
            <input
              type="color"
              value={invoiceColor}
              onChange={(e) => setInvoiceColor(e.target.value)}
              className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
              title="Custom Color"
            />
          </div>
        </div>
      </div>
      <div className="max-w-[48rem] bg-white space-y-8 min-w-[45rem] w-full mb-10">
        <div
          className="h-36 w-full flex items-center justify-between px-8"
          style={{ backgroundColor: invoiceColor }}
        >
          <div>
            <p className="text-3xl font-medium text-white">{invoiceType}</p>
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
        <div className="p-5 space-y-16 bg-white">
          <div className="mt-5 w-full flex space-x-5">
            <div className="flex w-[40%] space-x-2">
              <h3 className="font-medium">From: </h3>
              <div className="space-y-2 text-sm text-gray-600 flex-col">
                <p className="font-medium">
                  {contextData.organizationName ||
                    contextData.companyName ||
                    'Instanvi Inc'}
                </p>
                <p>{contextData.branchName || 'Headquarters'}</p>
                <p>
                  {contextData.branchAddress ||
                    contextData.companyAddress ||
                    'Quartre-etage, bonaberi, Douala'}
                </p>
                <p>
                  {contextData.userEmail ||
                    contextData.companyEmail ||
                    'abayojoram696@gmail.com'}
                </p>
                <p>
                  {contextData.userPhone ||
                    contextData.companyPhone ||
                    'No phone'}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Created by: {userName} ({userRole})
                </p>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfView;
