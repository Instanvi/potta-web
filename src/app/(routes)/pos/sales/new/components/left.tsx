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
import { useCreateSalesReceipt } from '../../hooks/useCreateReceipt';
import { SalesReceiptPayload } from '../../../utils/validation';
import {
  PAYMENT_METHODS,
  apiErrorMessage,
  buildSalePayload,
  productToLine,
  type PaymentMethod,
  type SaleLineItem,
} from '../../../utils/sale';

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

  const handlePaymentMethodClick = (option: string) => {
    // If clicking the same option, don't deselect it
    if (selectedPaymentMethod === option) {
      return;
    }

    setSelectedPaymentMethod(option);

    // Clear payment method error if it exists
    if (errors.paymentMethod) {
      setErrors((prev) => ({ ...prev, paymentMethod: undefined }));
    }

    // Update context data with single payment method
    context?.setData((prevData: any) => ({
      ...prevData,
      payment_method: [option], // Array with single value
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


  // Define the new payment methods
  const paymentMethods = PAYMENT_METHODS;

  return (
    <div className="max-w-5xl min-w-5xl px-2 overflow-y-auto scroll bg-white  ">
      <div className="w-full grid grid-cols-4 gap-4">
        <div>
          <Select
            label="Currency"
            options={[
              { label: 'USD($)', value: 'USD' },
              { label: 'EUR(€)', value: 'EUR' },
              { label: 'XAF', value: 'XAF' },
            ]}
            selectedValue={currency}
            onChange={(value: any) => handleInputChange('currency', value)}
            bg={''}
          />
        </div>
        <div className={`${errors.saleDate ? 'error-field' : ''}`}>
          <Input
            type="date"
            label={
              <>
                Sale Date
                <RequiredMark />
              </>
            }
            name="saleDate"
            value={date}
            onchange={(e) =>
              handleInputChange(
                'saleDate',
                typeof e === 'string' ? e : e.target.value
              )
            }
            placeholder="Select sale date"
            errors={errors.saleDate ? { message: errors.saleDate } : undefined}
          />
        </div>
        <div className={`${errors.receiptNumber ? 'error-field' : ''}`}>
          <Input
            type="text"
            label="Receipt Number"
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

      <div className="mt-3 w-full flex">
        <div
          className={`w-[50%] flex items-center space-x-3 ${
            errors.customerId ? 'error-field' : ''
          }`}
        >
          <div className="w-full">
            <span className="mb-3 text-lg text-gray-900 font-medium">
              Customer
                          </span>
            <SearchSelect
              label=""
              options={customerOptions}
              value={selectedCustomer}
              onChange={(option: Option | null) => {
                setSelectedCustomer(option);
                // Update both customerName and customerId in the context for consistency
                if (option) {
                  const customerId = option.value.toString();
                  setCustomerName(customerId);
                  // Update both keys in the context
                  context?.setData((prevData: any) => ({
                    ...prevData,
                    customerId: customerId,
                    customerName: customerId, // This ensures pdfview.tsx gets the update
                  }));
                } else {
                  setCustomerName('');
                  // Clear both keys in the context
                  context?.setData((prevData: any) => ({
                    ...prevData,
                    customerId: '',
                    customerName: '',
                  }));
                }
              }}
              isLoading={customersLoading}
              placeholder="Walk-in customer (optional)"
              isClearable={true}
              isSearchable={true}
            />
            {errors.customerId && (
              <p className="text-red-500 text-sm mt-1">{errors.customerId}</p>
            )}
          </div>
          <div className="h-full mt-8 flex items-center">
            <button
              type="button"
              onClick={() => setIsAddCustomerDrawer(true)}
              className="flex items-center justify-center text-white bg-green-700 rounded-full size-10"
            >
              <i className="ri-add-line text-2xl"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="my-5 pt-10">
        <h3 className="text-lg mb-2 text-gray-900 font-medium">
          Line Items
          <RequiredMark />
        </h3>
        <DynamicTable />
        {errors.lineItems && (
          <p className="text-red-500 text-sm mt-1">{errors.lineItems}</p>
        )}
      </div>

      <hr className="my-5" />
      <h3 className="text-lg font-medium my-2">
        Payment Methods
        <RequiredMark />
      </h3>
      <div className={`my-5 ${errors.paymentMethod ? 'error-field' : ''}`}>
        <div className="grid grid-cols-2 gap-4">
          {paymentMethods.map((option) => (
            <div
              key={option.value}
              onClick={() => handlePaymentMethodClick(option.value)}
              className={`p-4 border cursor-pointer hover:border-green-500 hover:text-green-500 ${
                selectedPaymentMethod === option.value
                  ? 'border-green-500 text-green-500'
                  : errors.paymentMethod && formSubmitted
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedPaymentMethod === option.value}
                  onChange={() => handlePaymentMethodClick(option.value)}
                  className="mr-2 text-xl text-white accent-green-700"
                  name="paymentMethod"
                />
                <span>{option.label}</span>
              </div>
            </div>
          ))}
        </div>
        {errors.paymentMethod && (
          <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
        )}
      </div>
      <div className={`${errors.paymentReference ? 'error-field' : ''}`}>
        <Input
          type="text"
          label={
            <>
              Payment Reference
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
      <hr className="my-5" />
      <h3 className="text-lg font-normal my-2">Notes</h3>
      <textarea
        value={note}
        onChange={(e) => handleInputChange('notes', e.target.value)}
        className="h-36 border p-2 w-full outline-none mt-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
   "
      ></textarea>
      {errors.notes && (
        <p className="text-red-500 text-sm mt-1">{errors.notes}</p>
      )}

      <div className="mt-5 w-full flex justify-end">
        <Button
          text={'Save Receipt'}
          onClick={handleSaveInvoice}
          type={'button'}
        />
      </div>
      <SliderCustomer
        open={isAddCustomerDrawer}
        setOpen={setIsAddCustomerDrawer}
      />
    </div>
  );
};

export default Left;
