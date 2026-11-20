'use client';
import useGetOneVendor from '@potta/app/(routes)/vendors/hooks/useGetOneVendor';
import { ContextData } from '@potta/components/providers/DataProvider';
import React, { useContext } from 'react';

interface TableItem {
  name: string;
  qty: number;
  productId: string;
  uuid: string;
  id: number;
  price: number;
  tax: number;
}

const PdfView = () => {
  const context = useContext(ContextData);
  const contextData = context?.data || {};
  const tableData: TableItem[] = contextData.table || [];
  const vendorId = contextData.vendorId; // Get vendor ID from context

  // Format dates if they exist
  const formattedOrderDate = contextData.orderDate
    ? new Date(contextData.orderDate).toLocaleDateString()
    : 'Not set';

  const formattedRequiredDate = contextData.requiredDate
    ? new Date(contextData.requiredDate).toLocaleDateString()
    : 'Not set';

  const shippingAddress = contextData.shippingAddress || '';
  const paymentTerms = contextData.paymentTerms || '';
  const paymentMethod = contextData.paymentMethod || '';
  const vendorName = contextData.vendorName || '';

  // Format payment method for display
  const formatPaymentMethod = (method: string): string => {
    const methodMap: { [key: string]: string } = {
      CREDIT_CARD: 'Credit Card',
      BANK_TRANSFER: 'Bank Transfer',
      ACH_TRANSAFER: 'ACH Transfer',
      MOBILE_MONEY: 'Mobile Money',
      CASH: 'Cash',
      CREDIT: 'Credit',
      OTHER: 'Other',
    };
    return methodMap[method] || method;
  };

  // Use the getOneVendor hook with the vendor ID
  const {
    data: vendorData,
    isLoading: vendorLoading,
    error: vendorError,
  } = useGetOneVendor(vendorId || '');
  const vendorDetails = vendorData || null;

  return (
    <div className="flex min-h-full flex-col items-center justify-center overflow-y-auto w-full scroll bg-[#F2F2F2]">
      <div className="flex min-w-[45rem] justify-between w-full p-8">
        <h3 className="text-xl font-medium">Purchase Order Preview</h3>
      </div>

      <div className="max-w-[48rem] bg-white space-y-8 min-w-[45rem] w-full mb-10">
        <div className="h-36 w-full flex items-center justify-between px-8 bg-green-800">
          <div>
            <p className="text-3xl font-medium text-white">Purchase Order</p>
            {/* <p className="text-white mt-2">Draft</p> */}
          </div>
          <div className="text-right text-white">
            <p>
              <strong>Order Date:</strong> {formattedOrderDate}
            </p>
            <p>
              <strong>Required Date:</strong> {formattedRequiredDate}
            </p>
          </div>
        </div>

        <div className="p-5 space-y-8 bg-white">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Vendor:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                {vendorLoading ? (
                  <p>Loading vendor details...</p>
                ) : vendorDetails ? (
                  <>
                    <p className="font-medium text-gray-800">
                      {vendorDetails.name || vendorName || 'Vendor Name'}
                    </p>
                    <p>{vendorDetails.email || 'No email'}</p>
                    <p>{vendorDetails.address?.address || 'No address'}</p>
                    <p>{vendorDetails.phone || 'No phone'}</p>
                    {vendorDetails.contactPerson && (
                      <p>Contact: {vendorDetails.contactPerson}</p>
                    )}
                  </>
                ) : vendorName ? (
                  <>
                    <p className="font-medium text-gray-800">{vendorName}</p>
                    <p>Loading vendor details...</p>
                  </>
                ) : (
                  <p>No vendor selected</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-2">Ship To:</h3>
              <p className="text-sm text-gray-600">
                {shippingAddress || 'No shipping address specified'}
              </p>
            </div>
          </div>

          <table className="min-w-full table-auto mt-8 border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                  Item
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                  Qty
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                  Tax %
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item: TableItem, index: number) => {
                const itemTotal = item.qty * item.price;
                const itemTax = (itemTotal * item.tax) / 100;
                const totalWithTax = itemTotal + itemTax;

                return (
                  <tr
                    key={item.id || index}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="border px-6 py-3">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        ID: {item.productId}
                      </p>
                    </td>
                    <td className="border px-4 py-3 text-center">{item.qty}</td>
                    <td className="border px-4 py-3 text-center">
                      XAF {item.price.toFixed(2)}
                    </td>
                    <td className="border px-4 py-3 text-center">
                      {item.tax}%
                    </td>
                    <td className="border px-4 py-3 text-center">
                      XAF {totalWithTax.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Order Totals */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal:</span>
                  <span>
                    XAF{' '}
                    {tableData
                      .reduce((sum, item) => sum + item.qty * item.price, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tax:</span>
                  <span>
                    XAF{' '}
                    {tableData
                      .reduce((sum, item) => {
                        const itemTotal = item.qty * item.price;
                        return sum + (itemTotal * item.tax) / 100;
                      }, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total:</span>
                  <span className="font-medium">
                    XAF{' '}
                    {tableData
                      .reduce((sum, item) => {
                        const itemTotal = item.qty * item.price;
                        const itemTax = (itemTotal * item.tax) / 100;
                        return sum + itemTotal + itemTax;
                      }, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-8 pt-6 border-t">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">
                Payment Information:
              </h3>
              <p className="text-sm">
                <span className="font-medium">Method:</span>{' '}
                {formatPaymentMethod(paymentMethod) || 'Not specified'}
              </p>
              {paymentTerms && (
                <div className="mt-2">
                  <p className="font-medium">Terms:</p>
                  <p className="text-sm text-gray-600 mt-1">{paymentTerms}</p>
                </div>
              )}
            </div>

            {contextData.note && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Notes:</h3>
                <p className="text-sm text-gray-600">{contextData.note}</p>
              </div>
            )}
          </div>

          <div className="text-center text-xs text-gray-500 pt-6 border-t">
            <p>
              This purchase order is subject to the terms and conditions agreed
              upon by both parties.
            </p>
            <p className="mt-2">
              Generated on {new Date().toLocaleDateString()} at{' '}
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfView;
