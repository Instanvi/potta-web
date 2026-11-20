'use client';

import Slider from '@potta/components/slideover';
import useGetBill from '../new/hooks/useGetBill';
import React from 'react';
import ThreadPanel from '@potta/components/threads/ThreadPanel';

interface BillDetailsSlideoverProps {
  billId: string | null;
  open: boolean;
  setOpen: (v: boolean) => void;
}

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="font-medium text-gray-500 whitespace-nowrap text-sm">
    {children}
  </span>
);

const Value: React.FC<{ children: React.ReactNode; highlight?: boolean }> = ({
  children,
  highlight,
}) => (
  <span
    className={`text-gray-900 break-all ${
      highlight ? 'font-medium text-lg text-green-700' : ''
    }`}
  >
    {children}
  </span>
);

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="uppercase tracking-wide text-xs font-medium text-gray-400 mb-4 mt-2">
    {children}
  </div>
);

const BillDetailsSlideover: React.FC<BillDetailsSlideoverProps> = ({
  billId,
  open,
  setOpen,
}) => {
  const { data, isLoading } = useGetBill(billId || '');
  const bill: any = data || {};
  const vendor = bill.vendor || {};
  const address = vendor.address || {};

  return (
    <Slider edit={false} title="Bill Details" open={open} setOpen={setOpen}>
      {isLoading ? (
        <div className="p-8">Loading...</div>
      ) : bill && bill.uuid ? (
        <div className="w-full max-w-6xl py-4 px-2" style={{ minHeight: 400 }}>
          <div className="flex flex-col md:flex-row gap-0">
            {/* Left: Bill Summary */}
            <div className="flex-1 min-w-[260px] pr-8 border-r border-gray-100">
              <SectionHeader>Bill Summary</SectionHeader>
              <div className="mb-6">
                <div className="text-2xl font-extrabold text-gray-800 mb-1 flex items-center gap-2">
                  Bill <span className="text-gray-400">#</span>
                  {bill.invoiceNumber || bill.invoiceId}
                </div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                    bill.status === 'Approved'
                      ? 'bg-green-50 text-green-700'
                      : bill.status === 'Rejected'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {bill.status}
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2 items-center">
                  <Label>Type:</Label>
                  <Value>{bill.invoiceType}</Value>
                </div>
                <div className="flex gap-2 items-center">
                  <Label>Amount:</Label>
                  <Value highlight>
                    {bill.currency} {bill.invoiceTotal}
                  </Value>
                </div>
                <div className="flex gap-2 items-center">
                  <Label>Issued Date:</Label>
                  <Value>
                    {bill.issuedDate
                      ? new Date(bill.issuedDate).toLocaleDateString()
                      : '-'}
                  </Value>
                </div>
                <div className="flex gap-2 items-center">
                  <Label>Due Date:</Label>
                  <Value>
                    {bill.dueDate
                      ? new Date(bill.dueDate).toLocaleDateString()
                      : '-'}
                  </Value>
                </div>
                <div className="flex gap-2 items-center">
                  <Label>Payment Method:</Label>
                  <Value>{bill.paymentMethod}</Value>
                </div>
                <div className="flex gap-2 items-center">
                  <Label>Payment Reference:</Label>
                  <Value>{bill.paymentReference}</Value>
                </div>
                <div className="flex gap-2 items-center">
                  <Label>Voucher Code:</Label>
                  <Value>{bill.voucherCode}</Value>
                </div>
                <div className="flex gap-2 items-center">
                  <Label>Tax Rate:</Label>
                  <Value>{bill.taxRate}%</Value>
                </div>
                <div className="flex gap-2 items-center">
                  <Label>Tax Amount:</Label>
                  <Value>{bill.taxAmount}</Value>
                </div>
                <div className="flex gap-2 items-center">
                  <Label>Payment Terms:</Label>
                  <Value>{bill.paymentTerms}</Value>
                </div>
                <div className="flex gap-2 items-center">
                  <Label>Notes:</Label>
                  <Value>{bill.notes}</Value>
                </div>
              </div>
            </div>

            {/* Right: Vendor Info + Address as two columns */}
            <div className="flex-[1.5] min-w-[400px] pl-8 flex flex-row gap-8 bg-gray-50">
              {/* Vendor Info */}
              <div className="flex-1">
                <SectionHeader>Vendor Information</SectionHeader>
                <div className="space-y-4">
                  <div className="flex gap-2 items-center">
                    <Label>Name:</Label>
                    <Value>{vendor.name}</Value>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Label>Type:</Label>
                    <Value>{vendor.type}</Value>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Label>Email:</Label>
                    <Value>{vendor.email}</Value>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Label>Phone:</Label>
                    <Value>{vendor.phone}</Value>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Label>Contact Person:</Label>
                    <Value>{vendor.contactPerson}</Value>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Label>Classification:</Label>
                    <Value>{vendor.classification}</Value>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Label>Status:</Label>
                    <Value>{vendor.status}</Value>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Label>Website:</Label>
                    <Value>{vendor.website}</Value>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Label>Tax ID:</Label>
                    <Value>{vendor.taxId}</Value>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Label>Opening Balance:</Label>
                    <Value>
                      {vendor.openingBalance} {vendor.currency}
                    </Value>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Label>Account Details:</Label>
                    <Value>{vendor.accountDetails}</Value>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Label>Payment Terms:</Label>
                    <Value>{vendor.paymentTerms}</Value>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Label>Payment Method:</Label>
                    <Value>{vendor.paymentMethod}</Value>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Label>Credit Limit:</Label>
                    <Value>{vendor.creditLimit}</Value>
                  </div>
                </div>
              </div>
              {/* Vendor Address */}
              <div className="flex-1">
                <SectionHeader>Vendor Address</SectionHeader>
                <div className="space-y-4 mt-2">
                  <div className="flex gap-2 items-center">
                    <Label>Address:</Label>
                    <Value>{address.address}</Value>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Label>City:</Label>
                    <Value>{address.city}</Value>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Label>State:</Label>
                    <Value>{address.state}</Value>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Label>Country:</Label>
                    <Value>{address.country}</Value>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Label>Postal Code:</Label>
                    <Value>{address.postalCode}</Value>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {bill?.uuid && (
            <div className="mt-6">
              <ThreadPanel
                entityType="INVOICE"
                entityId={bill.uuid}
                entityDisplayName={`Invoice #${
                  bill.invoiceNumber || bill.invoiceId || bill.uuid
                }`}
                emptyStateMessage="No invoice discussions yet."
              />
            </div>
          )}
        </div>
      ) : (
        <div className="p-8">No details found.</div>
      )}
    </Slider>
  );
};

export default BillDetailsSlideover;
