import React, { useEffect, useState } from 'react';
import Slider from '@potta/components/slideover';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@potta/components/resizable';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import moment from 'moment';

interface LineItem {
  uuid: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  taxRate: number | null;
  taxAmount: number | null;
  discountRate: number | null;
  discountAmount: number | null;
  discountType: string;
  discountCap: number;
}

interface RiskEvaluationDetails {
  alerts: Array<{
    policy: string;
    actions: string[];
  }>;
  blocked: boolean;
  matches: Array<{
    policy: string;
    actions: Array<{
      type: string;
      params: any;
    }>;
    severity: string;
    ruleIndex: number;
  }>;
}

interface Invoice {
  uuid: string;
  invoiceId: string;
  invoiceNumber?: string | null;
  code?: string;
  issuedDate: string;
  dueDate: string;
  invoiceType: string;
  invoiceTotal: number;
  status: string;
  notes: string;
  currency: string;
  taxRate: number | null;
  taxAmount: number | null;
  paymentMethod: string;
  billingAddress: string;
  shippingAddress: string | null;
  paymentTerms: string | null;
  paymentReference: string | null;
  voucherCode?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  riskSeverity?: string;
  riskDecision?: string;
  riskEvaluatedAt?: string;
  riskEvaluationDetails?: RiskEvaluationDetails;
  lineItems: LineItem[];
  rfqId?: string | null;
  spendRequestId?: string | null;
  customer: {
    uuid: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    customerId: string;
    type: string;
    creditLimit: number;
    status: string;
  } | null;
}

interface InvoiceViewModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  invoice: Invoice | null;
}

const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
  open,
  setOpen,
  invoice,
}) => {
  const [isReady, setIsReady] = useState(false);

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

  if (!invoice) return null;

  // Simple Approval View Component (Right Panel)
  const ApprovalView = () => (
    <div className="w-full h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-2xl font-medium text-gray-900 mb-2">
          Invoice Details
        </h3>
        <p className="text-gray-600">Review invoice information</p>
      </div>

      <div className="space-y-6">
        {/* Current Status */}
        <div className="bg-white p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Current Status</h4>
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-3 py-1 text-sm font-medium ${
                invoice.status.toUpperCase() === 'ISSUED'
                  ? 'bg-yellow-100 text-yellow-800'
                  : invoice.status.toUpperCase() === 'PAID'
                  ? 'bg-green-100 text-green-800'
                  : invoice.status.toUpperCase() === 'OVERDUE'
                  ? 'bg-red-100 text-red-800'
                  : invoice.status.toUpperCase() === 'APPROVED'
                  ? 'bg-blue-100 text-blue-800'
                  : invoice.status.toUpperCase() === 'REJECTED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="bg-white p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Invoice Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Invoice Number:</span>
              <span className="font-medium">
                {invoice.invoiceNumber || invoice.invoiceId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">
                {invoice.customer
                  ? `${invoice.customer.firstName} ${invoice.customer.lastName}`
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer ID:</span>
              <span className="font-medium">
                {invoice.customer?.customerId || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">
                {invoice.currency} {invoice.invoiceTotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax Amount:</span>
              <span className="font-medium">
                {invoice.currency} {invoice.taxAmount?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Issue Date:</span>
              <span className="font-medium">
                {moment(invoice.issuedDate).format('MMM DD, YYYY')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Due Date:</span>
              <span className="font-medium">
                {moment(invoice.dueDate).format('MMM DD, YYYY')}
              </span>
            </div>
            {invoice.voucherCode && (
              <div className="flex justify-between">
                <span className="text-gray-600">Voucher Code:</span>
                <span className="font-medium text-green-600">
                  {invoice.voucherCode}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Type */}
        <div className="bg-white p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Invoice Type</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium">{invoice.invoiceType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium">
                {invoice.paymentMethod === 'BANK_TRANSFER'
                  ? 'Bank Transfer'
                  : invoice.paymentMethod === 'CASH'
                  ? 'Cash'
                  : invoice.paymentMethod === 'MOBILE_MONEY'
                  ? 'Mobile Money'
                  : invoice.paymentMethod || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Terms:</span>
              <span className="font-medium">{invoice.paymentTerms}</span>
            </div>
            {invoice.notes && (
              <div className="mt-3">
                <span className="text-gray-600">Notes:</span>
                <p className="text-sm mt-1 text-gray-800">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Risk Evaluation */}
        {invoice.riskSeverity && (
          <div className="bg-white p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">
              Risk Evaluation
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Risk Severity:</span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    invoice.riskSeverity === 'HIGH'
                      ? ' text-red-600'
                      : invoice.riskSeverity === 'MEDIUM'
                      ? ' text-yellow-600'
                      : ' text-green-600'
                  }`}
                >
                  {invoice.riskSeverity}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Risk Decision:</span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    invoice.riskDecision === 'BLOCK'
                      ? ' text-red-600'
                      : invoice.riskDecision === 'REVIEW'
                      ? ' text-yellow-600'
                      : invoice.riskDecision === 'APPROVED'
                      ? ' text-green-600'
                      : ' text-gray-600'
                  }`}
                >
                  {invoice.riskDecision}
                </span>
              </div>
              {invoice.riskEvaluatedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Evaluated At:</span>
                  <span className="text-sm font-medium">
                    {moment(invoice.riskEvaluatedAt).format(
                      'MMM DD, YYYY at h:mm A'
                    )}
                  </span>
                </div>
              )}
              {invoice.riskEvaluationDetails?.blocked && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200">
                  <p className="text-sm text-red-800 font-medium">
                    ⚠️ This invoice has been blocked due to risk evaluation
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Risk Alerts */}
        {invoice.riskEvaluationDetails?.alerts &&
          invoice.riskEvaluationDetails.alerts.length > 0 && (
            <div className="bg-white p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Risk Alerts</h4>
              <div className="space-y-2">
                {invoice.riskEvaluationDetails.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className="p-3 bg-yellow-50 border border-yellow-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-yellow-800">
                        {alert.policy}
                      </span>
                      <div className="flex space-x-1">
                        {alert.actions.map((action, actionIndex) => (
                          <span
                            key={actionIndex}
                            className="px-2 py-1 text-xs bg-yellow-200 text-yellow-800 "
                          >
                            {action}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Approval/Rejection Details */}
        {(invoice.approvedBy || invoice.rejectedBy) && (
          <div className="bg-white p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">
              Approval Details
            </h4>
            <div className="space-y-2">
              {invoice.approvedBy && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Approved
                    </p>
                    {invoice.approvedAt && (
                      <p className="text-xs text-gray-500">
                        {moment(invoice.approvedAt).format(
                          'MMM DD, YYYY at h:mm A'
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {invoice.rejectedBy && (
                <div className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Rejected</p>
                    {invoice.rejectedAt && (
                      <p className="text-xs text-gray-500">
                        {moment(invoice.rejectedAt).format(
                          'MMM DD, YYYY at h:mm A'
                        )}
                      </p>
                    )}
                    {invoice.rejectionReason && (
                      <p className="text-xs text-gray-600 mt-1">
                        Reason: {invoice.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Timeline */}
        <div className="bg-white p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Status Timeline</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Invoice Created
                </p>
                <p className="text-xs text-gray-500">
                  {moment(invoice.issuedDate).format('MMM DD, YYYY at h:mm A')}
                </p>
              </div>
            </div>
            {invoice.status.toUpperCase() === 'ISSUED' && (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Invoice Issued
                  </p>
                  <p className="text-xs text-gray-500">Pending approval</p>
                </div>
              </div>
            )}
            {invoice.status.toUpperCase() === 'APPROVED' && (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Invoice Approved
                  </p>
                  <p className="text-xs text-gray-500">Ready for payment</p>
                </div>
              </div>
            )}
            {invoice.status.toUpperCase() === 'PAID' && (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Payment Received
                  </p>
                  <p className="text-xs text-gray-500">Invoice completed</p>
                </div>
              </div>
            )}
            {invoice.status.toUpperCase() === 'OVERDUE' && (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Invoice Overdue
                  </p>
                  <p className="text-xs text-gray-500">
                    Due date: {moment(invoice.dueDate).format('MMM DD, YYYY')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Slider
      open={open}
      setOpen={setOpen}
      title="Invoice Review"
      edit={false}
      sliderClass="w-full"
      sliderContentClass="w-full h-full"
    >
      <div className="w-full h-full">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={50} minSize={50}>
            {/* Left Panel - Invoice PDF View */}
            <div className="w-full h-full bg-[#F2F2F2] overflow-y-auto">
              <div className="flex min-h-full flex-col items-center overflow-y-auto p-10 w-full scroll bg-[#F2F2F2] try">
                <div className=" flex-1 min-h-full bg-white space-y-8  min-w-[45rem] w-full mb-10">
                  <div className="h-36 w-full flex items-center justify-between px-8 bg-green-700">
                    <div>
                      <p className="text-3xl font-medium text-white">
                        {invoice.invoiceType}
                      </p>
                      <p className="text-white mt-2">
                        #{invoice.invoiceNumber || invoice.invoiceId}
                      </p>
                    </div>
                    <div className="text-right text-white">
                      <p>
                        <strong>Issue Date:</strong>{' '}
                        {moment(invoice.issuedDate).format('MMM DD, YYYY')}
                      </p>
                      <p>
                        <strong>Due Date:</strong>{' '}
                        {moment(invoice.dueDate).format('MMM DD, YYYY')}
                      </p>
                      <p>
                        <strong>Currency:</strong> {invoice.currency}
                      </p>
                    </div>
                  </div>
                  <div className="p-5 space-y-16 bg-white">
                    <div className="mt-5 w-full flex space-x-5">
                      <div className="flex w-[40%] space-x-2">
                        <h3 className="font-medium">From: </h3>
                        <div className="space-y-2 text-sm text-gray-600 flex-col">
                          <p>Instanvi Sarl</p>
                          <p>hello@instanvi.com</p>
                          <p>Douala, quatre etage, D'la Cameroon</p>
                          <p>+237 695904751</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <h3 className="font-medium">To: </h3>
                        <div className="space-y-2 text-sm text-gray-600 flex-col">
                          <p>
                            {invoice.customer
                              ? `${invoice.customer.firstName} ${invoice.customer.lastName}`
                              : 'Proforma Invoice'}
                          </p>
                          <p>{invoice.customer?.email || 'N/A'}</p>
                          <p>{invoice.billingAddress}</p>
                          <p>{invoice.customer?.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Line Items Table with Scrollable Rows */}
                    <div className="mt-10">
                      <div className="border border-gray-200  overflow-hidden">
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
                                  Discount
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
                              {invoice.lineItems &&
                              invoice.lineItems.length > 0 ? (
                                invoice.lineItems.map((item, index) => {
                                  const discountAmount =
                                    item.discountAmount || 0;
                                  const subtotal = item.totalAmount;
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
                                        {invoice.currency}{' '}
                                        {item.unitPrice.toLocaleString()}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                        {item.discountRate
                                          ? `${item.discountRate}% (${
                                              invoice.currency
                                            } ${discountAmount.toLocaleString()})`
                                          : '-'}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                        {invoice.currency}{' '}
                                        {taxAmount.toLocaleString()}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900 border-b font-medium">
                                        {invoice.currency}{' '}
                                        {total.toLocaleString()}
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td
                                    colSpan={7}
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
                            {invoice.paymentMethod === 'BANK_TRANSFER'
                              ? 'Bank Transfer'
                              : invoice.paymentMethod === 'CASH'
                              ? 'Cash'
                              : invoice.paymentMethod === 'MOBILE_MONEY'
                              ? 'Mobile Money'
                              : invoice.paymentMethod || 'Not specified'}
                          </p>
                          <p>
                            <strong>Payment Terms:</strong>{' '}
                            {invoice.paymentTerms}
                          </p>
                          {invoice.paymentReference && (
                            <p>
                              <strong>Payment Reference:</strong>{' '}
                              {invoice.paymentReference}
                            </p>
                          )}
                          {invoice.voucherCode && (
                            <p>
                              <strong>Voucher Code:</strong>{' '}
                              <span className="text-green-600 font-medium">
                                {invoice.voucherCode}
                              </span>
                            </p>
                          )}
                          {invoice.notes && (
                            <div className="mt-4">
                              <strong>Notes:</strong>
                              <p className="text-gray-600 mt-1">
                                {invoice.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-[50%]">
                        <div className="mt-4 flex justify-between">
                          <div className="w-1/2">Sub Total:</div>
                          <div className="w-1/2 text-right pr-20">
                            {invoice.currency}{' '}
                            {(
                              invoice.invoiceTotal - (invoice.taxAmount || 0)
                            ).toLocaleString()}
                          </div>
                        </div>
                        <div className="mt-2 flex justify-between">
                          <div className="w-1/2">
                            Tax ({invoice.taxRate || 0}%):
                          </div>
                          <div className="w-1/2 text-right pr-20">
                            {invoice.currency}{' '}
                            {(invoice.taxAmount || 0).toLocaleString()}
                          </div>
                        </div>
                        <hr className="my-4 border-t-2 border-gray-300" />
                        <div className="flex justify-between font-medium">
                          <div className="w-1/2">Total:</div>
                          <div className="w-1/2 text-right pr-20">
                            {invoice.currency}{' '}
                            {invoice.invoiceTotal.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={50}>
            <ApprovalView />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </Slider>
  );
};

export default InvoiceViewModal;
