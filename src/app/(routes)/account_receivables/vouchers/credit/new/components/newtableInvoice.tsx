import { useContext, useState } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';
import SearchSelect, { Option } from '@potta/components/search-select';
// You'll need to create this hook
import Input from '@potta/components/input';
import useGetAllInvoices from '../hooks/useGetAllInvoices';

interface Invoice {
  uuid: string;
  invoiceNumber: string;
  invoiceTotal: number;
  dueDate: string;
  id: string;
}

// Function to get currency symbol based on currency code
const getCurrencySymbol = (currencyCode: string): string => {
  switch (currencyCode) {
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'XAF':
      return 'XAF';
    default:
      return currencyCode;
  }
};

export default function CreditNoteForm() {
  const context = useContext(ContextData);
  const [selectedInvoice, setSelectedInvoice] = useState<Option | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [reason, setReason] = useState<string>('');

  // Get currency from context
  const currency = context?.data?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);

  // Fetch invoices - You'll need to implement this hook
  const { data: invoicesData, isLoading: invoicesLoading } = useGetAllInvoices({
    page: 1,
    limit: 100,
    customerId: context?.data?.customerName || '',
  });

  const invoices: Invoice[] = invoicesData?.data || [];

  // Create invoice options
  const invoiceOptions: Option[] = invoices.map((invoice) => ({
    label: `Invoice #${invoice.invoiceNumber} (${currencySymbol}${invoice.invoiceTotal})`,
    value: invoice.uuid,
  }));

  // Handle invoice selection
  const handleInvoiceSelect = (value: Option | null) => {
    setSelectedInvoice(value);

    if (value) {
      const invoice = invoices.find((inv) => inv.uuid === value.value);
      if (invoice) {
        // Set default credit amount to invoice total amount
        setCreditAmount(invoice.invoiceTotal);

        // Update context with invoice ID
        context?.setData((prevData: any) => ({
          ...prevData,
          invoiceId: value.value,
          creditAmount: invoice.invoiceTotal,
        }));
      }
    } else {
      setCreditAmount(0);

      // Clear invoice ID from context
      context?.setData((prevData: any) => ({
        ...prevData,
        invoiceId: '',
        creditAmount: 0,
      }));
    }
  };

  // Update credit amount in context
  const handleCreditAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseFloat(e.target.value);
    setCreditAmount(isNaN(amount) ? 0 : amount);

    context?.setData((prevData: any) => ({
      ...prevData,
      creditAmount: isNaN(amount) ? 0 : amount,
    }));
  };

  // Update reason in context
  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReason(e.target.value);

    context?.setData((prevData: any) => ({
      ...prevData,
      reason: e.target.value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-md p-5 shadow-sm">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Invoice to Credit
          </label>
          <SearchSelect
            options={invoiceOptions}
            value={selectedInvoice}
            onChange={handleInvoiceSelect}
            isLoading={invoicesLoading}
            placeholder="Search for an invoice..."
            isClearable={true}
            isSearchable={true}
          />
          <p className="text-sm text-gray-500 mt-1">
            Select the invoice you want to create a credit note for
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credit Amount ({currencySymbol})
            </label>
            <input
              type="number"
              value={creditAmount}
              onChange={handleCreditAmountChange}
              className="w-full py-2.5 px-4 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
   "
              placeholder="Enter credit amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Credit
            </label>
            <input
              type="text"
              value={reason}
              onChange={handleReasonChange}
              className="w-full py-2.5 px-4 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
   "
              placeholder="e.g., Refund, Return, Overpayment"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
