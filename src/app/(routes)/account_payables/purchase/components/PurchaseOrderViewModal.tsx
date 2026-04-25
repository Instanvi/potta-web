import React, { useEffect, useState } from 'react';
import Slider from '@potta/components/slideover';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@potta/components/resizable';
import { XCircle } from 'lucide-react';
import moment from 'moment';
import useGetPurchaseOrderDetails from '../hooks/useGetPurchaseOrderDetails';
import PurchaseOrderDetailsView from './PurchaseOrderDetailsView';
import PurchaseOrderTimelineView from './PurchaseOrderTimelineView';

interface Comment {
  id: string;
  text: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  replies?: Comment[];
  mentions?: string[];
}

interface PurchaseOrderViewModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  purchaseOrderId: string | null;
}

const PurchaseOrderViewModal: React.FC<PurchaseOrderViewModalProps> = ({
  open,
  setOpen,
  purchaseOrderId,
}) => {
  const [isReady, setIsReady] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

  // Fetch purchase order details
  const {
    data: purchaseOrderDetails,
    isLoading,
    error,
  } = useGetPurchaseOrderDetails({
    purchaseOrderId: purchaseOrderId || '',
    enabled: open && !!purchaseOrderId,
  });

  // Ensure proper state initialization for animation
  useEffect(() => {
    if (open) {
      // Small delay to ensure proper animation
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setIsReady(false);
    }
  }, [open]);

  if (!purchaseOrderId) return null;

  // Define tabs for the purchase order view
  const tabs = [
    {
      id: 'details',
      label: 'Details',
      content: (
        <div className="w-full h-full">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={50}>
              {/* Left Panel - Purchase Order PDF View */}
              <div className="w-full h-full bg-[#F2F2F2] overflow-y-auto">
                <div className="flex min-h-full flex-col items-center justify-center overflow-y-auto w-full scroll bg-[#F2F2F2]">
                  {isLoading && (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-gray-500">
                        Loading purchase order...
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-8">
                      <div className="flex items-center">
                        <XCircle className="h-5 w-5 text-red-400 mr-2" />
                        <span className="text-red-800">
                          Error:{' '}
                          {error instanceof Error
                            ? error.message
                            : 'Unknown error'}
                        </span>
                      </div>
                    </div>
                  )}
                  {purchaseOrderDetails && (
                    <div className="max-w-[48rem] bg-white space-y-8 min-w-[45rem] w-full mb-10">
                      <div className="h-36 w-full flex items-center justify-between px-8 bg-green-800">
                        <div>
                          <p className="text-3xl font-medium text-white">
                            Purchase Order
                          </p>
                          <p className="text-white mt-2">
                            #{purchaseOrderDetails.orderNumber}
                          </p>
                        </div>
                        <div className="text-right text-white">
                          <p>
                            <strong>Order Date:</strong>{' '}
                            {moment(purchaseOrderDetails.orderDate).format(
                              'MMM DD, YYYY'
                            )}
                          </p>
                          <p>
                            <strong>Required Date:</strong>{' '}
                            {moment(purchaseOrderDetails.requiredDate).format(
                              'MMM DD, YYYY'
                            )}
                          </p>
                          <p>
                            <strong>Status:</strong>{' '}
                            {purchaseOrderDetails.status}
                          </p>
                        </div>
                      </div>
                      <div className="p-5 space-y-16 bg-white">
                        <div className="mt-5 w-full flex space-x-5">
                          <div className="flex w-[40%] space-x-2">
                            <h3 className="font-medium">Vendor: </h3>
                            <div className="space-y-2 text-sm text-gray-600 flex-col">
                              <p>{purchaseOrderDetails.salePerson.name}</p>
                              <p>{purchaseOrderDetails.salePerson.email}</p>
                              <p>
                                {
                                  purchaseOrderDetails.salePerson.address
                                    .address
                                }
                              </p>
                              <p>{purchaseOrderDetails.salePerson.phone}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <h3 className="font-medium">Ship To: </h3>
                            <div className="space-y-2 text-sm text-gray-600 flex-col">
                              <p>Company Name</p>
                              <p>company@email.com</p>
                              <p>{purchaseOrderDetails.shippingAddress}</p>
                              <p>+1234567890</p>
                            </div>
                          </div>
                        </div>

                        {/* Line Items Table with Scrollable Rows */}
                        <div className="mt-10">
                          <div className="border border-gray-200 overflow-hidden rounded-lg">
                            <div className="max-h-96 overflow-y-auto">
                              <table className="min-w-full">
                                <thead className="bg-gray-50 sticky top-0">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                      #
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                      Description
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                      Qty
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                      Unit Price
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                      Tax
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                      Total
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y whitespace-nowrap divide-gray-200">
                                  {purchaseOrderDetails.lineItems &&
                                  purchaseOrderDetails.lineItems.length > 0 ? (
                                    purchaseOrderDetails.lineItems.map(
                                      (item, index) => {
                                        const subtotal =
                                          item.quantity * item.unitPrice;
                                        const taxAmount = item.taxAmount || 0;
                                        const total = subtotal + taxAmount;

                                        return (
                                          <tr
                                            key={item.uuid}
                                            className="hover:bg-gray-50"
                                          >
                                            <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                              {index + 1}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 border-b max-w-xs">
                                              <div
                                                className="truncate"
                                                title={item.description}
                                              >
                                                {item.description}
                                              </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                              {item.quantity}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                              XAF{' '}
                                              {item.unitPrice.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                              XAF {taxAmount.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 border-b font-medium">
                                              XAF {total.toLocaleString()}
                                            </td>
                                          </tr>
                                        );
                                      }
                                    )
                                  ) : (
                                    <tr>
                                      <td
                                        colSpan={6}
                                        className="px-4 py-8 text-center text-gray-500"
                                      >
                                        No line items found
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                        <div className="w-full mt-10 pb-4 flex">
                          <div className="w-[50%]">
                            <div className="pl-4">
                              <p>
                                <strong>Payment Method:</strong>{' '}
                                {purchaseOrderDetails.paymentMethod ===
                                'BANK_TRANSFER'
                                  ? 'Bank Transfer'
                                  : purchaseOrderDetails.paymentMethod ===
                                    'CASH'
                                  ? 'Cash'
                                  : purchaseOrderDetails.paymentMethod ===
                                    'MOBILE_MONEY'
                                  ? 'Mobile Money'
                                  : purchaseOrderDetails.paymentMethod ||
                                    'Not specified'}
                              </p>
                              <p>
                                <strong>Payment Terms:</strong>{' '}
                                {purchaseOrderDetails.paymentTerms}
                              </p>
                              {purchaseOrderDetails.notes && (
                                <div className="mt-4">
                                  <strong>Notes:</strong>
                                  <p className="text-gray-600 mt-1">
                                    {purchaseOrderDetails.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="w-[50%]">
                            <div className="mt-4 flex justify-between">
                              <div className="w-1/2">Sub Total:</div>
                              <div className="w-1/2 text-right pr-20">
                                XAF{' '}
                                {(
                                  Number(purchaseOrderDetails.orderTotal) -
                                  (purchaseOrderDetails.lineItems.reduce(
                                    (sum, item) => sum + (item.taxAmount || 0),
                                    0
                                  ) || 0)
                                ).toLocaleString()}
                              </div>
                            </div>
                            <div className="mt-2 flex justify-between">
                              <div className="w-1/2">Tax:</div>
                              <div className="w-1/2 text-right pr-20">
                                XAF{' '}
                                {purchaseOrderDetails.lineItems
                                  .reduce(
                                    (sum, item) => sum + (item.taxAmount || 0),
                                    0
                                  )
                                  .toLocaleString()}
                              </div>
                            </div>
                            <hr className="my-4 border-t-2 border-gray-300" />
                            <div className="flex justify-between font-medium">
                              <div className="w-1/2">Total:</div>
                              <div className="w-1/2 text-right pr-20">
                                XAF{' '}
                                {Number(
                                  purchaseOrderDetails.orderTotal
                                ).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={50}>
              <PurchaseOrderDetailsView
                purchaseOrderDetails={purchaseOrderDetails}
                isLoading={isLoading}
                error={error}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      ),
    },
    {
      id: 'timeline',
      label: 'Timeline',
      content: (
        <PurchaseOrderTimelineView
          comments={comments}
          setComments={setComments}
        />
      ),
    },
  ];

  return (
    <Slider
      open={open}
      setOpen={setOpen}
      title="Purchase Order Review"
      edit={false}
      tabs={tabs}
      defaultTab="details"
      sliderClass="w-full"
      sliderContentClass="w-full h-full"
    >
      {/* Fallback content if no tabs are provided */}
      <div className="w-full h-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">No content available</div>
        </div>
      </div>
    </Slider>
  );
};

export default PurchaseOrderViewModal;
