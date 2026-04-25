'use client';
import React from 'react';
import { format } from 'date-fns';

interface VendorInvoicePdfViewProps {
  invoiceData: {
    vendorInvoiceNumber?: string;
    orderNumber?: string;
    invoiceDate: Date;
    dueDate: Date;
    currency: string;
    paymentMethod: string;
    paymentTerms: string;
    billingAddress: string;
    shippingAddress: string;
    notes: string;
    lineItems: any[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    vendor: any;
  };
}

const VendorInvoicePdfView: React.FC<VendorInvoicePdfViewProps> = ({
  invoiceData,
}) => {
  // Format payment method for better display
  const formatPaymentMethod = (method: string) => {
    switch (method.toUpperCase()) {
      case 'MOBILE_MONEY':
        return 'Mobile Money';
      case 'BANK_TRANSFER':
        return 'Bank Transfer';
      case 'CASH':
        return 'Cash';
      case 'CHECK':
        return 'Check';
      case 'CREDIT_CARD':
        return 'Credit Card';
      case 'ACH_TRANSFER':
        return 'ACH Transfer';
      default:
        return method
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  return (
    <div className="bg-white h-full overflow-y-auto pt-10">
      {/* Green Header */}
      <div className="bg-green-700 text-white p-8 py-5">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-medium text-white mb-2">INVOICE</h1>
              <p className="text-green-100">
                Invoice{' '}
                {invoiceData.orderNumber || invoiceData.vendorInvoiceNumber
                  ? `#${
                      invoiceData.orderNumber || invoiceData.vendorInvoiceNumber
                    }`
                  : '(Pending)'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-100">Invoice Date</div>
              <div className="font-medium text-white">
                {format(invoiceData.invoiceDate, 'MMM dd, yyyy')}
              </div>
              <div className="text-sm text-green-100 mt-2">Due Date</div>
              <div className="font-medium text-white">
                {format(invoiceData.dueDate, 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Vendor and Company Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">From:</h3>
              <div className="text-gray-700">
                <p className="font-medium">{invoiceData.vendor.name}</p>
                <p>{invoiceData.vendor.email}</p>
                <p>{invoiceData.vendor.phone}</p>
                {invoiceData.vendor.address && (
                  <div className="mt-2">
                    <p>{invoiceData.vendor.address.address}</p>
                    <p>
                      {invoiceData.vendor.address.city},{' '}
                      {invoiceData.vendor.address.state}
                    </p>
                    <p>
                      {invoiceData.vendor.address.country}{' '}
                      {invoiceData.vendor.address.postalCode}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">To:</h3>
              <div className="text-gray-700">
                <p className="font-medium">Company Name</p>
                <p>company@email.com</p>
                <p>+1234567890</p>
                <div className="mt-2">
                  <p>Company Address</p>
                  <p>City, State</p>
                  <p>Country Postal Code</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Payment Method:
              </h3>
              <p className="text-gray-700">
                {formatPaymentMethod(invoiceData.paymentMethod)}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Payment Terms:
              </h3>
              <p className="text-gray-700">{invoiceData.paymentTerms}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium">
                    Description
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-medium">
                    Qty
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-medium">
                    Unit Price
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-medium">
                    Tax Rate
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-medium">
                    Discount
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-medium">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.lineItems.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.description}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {item.quantity}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {invoiceData.currency} {item.unitPrice.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {item.taxRate}%
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {item.discountRate}%
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {invoiceData.currency} {item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-medium">
                    {invoiceData.currency} {invoiceData.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Tax:</span>
                  <span className="font-medium">
                    {invoiceData.currency} {invoiceData.taxAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Discount:</span>
                  <span className="font-medium">
                    {invoiceData.currency}{' '}
                    {invoiceData.discountAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-medium border-t pt-2">
                  <span>Total:</span>
                  <span>
                    {invoiceData.currency} {invoiceData.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoiceData.notes && (
            <div className="mb-8">
              <h3 className="font-medium text-gray-900 mb-2">Notes:</h3>
              <p className="text-gray-700">{invoiceData.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-8 text-center text-gray-600">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorInvoicePdfView;
