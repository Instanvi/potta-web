import React from 'react';
import Slider from '@potta/components/slideover';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@potta/components/resizable';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  CreditCard,
  Calendar,
  DollarSign,
  Download,
  Mail,
  Printer,
} from 'lucide-react';
import Button from '@potta/components/button';

interface PaidInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: string;
  issueDate: string;
  dueDate: string;
  paidDate: string;
  type: string;
  description: string;
  paymentMethod?: string;
}

interface PaidInvoiceModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  invoice: PaidInvoice | null;
}

// Mock payment data for the receipt view
const createMockPaymentData = (invoice: PaidInvoice) => ({
  paymentId: `PAY-${invoice.invoiceNumber}`,
  transactionId: `TXN-${Date.now()}`,
  paymentDate: invoice.paidDate,
  paymentMethod: invoice.paymentMethod,
  amount: invoice.amount,
  currency: invoice.currency,
  customerName: invoice.customerName,
  customerEmail: invoice.customerEmail,
  invoiceNumber: invoice.invoiceNumber,
  description: invoice.description,
  fees: 0,
  netAmount: invoice.amount,
});

const PaidInvoiceModal: React.FC<PaidInvoiceModalProps> = ({
  open,
  setOpen,
  invoice,
}) => {
  if (!invoice) return null;

  // Create mock payment data
  const paymentData = createMockPaymentData(invoice);

  // Payment Receipt View Component (Left Panel)
  const ReceiptView = () => (
    <div className="w-full h-full bg-[#F2F2F2] overflow-y-auto">
      <div className="flex min-h-full flex-col items-center justify-center overflow-y-auto w-full scroll bg-[#F2F2F2]">
        <div className="flex min-w-[45rem] justify-between w-full p-8">
          <h3 className="text-xl font-medium">Payment Receipt</h3>
        </div>
        <div className="max-w-[48rem] bg-white space-y-8 min-w-[45rem] w-full mb-10">
          {/* Header */}
          <div className="h-36 w-full flex items-center justify-between px-8 bg-green-700">
            <div>
              <p className="text-3xl font-medium text-white">
                Payment Receipt
              </p>
              <p className="text-white mt-2">#{paymentData.paymentId}</p>
            </div>
            <div className="text-right text-white">
              <p>
                <strong>Payment Date:</strong>{' '}
                {new Date(paymentData.paymentDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Transaction ID:</strong> {paymentData.transactionId}
              </p>
              <p>
                <strong>Status:</strong> Completed
              </p>
            </div>
          </div>

          <div className="p-5 space-y-16 bg-white">
            {/* Payment Details */}
            <div className="mt-5 w-full flex space-x-5">
              <div className="flex w-[40%] space-x-2">
                <h3 className="font-medium">From: </h3>
                <div className="space-y-2 text-sm text-gray-600 flex-col">
                  <p>{paymentData.customerName}</p>
                  <p>{paymentData.customerEmail}</p>
                  <p>Customer Address</p>
                  <p>Customer Phone</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <h3 className="font-medium">To: </h3>
                <div className="space-y-2 text-sm text-gray-600 flex-col">
                  <p>Instanvi Sarl</p>
                  <p>hello@instanvi.com</p>
                  <p>Douala, quatre etage, D'la Cameroon</p>
                  <p>+237 695904751</p>
                </div>
              </div>
            </div>

            {/* Payment Method Details */}
            <div className="bg-gray-50 p-4 ">
              <h4 className="font-medium text-gray-900 mb-3">
                Payment Method
              </h4>
              <div className="flex items-center space-x-3">
                {paymentData.paymentMethod === 'mtn' && (
                  <img
                    src="/icons/mtn.svg"
                    alt="MTN Mobile Money"
                    className="w-8 h-8"
                  />
                )}
                {paymentData.paymentMethod === 'orange' && (
                  <img
                    src="/icons/om.svg"
                    alt="Orange Money"
                    className="w-8 h-8"
                  />
                )}
                <div>
                  <p className="font-medium">
                    {paymentData.paymentMethod === 'mtn'
                      ? 'MTN Mobile Money'
                      : paymentData.paymentMethod === 'orange'
                      ? 'Orange Money'
                      : paymentData.paymentMethod}
                  </p>
                  <p className="text-sm text-gray-600">
                    Transaction ID: {paymentData.transactionId}
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-gray-50 p-4 ">
              <h4 className="font-medium text-gray-900 mb-3">
                Invoice Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice Number:</span>
                  <span className="font-medium">
                    {paymentData.invoiceNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-medium">{paymentData.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Issue Date:</span>
                  <span className="font-medium">
                    {new Date(invoice.issueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-gray-50 p-4 ">
              <h4 className="font-medium text-gray-900 mb-3">
                Payment Summary
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice Amount:</span>
                  <span className="font-medium">
                    {paymentData.currency} {paymentData.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Fees:</span>
                  <span className="font-medium">
                    {paymentData.currency} {paymentData.fees.toFixed(2)}
                  </span>
                </div>
                <hr className="my-2 border-gray-300" />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total Paid:</span>
                  <span className="text-green-600">
                    {paymentData.currency} {paymentData.netAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Confirmation */}
            <div className="bg-green-50 p-4  border border-green-200">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-900">
                    Payment Confirmed
                  </h4>
                  <p className="text-sm text-green-700">
                    Your payment has been successfully processed and confirmed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Payment Details View Component (Right Panel)
  const PaymentDetailsView = () => (
    <div className="w-full h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-2xl font-medium text-gray-900 mb-2">
          Payment Details
        </h3>
        <p className="text-gray-600">Complete payment information and status</p>
      </div>

      <div className="space-y-6">
        {/* Payment Status */}
        <div className="bg-white p-4 ">
          <h4 className="font-medium text-gray-900 mb-3">Payment Status</h4>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
              Completed
            </span>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white p-4 ">
          <h4 className="font-medium text-gray-900 mb-3">
            Payment Information
          </h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Payment ID</p>
                <p className="text-xs text-gray-500">{paymentData.paymentId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Transaction ID
                </p>
                <p className="text-xs text-gray-500">
                  {paymentData.transactionId}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Payment Date
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(paymentData.paymentDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Amount Paid</p>
                <p className="text-xs text-gray-500">
                  {paymentData.currency} {paymentData.netAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white p-4 ">
          <h4 className="font-medium text-gray-900 mb-3">
            Customer Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{paymentData.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{paymentData.customerEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Invoice:</span>
              <span className="font-medium">{paymentData.invoiceNumber}</span>
            </div>
          </div>
        </div>

        {/* Payment Timeline */}
        <div className="bg-white p-4 ">
          <h4 className="font-medium text-gray-900 mb-3">Payment Timeline</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Invoice Created
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(invoice.issueDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Payment Initiated
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(paymentData.paymentDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Payment Confirmed
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(paymentData.paymentDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Receipt Generated
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(paymentData.paymentDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white p-4 ">
          <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
          <div className="space-y-2">
            <Button
              text="Download Receipt (PDF)"
              type="button"
              icon={<Download className="w-4 h-4" />}
            />
            <Button
              text="Send Receipt via Email"
              type="button"
              icon={<Mail className="w-4 h-4" />}
            />
            <Button
              text="Print Receipt"
              type="button"
              icon={<Printer className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Slider
      open={open}
      setOpen={setOpen}
      title="Payment Receipt"
      edit={false}
      sliderClass="w-full"
      sliderContentClass="w-full h-full"
    >
      <div className="w-full h-full">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={70} minSize={50}>
            <ReceiptView />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={30} minSize={50}>
            <PaymentDetailsView />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </Slider>
  );
};

export default PaidInvoiceModal;
