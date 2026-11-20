'use client';
import React, { useState, useEffect } from 'react';
import { useCreateProformaInvoice } from '../hooks';
import {
  RFQData,
  RFQLineItem,
  ProformaInvoiceLineItem,
  RFQTokenData,
} from '../types';
import toast from 'react-hot-toast';
import PottaLoader from '@potta/components/pottaloader';
import Input from '@potta/components/input';
import Button from '@potta/components/button';

interface RFQProformaFormProps {
  tokenData: RFQTokenData;
  rfqData: RFQData;
  onSuccess?: () => void;
}

interface LineItemWithPrice extends RFQLineItem {
  unitPrice: number;
  totalAmount: number;
}

const RFQProformaForm: React.FC<RFQProformaFormProps> = ({
  tokenData,
  rfqData,
  onSuccess,
}) => {
  const [lineItems, setLineItems] = useState<LineItemWithPrice[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Initialize line items with RFQ data
  useEffect(() => {
    if (rfqData.items && rfqData.items.length > 0) {
      const initializedItems: LineItemWithPrice[] = rfqData.items.map(
        (item) => {
          // Parse unitPrice if it exists (could be string or number)
          const unitPrice = item.unitPrice
            ? typeof item.unitPrice === 'string'
              ? parseFloat(item.unitPrice)
              : item.unitPrice
            : 0;

          // Calculate total if unitPrice exists, otherwise 0
          const totalAmount = unitPrice > 0 ? item.quantity * unitPrice : 0;

          return {
            ...item,
            unitPrice,
            totalAmount,
          };
        }
      );
      setLineItems(initializedItems);
    }
  }, [rfqData.items]);

  const { mutate: createProforma, isPending } = useCreateProformaInvoice({
    rfqId: tokenData.rfqId,
    token: tokenData.token,
    vendorId: tokenData.vendorId,
    onSuccess: (data) => {
      toast.success('Proforma invoice submitted successfully!');
      setSubmitted(true);
      onSuccess?.();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        'Failed to submit proforma invoice. Please try again.';
      toast.error(errorMessage);
    },
  });

  // Handle price change
  const handlePriceChange = (index: number, unitPrice: number) => {
    const updatedItems = [...lineItems];
    const item = updatedItems[index];
    item.unitPrice = unitPrice;
    item.totalAmount = item.quantity * unitPrice;
    setLineItems(updatedItems);
  };

  // Calculate total amount
  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.totalAmount, 0);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that all prices are filled
    const hasEmptyPrices = lineItems.some((item) => item.unitPrice <= 0);
    if (hasEmptyPrices) {
      toast.error('Please fill in all unit prices before submitting.');
      return;
    }

    // Prepare proforma invoice data
    const proformaData: ProformaInvoiceLineItem[] = lineItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalAmount: item.totalAmount,
      specifications: item.specifications,
      category: item.category,
    }));

    // Submit proforma invoice
    createProforma({
      vendorId: tokenData.vendorId,
      lineItems: proformaData,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 max-w-md w-full text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-medium text-gray-800 mb-2">
            Proforma Invoice Submitted!
          </h1>
          <p className="text-gray-600 mb-6">
            Your proforma invoice has been successfully submitted. We will
            review it and get back to you soon.
          </p>
          <div className="bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              Total Amount:{' '}
              <span className="font-medium text-lg text-gray-800">
                XAF {calculateTotal().toFixed(2)}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-medium text-gray-800 mb-2">
                Request for Quotation
              </h1>
              <p className="text-gray-600">RFQ #{rfqData.rfqNumber}</p>
              <p className="text-sm text-gray-500 mt-1">{rfqData.title}</p>
            </div>
            {rfqData.deadline && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Deadline</p>
                <p className="font-medium text-gray-800">
                  {new Date(rfqData.deadline).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {rfqData.description && (
            <div className="mt-4 pt-4">
              <p className="text-gray-700">{rfqData.description}</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        {rfqData.instructions && (
          <div className="bg-white p-6 mb-6">
            <h2 className="text-xl font-medium text-gray-800 mb-4">
              Instructions
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {rfqData.instructions}
            </p>
          </div>
        )}

        {/* Pricing Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white p-6 mb-6">
            <h2 className="text-xl font-medium text-gray-800 mb-4">
              Pricing Information
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Please enter your unit prices for each item below. Total amounts
              will be calculated automatically.
              {lineItems.some(
                (item) => item.unitPrice && item.unitPrice > 0
              ) && (
                <span className="block mt-2 text-blue-600">
                  Note: Some items have suggested prices pre-filled. You may
                  adjust them as needed.
                </span>
              )}
            </p>

            {lineItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No items found in this RFQ.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Item
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Specifications
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                        Unit Price (XAF)
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                        Total Amount (XAF)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, index) => (
                      <tr key={item.uuid} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.description}
                            </p>
                            {item.category && (
                              <span className="text-xs text-gray-500">
                                {item.category}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-600">
                            {item.specifications || '-'}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-medium text-gray-800">
                            {item.quantity} {item.unit}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Input
                            type="number"
                            name={`unitPrice-${index}`}
                            value={item.unitPrice || ''}
                            onchange={(e) =>
                              handlePriceChange(
                                index,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="0.00"
                            required
                            min={0}
                            inputClass="text-right"
                          />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="font-medium text-gray-800">
                            XAF {item.totalAmount.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td
                        colSpan={4}
                        className="px-4 py-4 text-right font-medium text-gray-800"
                      >
                        Total Amount:
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-xl font-medium text-green-600">
                          XAF {calculateTotal().toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Terms */}
          {rfqData.terms &&
            (rfqData.terms.paymentTerms || rfqData.terms.warrantyTerms) && (
              <div className="bg-white p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Terms & Conditions
                </h3>
                <div className="space-y-3">
                  {rfqData.terms.paymentTerms && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Payment Terms:
                      </p>
                      <p className="text-gray-600">
                        {rfqData.terms.paymentTerms}
                      </p>
                    </div>
                  )}
                  {rfqData.terms.warrantyTerms && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Warranty Terms:
                      </p>
                      <p className="text-gray-600">
                        {rfqData.terms.warrantyTerms}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Submit Button */}
          <div className="bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  By submitting this proforma invoice, you agree to provide the
                  items at the quoted prices.
                </p>
              </div>
              <Button
                text={isPending ? 'Submitting...' : 'Submit Proforma Invoice'}
                type="submit"
                disabled={isPending}
                icon={isPending ? <PottaLoader size="sm" /> : undefined}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RFQProformaForm;
