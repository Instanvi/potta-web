'use client'; // For Next.js 13+ App Directory
import Input from '@potta/components/input';
import SearchSelect from '@potta/components/search-select';
import { useContext, useState, useEffect, useRef } from 'react';
import DynamicTable from './newtableInvoice';
import Button from '@potta/components/button';
import { ContextData } from '@potta/components/providers/DataProvider';
import useGetAllCustomers from '@potta/app/(routes)/customers/hooks/useGetAllCustomers';
import SliderCustomer from '@potta/app/(routes)/customers/components/customerSlider';
import Select from '@potta/components/select';
import { Customer } from '../../../../customers/utils/types';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast'; // Assuming you have a toast library
import { useCreateSalesReceipt } from '../../hooks/useCreateReceipt';
import { SalesReceiptPayload } from '../../../utils/validation';

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
  const context = useContext(ContextData);
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

    // Map the internal payment method values to the exact string literals required by the schema
    let paymentMethod:
      | 'Credit Card'
      | 'Bank Transfer'
      | 'ACH Transfer'
      | 'Other';

    switch (selectedPaymentMethod) {
      case 'creditCard':
        paymentMethod = 'Credit Card';
        break;
      case 'bankTransfer':
        paymentMethod = 'Bank Transfer';
        break;
      case 'achTransfer':
        paymentMethod = 'ACH Transfer';
        break;
      default:
        paymentMethod = 'Other';
    }

    // Create the sales receipt data using the SalesReceiptPayload type from your validation schema
    const saleReceiptData: SalesReceiptPayload = {
      saleDate: date,
      totalAmount: totalAmount,
      paymentReference: paymentReference,
      notes: note,
      paymentMethod: paymentMethod,
      receiptNumber: invoiceNumber,
      discountAmount: 0, // Add default or actual value if available
      customerId: customerName, // Using the customer UUID as customerId
      salePerson: '532e5da0-204f-4417-95e0-f26a13c62e39', // Fixed sales person ID as required
      lineItems: lineItems,
    };

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

  // Helper function to render required field marker
  const RequiredMark = () => <span className="text-red-500 ml-1">*</span>;

  // Define the new payment methods
  const paymentMethods = ['creditCard', 'bankTransfer', 'achTransfer', 'other'];

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
              <RequiredMark />
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
              placeholder="Select a customer..."
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
              key={option}
              onClick={() => handlePaymentMethodClick(option)}
              className={`p-4 border cursor-pointer hover:border-green-500 hover:text-green-500 ${
                selectedPaymentMethod === option
                  ? 'border-green-500 text-green-500'
                  : errors.paymentMethod && formSubmitted
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedPaymentMethod === option}
                  onChange={() => handlePaymentMethodClick(option)}
                  className="mr-2 text-xl text-white accent-green-700"
                  name="paymentMethod"
                />
                <span>
                  {option === 'creditCard'
                    ? 'Credit Card'
                    : option === 'bankTransfer'
                    ? 'Bank Transfer'
                    : option === 'achTransfer'
                    ? 'ACH Transfer'
                    : 'Other'}
                </span>
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
      <hr className="my-5" />
      <h3 className="text-lg font-thin my-2">Notes</h3>
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
