'use client';
import React, { useState, useEffect, useContext } from 'react';
import { PurchaseOrderDetails, VendorInvoiceData } from '../types';
import useCreateVendorInvoice from '../hooks/useCreateVendorInvoice';
import toast from 'react-hot-toast';
import Input from '@potta/components/input';
import Button from '@potta/components/button';
import { DateInput } from '@potta/components/customDatePicker';
import TextArea from '@potta/components/textArea';
import { ContextData } from '@potta/components/providers/DataProvider';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@potta/components/resizable';
import VendorInvoicePdfView from './VendorInvoicePdfView';
import { useRouter } from 'next/navigation';

interface VendorInvoiceFormProps {
  token: string;
  purchaseOrder: PurchaseOrderDetails;
  orgId?: string;
  locationId?: string;
}

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountRate: number;
  discountType: string;
  discountCap: number;
  productId: string;
  total: number;
}

const VendorInvoiceForm: React.FC<VendorInvoiceFormProps> = ({
  token,
  purchaseOrder,
  orgId,
  locationId,
}) => {
  const context = useContext(ContextData);
  const createInvoiceMutation = useCreateVendorInvoice();
  const router = useRouter();

  // Panel state
  const [showPreview, setShowPreview] = useState(false);
  const [leftPanelSize, setLeftPanelSize] = useState(100);

  // Form state
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [currency, setCurrency] = useState('XAF');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  // Prefill form with purchase order data
  useEffect(() => {
    if (purchaseOrder) {
      setInvoiceDate(new Date(purchaseOrder.purchaseOrder.orderDate));
      setDueDate(new Date(purchaseOrder.purchaseOrder.requiredDate));
      setPaymentMethod(purchaseOrder.purchaseOrder.paymentMethod || '');
      setPaymentTerms(purchaseOrder.purchaseOrder.paymentTerms || '');
      setNotes(purchaseOrder.purchaseOrder.notes || '');
      setCurrency('XAF'); // Default currency

      // Set billing address from vendor
      const vendorAddress = purchaseOrder.vendor?.address;
      if (vendorAddress) {
        setBillingAddress(
          `${vendorAddress.address || ''}, ${vendorAddress.city || ''}, ${
            vendorAddress.state || ''
          }, ${vendorAddress.country || ''}`
        );
      }

      // Set shipping address from purchase order
      setShippingAddress(purchaseOrder.purchaseOrder.shippingAddress || '');

      // Transform line items with calculated totals
      const transformedLineItems = (purchaseOrder.lineItems || []).map(
        (item) => {
          const lineTotal = item.quantity * item.unitPrice;
          return {
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            discountRate: item.discountRate,
            discountType: item.discountType,
            discountCap: item.discountCap,
            productId: item.uuid, // Use uuid as productId
            total: lineTotal,
          };
        }
      );
      setLineItems(transformedLineItems);
    }
  }, [purchaseOrder]);

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = lineItems.reduce(
    (sum, item) => sum + (item.total * item.taxRate) / 100,
    0
  );
  const discountAmount = lineItems.reduce(
    (sum, item) => sum + (item.total * item.discountRate) / 100,
    0
  );
  const totalAmount = subtotal + taxAmount - discountAmount;

  // Toggle preview
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Handle panel layout changes
  const handleLayout = (sizes: number[]) => {
    if (sizes && sizes.length > 0) {
      setLeftPanelSize(sizes[0]);
      if (sizes[0] > 95 && showPreview) {
        setShowPreview(false);
      }
    }
  };

  const shouldShowPreviewButton = !showPreview || leftPanelSize > 95;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const invoiceData: VendorInvoiceData = {
      purchaseOrderId: purchaseOrder.purchaseOrder.uuid,
      invoiceDate: invoiceDate.toISOString(),
      dueDate: dueDate.toISOString(),
      totalAmount,
      currency,
      paymentMethod,
      paymentTerms,
      billingAddress,
      shippingAddress,
      notes,
      lineItems: lineItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        discountCap: item.discountCap,
        discountType: item.discountType,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        discountRate: item.discountRate,
        productId: item.productId,
      })),
    };

    createInvoiceMutation.mutate(
      {
        data: invoiceData,
        token,
        orgId,
        locationId,
      },
      {
        onSuccess: () => {
          toast.success('Invoice created successfully!');
          // Redirect to a success page or home page after a short delay
          setTimeout(() => {
            router.push('/vendor-portal/success');
          }, 1500);
        },
        onError: (error: any) => {
          toast.error(
            `Failed to create invoice: ${error.message || 'Unknown error'}`
          );
        },
      }
    );
  };

  return (
    <div className="max-h-[92.7vh] overflow-hidden relative">
      {/* Preview toggle button */}
      <div
        className={`absolute top-4 right-4 z-10 transition-opacity duration-300 ease-in-out ${
          shouldShowPreviewButton
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={togglePreview}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center"
        >
          <i
            className={`${
              showPreview ? 'ri-eye-off-line' : 'ri-eye-line'
            } mr-2`}
          ></i>
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      <div className="transition-all duration-300 ease-in-out">
        <ResizablePanelGroup direction="horizontal" onLayout={handleLayout}>
          <ResizablePanel
            minSize={50}
            defaultSize={showPreview ? 50 : 100}
            style={{ transition: 'flex-basis 300ms ease-in-out' }}
          >
            <div
              className={`${
                !showPreview ? 'pl-16' : 'pl-8'
              } py-8 pt-0 h-[92.7vh] overflow-y-auto flex justify-center`}
            >
              <div className="w-full max-w-4xl">
                {/* Header */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Create Vendor Invoice
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Purchase Order: {purchaseOrder.purchaseOrder.orderNumber}
                  </p>
                  <p className="text-gray-600">
                    Vendor: {purchaseOrder.vendor?.name || 'N/A'}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <Input
                        type="text"
                        name="currency"
                        value={currency}
                        onchange={(e: any) => setCurrency(e.target.value)}
                        placeholder="Currency"
                        disabled={true}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Invoice Date
                      </label>
                      <DateInput
                        name="invoiceDate"
                        value={invoiceDate}
                        onChange={(date) => date && setInvoiceDate(date)}
                        placeholder="Select invoice date"
                        disabled={true}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date
                      </label>
                      <DateInput
                        name="dueDate"
                        value={dueDate}
                        onChange={(date) => date && setDueDate(date)}
                        placeholder="Select due date"
                        disabled={true}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <Input
                        type="text"
                        name="paymentMethod"
                        value={paymentMethod}
                        onchange={(e: any) => setPaymentMethod(e.target.value)}
                        placeholder="Payment method"
                        disabled={true}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Terms
                      </label>
                      <Input
                        type="text"
                        name="paymentTerms"
                        value={paymentTerms}
                        onchange={(e: any) => setPaymentTerms(e.target.value)}
                        placeholder="Payment terms"
                        disabled={true}
                      />
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Billing Address
                      </label>
                      <TextArea
                        name="billingAddress"
                        value={billingAddress}
                        onchange={(e: any) => setBillingAddress(e.target.value)}
                        placeholder="Billing address"
                        disabled={true}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shipping Address
                      </label>
                      <TextArea
                        name="shippingAddress"
                        value={shippingAddress}
                        onchange={(e: any) =>
                          setShippingAddress(e.target.value)
                        }
                        placeholder="Shipping address"
                        disabled={false}
                      />
                    </div>
                  </div>

                  {/* Line Items Summary */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Line Items
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-3">
                        {lineItems.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                          >
                            <div>
                              <div className="font-medium">
                                {item.description}
                              </div>
                              <div className="text-sm text-gray-600">
                                Qty: {item.quantity} × {currency}{' '}
                                {item.unitPrice}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {currency} {item.total.toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-600">
                                Tax: {item.taxRate}% | Discount:{' '}
                                {item.discountRate}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>
                          {currency} {subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>
                          {currency} {taxAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>
                          {currency} {discountAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>
                          {currency} {totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <TextArea
                      name="notes"
                      value={notes}
                      onchange={(e: any) => setNotes(e.target.value)}
                      placeholder="Additional notes"
                      disabled={true}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="fixed bottom-0 left-0 right-0 p-2 bg-white border-t border-gray-200 flex justify-end space-x-3">
                    <Button
                      text={
                        createInvoiceMutation.isPending
                          ? 'Creating Invoice...'
                          : 'Create Invoice'
                      }
                      onClick={handleSubmit}
                      type="button"
                      disabled={createInvoiceMutation.isPending}
                    />
                  </div>
                </form>
              </div>
            </div>
          </ResizablePanel>

          {/* Preview Panel */}
          <ResizableHandle
            withHandle
            className={`transition-opacity duration-200 ease-in-out ${
              showPreview ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <ResizablePanel
            minSize={0}
            defaultSize={showPreview ? 50 : 0}
            style={{
              transition:
                'flex-basis 300ms ease-in-out, opacity 300ms ease-in-out',
              flexBasis: showPreview ? '50%' : '0%',
              opacity: showPreview ? 1 : 0,
            }}
          >
            <div className="h-[92.7vh] bg-[#F2F2F2] overflow-hidden">
              {showPreview && (
                <VendorInvoicePdfView
                  invoiceData={{
                    orderNumber: purchaseOrder.purchaseOrder.orderNumber,
                    invoiceDate,
                    dueDate,
                    currency,
                    paymentMethod,
                    paymentTerms,
                    billingAddress,
                    shippingAddress,
                    notes,
                    lineItems,
                    subtotal,
                    taxAmount,
                    discountAmount,
                    totalAmount,
                    vendor: purchaseOrder.vendor,
                  }}
                />
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default VendorInvoiceForm;
