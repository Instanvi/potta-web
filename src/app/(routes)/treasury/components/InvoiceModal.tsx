import React from 'react';
import Slider from '@potta/components/slideover';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@potta/components/resizable';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';

interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: string;
  issueDate: string;
  dueDate: string;
  type: string;
  description: string;
  paymentMethod?: string;
}

interface InvoiceModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  invoice: CustomerInvoice | null;
}

// Mock invoice data for PdfView (you'll need to adapt this to match your actual data structure)
const createMockInvoiceData = (invoice: CustomerInvoice) => ({
  invoiceType: invoice.type,
  invoiceNumber: invoice.invoiceNumber,
  issueDate: invoice.issueDate,
  dueDate: invoice.dueDate,
  currency: invoice.currency,
  customerName: invoice.customerName,
  billing: invoice.customerEmail,
  shipping: '',
  paymentTerms: 'Net 30',
  paymentReference: '',
  taxRate: 0,
  payment_method: [invoice.paymentMethod || 'Cash'],
  note: invoice.description,
  table: [
    {
      name: invoice.description,
      qty: 1,
      price: invoice.amount,
      tax: 0,
      productId: '1',
      uuid: '1',
      id: 1,
    },
  ],
});

const InvoiceModal: React.FC<InvoiceModalProps> = ({
  open,
  setOpen,
  invoice,
}) => {
  if (!invoice) return null;

  // Create mock data for PdfView
  const mockData = createMockInvoiceData(invoice);

  // Simple Approval View Component (Right Panel)
  const ApprovalView = () => (
    <div className="w-full h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-2xl font-medium text-gray-900 mb-2">
          Invoice Approval
        </h3>
        <p className="text-gray-600">Review and approve this invoice</p>
      </div>

      <div className="space-y-6">
        {/* Current Status */}
        <div className="bg-white p-4 ">
          <h4 className="font-medium text-gray-900 mb-3">Current Status</h4>
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-3 py-1 text-sm font-medium ${
                invoice.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : invoice.status === 'paid'
                  ? 'bg-green-100 text-green-800'
                  : invoice.status === 'overdue'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="bg-white p-4 ">
          <h4 className="font-medium text-gray-900 mb-3">Invoice Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Invoice Number:</span>
              <span className="font-medium">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">{invoice.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: invoice.currency,
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(invoice.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium">
                {invoice.paymentMethod === 'mtn'
                  ? 'MTN Mobile Money'
                  : invoice.paymentMethod === 'orange'
                  ? 'Orange Money'
                  : invoice.paymentMethod || 'Not specified'}
              </span>
            </div>
          </div>
        </div>

        {/* Approval Status */}
        <div className="bg-white p-4 ">
          <h4 className="font-medium text-gray-900 mb-3">Approval Status</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  John Manager
                </p>
                <p className="text-xs text-gray-500">Finance Manager</p>
              </div>
              <Clock className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Sarah Director
                </p>
                <p className="text-xs text-gray-500">Operations Director</p>
              </div>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Mike CEO</p>
                <p className="text-xs text-gray-500">Chief Executive Officer</p>
              </div>
              <Clock className="w-4 h-4 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Approval Timeline */}
        <div className="bg-white p-4 ">
          <h4 className="font-medium text-gray-900 mb-3">
            Approval Timeline
          </h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Invoice Created
                </p>
                <p className="text-xs text-gray-500">
                  Jan 15, 2024 at 10:30 AM
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Operations Director Approved
                </p>
                <p className="text-xs text-gray-500">Jan 16, 2024 at 2:15 PM</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Pending CEO Approval
                </p>
                <p className="text-xs text-gray-500">Awaiting review</p>
              </div>
            </div>
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
              {/* We'll need to create a custom PdfView component that accepts data as props */}
              <div className="flex min-h-full flex-col items-center justify-center overflow-y-auto w-full scroll bg-[#F2F2F2]">
                <div className="flex min-w-[45rem] justify-between w-full p-8">
                  <h3 className="text-xl font-medium">Invoice Preview</h3>
                </div>
                <div className="max-w-[48rem] bg-white space-y-8 min-w-[45rem] w-full mb-10">
                  <div className="h-36 w-full flex items-center justify-between px-8 bg-green-700">
                    <div>
                      <p className="text-3xl font-medium text-white">
                        {mockData.invoiceType}
                      </p>
                      <p className="text-white mt-2">
                        #{mockData.invoiceNumber}
                      </p>
                    </div>
                    <div className="text-right text-white">
                      <p>
                        <strong>Issue Date:</strong>{' '}
                        {new Date(mockData.issueDate).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Due Date:</strong>{' '}
                        {new Date(mockData.dueDate).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Currency:</strong> {mockData.currency}
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
                          <p>{invoice.customerName}</p>
                          <p>{invoice.customerEmail}</p>
                          <p>Customer Address</p>
                          <p>Customer Phone</p>
                        </div>
                      </div>
                    </div>

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
                        {mockData.table.map((item: any, index: number) => {
                          const price = Number(item.price);
                          const qty = Number(item.qty);
                          const tax = Number(item.tax);
                          const itemTotal = price * qty;
                          const itemTax = (itemTotal * tax) / 100;
                          const totalWithTax = itemTotal + itemTax;

                          return (
                            <tr key={item.id || index}>
                              <td className="border-b px-4 py-2">
                                {index + 1}
                              </td>
                              <td className="border-b px-4 py-2">
                                {item.name}
                              </td>
                              <td className="border-b px-4 py-2">{qty}</td>
                              <td className="border-b px-4 py-2">
                                {invoice.currency} {price.toFixed(2)}
                              </td>
                              <td className="border-b px-4 py-2">
                                {invoice.currency} {itemTax.toFixed(2)}
                              </td>
                              <td className="border-b px-4 py-2">
                                {invoice.currency} {totalWithTax.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    <div className="w-full mt-10 pb-4 flex">
                      <div className="w-[50%]">
                        <div className="pl-4">
                          <p>
                            <strong>Payment Method:</strong>{' '}
                            {invoice.paymentMethod === 'mtn'
                              ? 'MTN Mobile Money'
                              : invoice.paymentMethod === 'orange'
                              ? 'Orange Money'
                              : invoice.paymentMethod || 'Not selected'}
                          </p>
                          {mockData.note && (
                            <div className="mt-4">
                              <strong>Notes:</strong>
                              <p className="text-gray-600 mt-1">
                                {mockData.note}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-[50%]">
                        <div className="mt-4 flex justify-between">
                          <div className="w-1/2">Sub Total:</div>
                          <div className="w-1/2 text-right pr-20">
                            {invoice.currency} {invoice.amount.toFixed(2)}
                          </div>
                        </div>
                        <div className="mt-2 flex justify-between">
                          <div className="w-1/2">Tax (0%):</div>
                          <div className="w-1/2 text-right pr-20">
                            {invoice.currency} 0.00
                          </div>
                        </div>
                        <hr className="my-4 border-t-2 border-gray-300" />
                        <div className="flex justify-between font-medium">
                          <div className="w-1/2">Total:</div>
                          <div className="w-1/2 text-right pr-20">
                            {invoice.currency} {invoice.amount.toFixed(2)}
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

export default InvoiceModal;
