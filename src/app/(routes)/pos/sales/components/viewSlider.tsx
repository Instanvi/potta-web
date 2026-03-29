'use client';
import React, { useContext, useEffect, useState } from 'react';
import Slider from '@potta/components/slideover';
import { ContextData } from '@potta/components/providers/DataProvider';
import { useGetOneReceipt } from '../hooks/useGetOneReceipt';
import Button from '@potta/components/button';

// Define the response type based on the provided data
interface LineItem {
  uuid: string;
  branchId: string;
  createdAt: string;
  createdBy: string;
  updatedBy: string | null;
  deletedAt: string | null;
  updatedAt: string;
  description: string;
  quantity: number;
  discountType: string;
  unitPrice: number;
  discountCap: number;
  totalAmount: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number | null;
}

interface Address {
  uuid: string;
  branchId: string;
  createdAt: string;
  createdBy: string;
  updatedBy: string | null;
  deletedAt: string | null;
  updatedAt: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  geospatialLocation: any | null;
}

interface Customer {
  uuid: string;
  branchId: string;
  createdAt: string;
  createdBy: string;
  updatedBy: string | null;
  deletedAt: string | null;
  updatedAt: string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  phone: string;
  customerId: string;
  type: string;
  contactPerson: string;
  creditLimit: number;
  taxId: string;
  status: string;
  address: Address;
}

interface SalesPerson {
  uuid: string;
  branchId: string;
  createdAt: string;
  createdBy: string;
  updatedBy: string | null;
  deletedAt: string | null;
  updatedAt: string;
  orgId: string;
  vendorId: string;
  type: string;
  name: string;
  paymentTerms: string;
  paymentMethod: string;
  accountDetails: string;
  openingBalance: string;
  currency: string;
  phone: string;
  email: string;
  contactPerson: string;
  website: string;
  taxId: string;
  classification: string;
  notes: string;
  status: string;
  address: Address;
}

interface ReceiptData {
  uuid: string;
  branchId: string;
  createdAt: string;
  createdBy: string;
  updatedBy: string | null;
  deletedAt: string | null;
  updatedAt: string;
  saleReceiptId: string;
  saleDate: string;
  totalAmount: number;
  taxAmount: number;
  receiptNumber: string;
  notes: string;
  paymentReference: string;
  discountAmount: number;
  paymentMethod: string;
  lineItems: LineItem[];
  customer: Customer;
  salePerson: SalesPerson;
}

interface ReceiptDetailsProps {
  receiptId: string;
  open?: boolean; // Optional controlled open state
  setOpen?: (open: boolean) => void; // Optional setter from parent
}

const ViewReceiptSlider: React.FC<ReceiptDetailsProps> = ({
  receiptId,
  open: controlledOpen,
  setOpen: setControlledOpen,
}) => {
  const context = useContext(ContextData);
  const { data, isLoading, error, refetch } = useGetOneReceipt(receiptId);

  // Local state as fallback if no controlled state is provided
  const [localOpen, setLocalOpen] = useState(false);

  // Determine which open state to use
  const isOpen = controlledOpen ?? localOpen;
  const setIsOpen = setControlledOpen ?? setLocalOpen;

  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    if (isOpen && receiptId) {
      refetch();
    }
  }, [receiptId, refetch, isOpen]);

  // Calculate totals
  const calculateTotals = (lineItems: LineItem[] = []) => {
    const subtotal = lineItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const totalTax = lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const totalDiscount = lineItems.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    const total = subtotal + totalTax - totalDiscount;
    
    return { subtotal, totalTax, totalDiscount, total };
  };

  const { subtotal, totalTax, totalDiscount, total } = calculateTotals(data?.lineItems);
  
  // Get currency symbol from salesperson data or default to XAF
  const currencySymbol = data?.salePerson?.currency === 'XAF' ? ' XAF' : ' XAF';

  return (
    <Slider
      open={isOpen}
      setOpen={setIsOpen}
      edit={false}
      title="Receipt Details"
      buttonText="View Receipt"
    
    >
      {isLoading && (
        <div className="flex justify-center items-center py-10 h-screen">
          Loading...
        </div>
      )}

      {error && (
        <p className="text-red-600 text-center">
          Error fetching Receipt details: {error.message}
        </p>
      )}

      {!data && !isLoading && (
        <p className="text-gray-500 text-center">No Receipt data available.</p>
      )}

      {data && (
          <div className="relative h-[87.5vh] w-full max-w-4xl">
          
          <div className="max-w-[48rem] bg-white space-y-8 min-w-[45rem] w-full">
            <div className="h-36 w-full flex items-center justify-between px-4 bg-green-800">
              <p className="text-3xl mt-5 font-semibold text-white">
                Sales Receipt
              </p>
              <div className="text-right text-white">
                <p>Date: {formatDate(data.saleDate)}</p>
                <p>Receipt ID: {data.saleReceiptId}</p>
                <p>Currency: {data.salePerson?.currency || 'XAF'}</p>
              </div>
            </div>
            <div className="p-5 space-y-16 bg-white">
              <div className="mt-5 w-full flex space-x-5">
                <div className="flex w-[40%] space-x-2">
                  <h3>From : </h3>
                  <div className="space-y-2 text-sm text-gray-400 flex-col">
                    <p>{data.salePerson?.name || 'Company Name'}</p>
                    <p>{data.salePerson?.email || 'company@email.com'}</p>
                    <p>{data.salePerson?.address?.address || 'No address'}, {data.salePerson?.address?.city || ''}</p>
                    <p>{data.salePerson?.phone || 'No phone'}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <h3>To : </h3>
                  <div className="space-y-2 text-sm text-gray-400 flex-col">
                    {data.customer && (
                      <>
                        <p>
                          {data.customer.firstName} {data.customer.lastName}
                        </p>
                        <p>{data.customer.email || 'No email'}</p>
                        <p>{data.customer.address?.address || 'No address'}, {data.customer.address?.city || ''}</p>
                        <p>{data.customer.phone || 'No phone'}</p>
                      </>
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
                  {data.lineItems.map((item, index) => {
                    const price = item.unitPrice;
                    const qty = item.quantity;
                    const tax = item.taxAmount;
                    const itemTotal = price * qty;
                    const totalWithTax = itemTotal + tax;
  
                    return (
                      <tr className='h-fit' key={item.uuid || index}>
                        <td className="border-b px-4 h-fit">{index + 1}</td>
                        <td className="border-b px-4 h-fit">{item.description}</td>
                        <td className="border-b px-4 h-fit">{qty}</td>
                        <td className="border-b px-4 h-fit">
                          {price.toFixed(2)}
                          {currencySymbol}
                        </td>
                        <td className="border-b px-4 h-fit">{tax.toFixed(2)}{currencySymbol}</td>
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
                      {data.paymentMethod || 'Not specified'}
                    </p>
                    {data.notes && (
                      <div className="mt-4">
                        <strong>Notes:</strong>
                        <p className="text-gray-600 mt-1">{data.notes}</p>
                      </div>
                    )}
                    {data.paymentReference && (
                      <div className="mt-4">
                        <strong>Payment Reference:</strong>
                        <p className="text-gray-600 mt-1">{data.paymentReference}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-[50%]">
                  <div className="mt-4 flex justify-between ">
                    <div className="w-1/2">Sub Total:</div>
                    <div className="w-1/2 text-right pr-20">
                      {subtotal?.toFixed(2) || '0.00'}
                      {currencySymbol}
                    </div>
                  </div>
  
                  <div className="mt-2 flex justify-between ">
                    <div className="w-1/2">Tax:</div>
                    <div className="w-1/2 text-right pr-20">
                      {totalTax?.toFixed(2) || '0.00'}
                      {currencySymbol}
                    </div>
                  </div>

                  {data.discountAmount > 0 && (
                    <div className="mt-2 flex justify-between ">
                      <div className="w-1/2">Discount:</div>
                      <div className="w-1/2 text-right pr-20">
                        {data.discountAmount.toFixed(2)}
                        {currencySymbol}
                      </div>
                    </div>
                  )}
                  
                  {/* Horizontal Line */}
                  <hr className="my-4 border-t-2 border-gray-300" />
                  <div className="flex justify-between font-bold">
                    <div className="w-1/2">Total:</div>
                    <div className="w-1/2 text-right pr-20">
                      {data.totalAmount.toFixed(2)}
                      {currencySymbol}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Slider>
  );
};

export default ViewReceiptSlider;