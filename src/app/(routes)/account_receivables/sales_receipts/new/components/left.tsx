'use client'; // For Next.js 13+ App Directory
import Input from '@potta/components/input';
import SearchSelect from '@potta/components/search-select';
import { useContext, useState, useEffect, useRef } from 'react';
import DynamicTable from './newtableInvoice';
import { ContextData } from '@potta/components/providers/DataProvider';
import useGetAllCustomers from '@potta/app/(routes)/customers/hooks/useGetAllCustomers';
import SliderCustomer from '@potta/app/(routes)/customers/components/customerSlider';
import Select from '@potta/components/select';
import { DatePicker } from '@potta/components/ui/date-picker';
import { Customer } from '../../../../customers/utils/types';
import * as Yup from 'yup';
import { toast } from 'sonner'; // Assuming you have a toast library
import { useCreateSalesReceipt } from '../../hooks/useCreateReceipt';
import { SalesReceiptPayload } from '../../utils/validation';
import PaymentMethodSelect from '@potta/components/payment-method-select';
import {
  DocumentFormCard,
  DocumentFormFooter,
  DocumentFormShell,
  DocumentSectionTitle,
} from '@potta/components/document-form-layout';
import { FIELD_TEXTAREA } from '@/lib/field-styles';
import { useRouter } from 'next/navigation';
import { Button as ShadcnButton } from '@/components/shadcn/button';

// Define Option interface to match the one in SearchSelect component
interface Option {
  label: string;
  value: string | number;
}

// Add these interfaces at the top of your file with the other interfaces
interface TableItem {
  name: string;
  qty: number;
  price: number;
  tax: number;
  productId: string;
  uuid: string;
  id: number;
}

interface LineItemsDto {
  description: string;
  quantity: number;
  discountCap: number;
  discountType: 'FlatRate' | 'Percentage' | 'PercentageWithCap'; // Use literal types here
  unitPrice: number;
  taxRate: number;
  discountRate: number;
  productId: string;
}

// Add validation errors interface similar to invoice component
interface ValidationErrors {
  saleDate?: string;
  totalAmount?: string;
  paymentReference?: string;
  notes?: string;
  paymentMethod?: string;
  receiptNumber?: string;
  discountAmount?: string;
  customerId?: string;
  salePerson?: string;
  lineItems?: string;
}

// Define the SaleReceiptDto interface
interface SaleReceiptDto {
  saleDate: string;
  totalAmount: number;
  paymentReference?: string;
  notes?: string;
  paymentMethod: string;
  receiptNumber: string;
  discountAmount: number;
  customerId: string;
  salePerson: string;
  lineItems: LineItemsDto[];
}

const Left = () => {
  const router = useRouter();
  const context = useContext(ContextData);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const { data, isLoading: customersLoading } = useGetAllCustomers({
    page: 1,
    limit: 100,
  });
  const customers: Customer[] = data?.data || [];
  const [date, setDate] = useState('');
  const [invoice, setInvoice] = useState('Invoice');
  const [customerName, setCustomerName] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Option | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('0025');
  const [paymentReference, setPaymentReference] = useState(''); // Added payment reference state
  const [currency, setCurrency] = useState('USD');
  const [note, setNote] = useState('');
  const [isAddCustomerDrawer, setIsAddCustomerDrawer] = useState(false);

  // Using the same error approach as in the invoice component
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Use a ref to track if initial selection has been made
  const initialSelectionMade = useRef(false);

  // Create customer options with proper typing
  const customerOptions: Option[] = customers.map((customer: Customer) => ({
    label:
      customer.firstName ||
      customer.lastName ||
      `Customer ${customer.customerId || customer.uuid.slice(0, 8)}`,
    value: customer.uuid,
  }));

  // Set default customer only once when data first loads
  useEffect(() => {
    if (
      customers.length > 0 &&
      !customerName &&
      !initialSelectionMade.current &&
      !selectedCustomer
    ) {
      const firstCustomer = customers[0];
      const firstOption = {
        label:
          firstCustomer.firstName ||
          firstCustomer.lastName ||
          `Customer ${
            firstCustomer.customerId || firstCustomer.uuid.slice(0, 8)
          }`,
        value: firstCustomer.uuid,
      };

      initialSelectionMade.current = true;
      setCustomerName(firstCustomer.uuid);
      setSelectedCustomer(firstOption);
      // Update context data - update both customerName and customerId for consistency
      context?.setData((prevData: any) => ({
        ...prevData,
        customerName: firstCustomer.uuid,
        customerId: firstCustomer.uuid,
      }));
    }
  }, [customers, customerName, context, selectedCustomer]);

  // Monitor table data changes to clear line items error
  useEffect(() => {
    const tableData = context?.data?.table || [];
    if (tableData.length > 0 && errors.lineItems) {
      setErrors((prev) => ({ ...prev, lineItems: undefined }));
    }
  }, [context?.data?.table, errors.lineItems]);

  const handleInputChange = (key: string, value: any) => {
    // Clear error for this field if it exists
    if (errors[key as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }

    // Update local state
    switch (key) {
      case 'saleDate':
        setDate(value);
        break;
      case 'invoice':
        setInvoice(value);
        break;
      case 'invoiceNumber':
      case 'receiptNumber':
        setInvoiceNumber(value);
        break;
      case 'paymentReference':
        setPaymentReference(value);
        break;
      case 'customerId':
      case 'customerName':
        setCustomerName(value);
        break;
      case 'currency':
        setCurrency(value);
        break;
      case 'notes':
      case 'note':
        setNote(value);
        break;
      default:
        break;
    }
    // Update context data
    context?.setData((prevData: any) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handlePaymentMethodChange = (value: string) => {
    setSelectedPaymentMethod(value);

    if (errors.paymentMethod) {
      setErrors((prev) => ({ ...prev, paymentMethod: undefined }));
    }

    context?.setData((prevData: any) => ({
      ...prevData,
      payment_method: value,
      paymentMethod: value,
    }));
  };

  // Form validation function similar to invoice component
  const validateForm = () => {
    const newErrors: ValidationErrors = {};

    // Required field validation
    if (!date) newErrors.saleDate = 'Sale date is required';
    if (!customerName) newErrors.customerId = 'Customer is required';
    if (!selectedPaymentMethod)
      newErrors.paymentMethod = 'Payment method is required';
    if (!paymentReference)
      newErrors.paymentReference = 'Payment reference is required'; // Added payment reference validation

    // Check if there are line items
    const tableData = context?.data?.table || [];
    if (tableData.length === 0)
      newErrors.lineItems = 'At least one item is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutation = useCreateSalesReceipt();

  // In your Left component, update the handleSaveInvoice function

  const handleSaveInvoice = () => {
    setFormSubmitted(true);

    // Validate form
    const isValid = validateForm();
    if (!isValid) {
      // Scroll to the first error
      const firstErrorField = document.querySelector('.error-field');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Get table data from context with type annotation
    const tableData: TableItem[] = context?.data?.table || [];

    // Format line items according to LineItemsDto structure with proper typing
    const lineItems: LineItemsDto[] = tableData.map((item: TableItem) => ({
      description: item.name,
      quantity: item.qty,
      discountCap: 0,
      discountType: 'FlatRate', // Use the literal string without 'as const'
      unitPrice: Number(item.price),
      taxRate: item.tax,
      discountRate: 0,
      productId: item.uuid,
    }));

    // Calculate total amount with proper typing
    const totalAmount = tableData.reduce((sum: number, item: TableItem) => {
      const itemTotal = item.qty * item.price;
      const itemTax = (itemTotal * item.tax) / 100;
      return sum + itemTotal + itemTax;
    }, 0);

    // Backend recomputes totals; totalAmount is sent for client-side display parity.
    const saleReceiptData = {
      saleDate: date,
      totalAmount,
      paymentReference: paymentReference,
      notes: note,
      paymentMethod: selectedPaymentMethod,
      receiptNumber: invoiceNumber,
      discountAmount: 0,
      customerId: customerName,
      salePerson: '532e5da0-204f-4417-95e0-f26a13c62e39',
      lineItems: lineItems,
    } as SalesReceiptPayload;

    // Save to context
    context?.setData((prevData: any) => ({
      ...prevData,
      saleReceipt: saleReceiptData,
    }));

    // Call the mutation to create the sales receipt
    mutation.mutate(saleReceiptData, {
      onSuccess: () => {
        toast.success('Receipt created successfully');
        // You can add navigation or other actions here after successful creation
        // For example: router.push('/pos/sales');
      },
      onError: (error: any) => {
        toast.error(
          `Failed to create receipt: ${error.message || 'Unknown error'}`
        );
        console.error('Error creating sales receipt:', error);
      },
    });

    // Also log the raw data object if needed
    console.log('Raw Sale Receipt Data:', saleReceiptData);
  };

  const RequiredMark = () => <span className="ml-1 text-red-500">*</span>;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
      <DocumentFormShell className="w-full max-w-5xl pb-6">
        <DocumentFormCard flush>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="md:col-span-3">
              <Select
                label="Currency"
                options={[
                  { label: 'USD($)', value: 'USD' },
                  { label: 'EUR(€)', value: 'EUR' },
                  { label: 'XAF', value: 'XAF' },
                ]}
                selectedValue={currency}
                onChange={(value: any) => handleInputChange('currency', value)}
                bg=""
              />
            </div>
            <div className={`md:col-span-4 ${errors.saleDate ? 'error-field' : ''}`}>
              <DatePicker
                label="Sale date"
                required
                name="saleDate"
                value={date}
                onChange={(value) => handleInputChange('saleDate', value)}
                placeholder="Select sale date"
                error={errors.saleDate}
              />
            </div>
            <div className={`md:col-span-5 ${errors.receiptNumber ? 'error-field' : ''}`}>
              <Input
                type="text"
                label="Receipt number"
                name="receiptNumber"
                value={invoiceNumber}
                onchange={(e: any) =>
                  handleInputChange('receiptNumber', e.target.value)
                }
                errors={
                  errors.receiptNumber
                    ? { message: errors.receiptNumber }
                    : undefined
                }
              />
            </div>
          </div>
        </DocumentFormCard>

        <DocumentFormCard flush>
          <div className={`max-w-xl ${errors.customerId ? 'error-field' : ''}`}>
            <div className="flex items-end gap-2">
              <div className="min-w-0 flex-1">
                <SearchSelect
                  label={
                    <>
                      Customer
                      <RequiredMark />
                    </>
                  }
                  options={customerOptions}
                  value={selectedCustomer}
                  onChange={(option: Option | null) => {
                    setSelectedCustomer(option);
                    if (option) {
                      const customerId = option.value.toString();
                      setCustomerName(customerId);
                      context?.setData((prevData: any) => ({
                        ...prevData,
                        customerId,
                        customerName: customerId,
                      }));
                    } else {
                      setCustomerName('');
                      context?.setData((prevData: any) => ({
                        ...prevData,
                        customerId: '',
                        customerName: '',
                      }));
                    }
                  }}
                  isLoading={customersLoading}
                  placeholder="Select a customer..."
                  isClearable
                  isSearchable
                />
              </div>
              <button
                type="button"
                onClick={() => setIsAddCustomerDrawer(true)}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-[2px] bg-primary text-white hover:bg-brand-hover"
                aria-label="Add customer"
              >
                <i className="ri-add-line text-xl" />
              </button>
            </div>
            {errors.customerId ? (
              <p className="mt-1 text-sm text-red-500">{errors.customerId}</p>
            ) : null}
          </div>
        </DocumentFormCard>

        <DocumentFormCard flush>
          <DocumentSectionTitle>
            Product / service lines
            <RequiredMark />
          </DocumentSectionTitle>
          <DynamicTable />
          {errors.lineItems && (
            <p className="mt-2 text-sm text-red-500">{errors.lineItems}</p>
          )}
        </DocumentFormCard>

        <DocumentFormCard flush>
          <div className="space-y-4">
            <div className="space-y-4 rounded-[2px] border border-black/[0.08] bg-main-bg/40 p-4">
              <PaymentMethodSelect
                value={selectedPaymentMethod}
                onChange={handlePaymentMethodChange}
                error={errors.paymentMethod}
              />
              <div className={errors.paymentReference ? 'error-field' : ''}>
                <Input
                  type="text"
                  label={
                    <>
                      Payment reference
                      <RequiredMark />
                    </>
                  }
                  name="paymentReference"
                  value={paymentReference}
                  onchange={(e: any) =>
                    handleInputChange('paymentReference', e.target.value)
                  }
                  placeholder="Enter payment reference"
                  errors={
                    errors.paymentReference
                      ? { message: errors.paymentReference }
                      : undefined
                  }
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-normal text-foreground">
                Notes
              </label>
              <textarea
                value={note}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className={`${FIELD_TEXTAREA} min-h-28`}
                placeholder="Optional notes"
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-500">{errors.notes}</p>
              )}
            </div>
          </div>
        </DocumentFormCard>
      </DocumentFormShell>
      </div>

      <DocumentFormFooter
        left={
          <ShadcnButton
            type="button"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            onClick={() => router.push('/account_receivables/sales_receipts')}
          >
            Cancel
          </ShadcnButton>
        }
        right={
          <ShadcnButton
            type="button"
            className="bg-white text-foreground hover:bg-white/90"
            onClick={handleSaveInvoice}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Saving…' : 'Save receipt'}
          </ShadcnButton>
        }
      />

      <SliderCustomer
        open={isAddCustomerDrawer}
        setOpen={setIsAddCustomerDrawer}
      />
    </div>
  );
};

export default Left;
