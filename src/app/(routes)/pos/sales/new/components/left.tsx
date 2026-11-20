'use client'; // For Next.js 13+ App Directory
import Input from '@potta/components/input';
import SearchSelect from '@potta/components/search-select';
import { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DynamicTable from './newtableInvoice';
import Button from '@potta/components/button';
import { ContextData } from '@potta/components/providers/DataProvider';
import useGetAllCustomers from '@potta/app/(routes)/customers/hooks/useGetAllCustomers';
import SliderCustomer from '@potta/app/(routes)/customers/components/customerSlider';
import Select from '@potta/components/select';
import { Customer } from '../../../../customers/utils/types';
import { toast } from 'sonner';
import { DatePicker } from '@potta/components/ui/date-picker';
import { useCreateSalesReceipt } from '../../hooks/useCreateReceipt';
import { SalesReceiptPayload } from '../../../utils/validation';
import {
  apiErrorMessage,
  buildSalePayload,
  productToLine,
  type PaymentMethod,
  type SaleLineItem,
} from '../../../utils/sale';
import PaymentMethodSelect from '@potta/components/payment-method-select';
import {
  DocumentFormCard,
  DocumentFormShell,
  DocumentSectionTitle,
} from '@potta/components/document-form-layout';
import { FIELD_TEXTAREA } from '@/lib/field-styles';

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

const RequiredMark = () => <span className="text-red-500 ml-1">*</span>;

const Left = () => {
  const context = useContext(ContextData);
  const router = useRouter();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const { data, isLoading: customersLoading } = useGetAllCustomers({
    page: 1,
    limit: 100,
  });
  const customers: Customer[] = data?.data || [];
  const [date, setDate] = useState('');
  const [invoice, setInvoice] = useState('Invoice');
  const [customerName, setCustomerName] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Option | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentReference, setPaymentReference] = useState(''); // Added payment reference state
  const [currency, setCurrency] = useState('XAF');
  const [note, setNote] = useState('');
  const [isAddCustomerDrawer, setIsAddCustomerDrawer] = useState(false);

  // Using the same error approach as in the invoice component
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formSubmitted, setFormSubmitted] = useState(false);


  // Create customer options with proper typing
  const customerOptions: Option[] = customers.map((customer: Customer) => ({
    label:
      customer.firstName ||
      customer.lastName ||
      `Customer ${customer.customerId || customer.uuid.slice(0, 8)}`,
    value: customer.uuid,
  }));

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

  const handlePaymentMethodChange = (option: string) => {
    setSelectedPaymentMethod(option);

    if (errors.paymentMethod) {
      setErrors((prev) => ({ ...prev, paymentMethod: undefined }));
    }

    context?.setData((prevData: any) => ({
      ...prevData,
      payment_method: option,
      paymentMethod: option,
    }));
  };

  // Form validation function similar to invoice component
  const validateForm = () => {
    const newErrors: ValidationErrors = {};

    // Required field validation
    if (!date) newErrors.saleDate = 'Sale date is required';
    if (!selectedPaymentMethod)
      newErrors.paymentMethod = 'Payment method is required';
    if (selectedPaymentMethod === 'CREDIT' && !customerName)
      newErrors.customerId = 'Select a customer for a sale on account';

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

    const tableData: TableItem[] = context?.data?.table || [];
    const items: SaleLineItem[] = tableData.map((item: TableItem) => ({
      ...productToLine({ uuid: item.uuid, name: item.name, salesPrice: item.price }),
      quantity: item.qty,
      taxRate: Number(item.tax || 0),
    }));

    const saleReceiptData: SalesReceiptPayload = buildSalePayload({
      items,
      paymentMethod: selectedPaymentMethod as PaymentMethod,
      customerId: customerName || undefined,
      reference: paymentReference,
      notes: note,
      receiptNumber: invoiceNumber.trim() || undefined,
      saleDate: new Date(date).toISOString(),
    });

    mutation.mutate(saleReceiptData, {
      onSuccess: (receipt: any) => {
        toast.success(`Receipt ${receipt?.receiptNumber ?? ''} saved`);
        router.push('/pos/sales');
      },
      onError: (error: any) => {
        toast.error(`Failed to save receipt: ${apiErrorMessage(error)}`);
      },
    });
  };


  return (
    <>
      <DocumentFormShell className="w-full max-w-5xl">
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
                  label="Customer"
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
                  placeholder="Walk-in customer (optional)"
                  isClearable
                  isSearchable
                />
                {errors.customerId && (
                  <p className="mt-1 text-sm text-red-500">{errors.customerId}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsAddCustomerDrawer(true)}
                className="mb-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-[2px] bg-primary text-white hover:bg-brand-hover"
                aria-label="Add customer"
              >
                <i className="ri-add-line text-xl" />
              </button>
            </div>
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-7">
              <div className="space-y-4 rounded-[2px] border border-black/[0.08] bg-main-bg/40 p-4">
                <PaymentMethodSelect
                  value={selectedPaymentMethod || ''}
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
            <div className="flex items-end justify-end lg:col-span-5">
              <Button
                text="Save receipt"
                onClick={handleSaveInvoice}
                type="button"
              />
            </div>
          </div>
        </DocumentFormCard>
      </DocumentFormShell>

      <SliderCustomer
        open={isAddCustomerDrawer}
        setOpen={setIsAddCustomerDrawer}
      />
    </>
  );
};

export default Left;
