'use client'; // For Next.js 13+ App Directory
import Input from '@potta/components/input';
import SearchSelect from '@potta/components/search-select';
import { useContext, useState, useEffect, useRef } from 'react';
import Button from '@potta/components/button';
import { ContextData } from '@potta/components/providers/DataProvider';
import useGetAllVendors from '@potta/app/(routes)/vendors/hooks/useGetAllVendors';
import { Vendor } from '@potta/app/(routes)/vendors/utils/types';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast'; // Assuming you have a toast library
import SearchableSelect from '@potta/components/searchableSelect';
import Select from '@potta/components/select';
import { DateInput } from '@potta/components/customDatePicker';
import NewTableFreeEntry from './newtableFreeEntry';
import { useRouter } from 'next/navigation';
import useCreateBill from '../hooks/useCreateBill';
import TextArea from '@potta/components/textArea';
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
  discountType: 'FlatRate' | 'Percentage' | 'PercentageWithCap';
  unitPrice: number;
  taxRate: number;
  discountRate: number;
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
  vendorId?: string;
  salePerson?: string;
  lineItems?: string;
  paymentTerms?: string;
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
  vendorId: string;
  salePerson: string;
  lineItems: LineItemsDto[];
}

const Left = () => {
  const context = useContext(ContextData);
  const router = useRouter();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const { data: vendorData, isLoading: vendorsLoading } = useGetAllVendors({
    page: 1,
    limit: 100,
  });
  const vendors: Vendor[] = vendorData?.data || [];
  const [date, setDate] = useState('');
  const [invoice, setInvoice] = useState('Invoice');
  const [invoiceNumber, setInvoiceNumber] = useState('0025');
  const [paymentReference, setPaymentReference] = useState(''); // Added payment reference state
  const [currency, setCurrency] = useState('USD');
  const [note, setNote] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Option | null>(null);
  const [paymentTerms, setPaymentTerms] = useState('');

  // Using the same error approach as in the invoice component
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

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
      case 'currency':
        setCurrency(value);
        break;
      case 'notes':
      case 'note':
        setNote(value);
        break;
      case 'vendorId':
        setSelectedVendor(value);
        break;
      case 'paymentTerms':
        setPaymentTerms(value);
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
    if (!selectedVendor) newErrors.vendorId = 'Vendor is required';
    if (!selectedPaymentMethod)
      newErrors.paymentMethod = 'Payment method is required';
    if (!paymentReference)
      newErrors.paymentReference = 'Payment reference is required'; // Added payment reference validation
    if (!paymentTerms || paymentTerms.length < 10)
      newErrors.paymentTerms = 'Payment terms must be at least 10 characters';

    // Check if there are line items
    const tableData = context?.data?.table || [];
    if (tableData.length === 0)
      newErrors.lineItems = 'At least one item is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutation = useCreateBill();

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
      discountType: 'FlatRate',
      unitPrice: Number(item.price),
      taxRate: item.tax,
      discountRate: 0,
    }));

    // Build the payload for the API
    const billData = {
      vendorId: selectedVendor?.value,
      currency,
      invoiceType: 'BILL',
      notes: note,
      paymentTerms,
      paymentMethod: selectedPaymentMethod
        ? mapPaymentMethodToAPI(selectedPaymentMethod)
        : undefined,
      issuedDate: date,
      dueDate: date, // You may want a separate due date field
      invoiceNumber,
      taxRate: 0, // Add if you have this field
      billingAddress: '', // Add if you have this field
      shippingAddress: '', // Add if you have this field
      paymentReference,
      voucherCode: paymentReference,
      lineItems,
    };

    mutation.mutate(billData, {
      onSuccess: () => {
        toast.success('Bill created successfully');
        router.push('/account_payables/bills');
      },
      onError: (error: any) => {
        toast.error(
          `Failed to create bill: ${error.message || 'Unknown error'}`
        );
      },
    });
  };

  // Helper function to render required field marker
  const RequiredMark = () => <span className="text-red-500 ml-1">*</span>;

  // Define the new payment methods
  const paymentMethods = [
    'Credit Card',
    'Bank Transfer',
    'ACH Transfer',
    'Mobile Money',
    'Cash',
    'Credit',
    'Other',
  ];

  // Map display payment methods to API enum values
  const mapPaymentMethodToAPI = (displayMethod: string): string => {
    const paymentMethodMap: Record<string, string> = {
      'Credit Card': 'CREDIT_CARD',
      'Bank Transfer': 'BANK_TRANSFER',
      'ACH Transfer': 'ACH_TRANSAFER', // Note: API has typo "ACH_TRANSAFER"
      'Mobile Money': 'MOBILE_MONEY',
      Cash: 'CASH',
      Credit: 'CREDIT',
      Other: 'OTHER',
    };
    return paymentMethodMap[displayMethod] || displayMethod;
  };

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
          <DateInput
            label={'Sale Date'}
            name="saleDate"
            value={date ? new Date(date) : undefined}
            onChange={(d) =>
              handleInputChange(
                'saleDate',
                d ? d.toISOString().slice(0, 10) : ''
              )
            }
            placeholder="Select sale date"
            required
            errors={
              typeof errors.saleDate === 'string' ? undefined : errors.saleDate
            }
          />
        </div>
        <div className={`${errors.receiptNumber ? 'error-field' : ''}`}>
          <Input
            type="text"
            label="Bill Number"
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
            errors.vendorId ? 'error-field' : ''
          }`}
        >
          <div className="w-full">
            <span className="mb-3 text-lg text-gray-900 font-medium">
              Vendor
              <RequiredMark />
            </span>
            <SearchableSelect
              label=""
              options={vendors.map((vendor: Vendor) => ({
                label:
                  vendor.name ||
                  `Vendor ${vendor.vendorId || vendor.uuid.slice(0, 8)}`,
                value: vendor.uuid,
              }))}
              selectedValue={selectedVendor?.value as string}
              onChange={(value: string) => {
                const option =
                  vendors
                    .map((vendor: Vendor) => ({
                      label:
                        vendor.name ||
                        `Vendor ${vendor.vendorId || vendor.uuid.slice(0, 8)}`,
                      value: vendor.uuid,
                    }))
                    .find((opt) => opt.value === value) || null;
                setSelectedVendor(option);
              }}
              placeholder="Select a vendor..."
              error={errors.vendorId}
              required
              isDisabled={vendorsLoading}
            />
          </div>
        </div>
      </div>

      <div className="my-5 pt-10">
        <h3 className="text-lg mb-2 text-gray-900 font-medium">
          Line Items
          <RequiredMark />
        </h3>
        <NewTableFreeEntry />
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
                <span>{option}</span>
              </div>
            </div>
          ))}
        </div>
        {errors.paymentMethod && (
          <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
        )}
      </div>
      <div className={`${errors.paymentReference ? 'error-field' : ''} mb-5`}>
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
      <div className={`${errors.paymentTerms ? 'error-field' : ''}`}>
        <Input
          type="text"
          label="Payment Terms"
          name="paymentTerms"
          value={paymentTerms}
          onchange={(e: any) =>
            handleInputChange('paymentTerms', e.target.value)
          }
          placeholder="Enter payment terms (at least 10 characters)"
          errors={
            errors.paymentTerms ? { message: errors.paymentTerms } : undefined
          }
        />
      </div>
      <hr className="my-5" />
      <TextArea
        value={note}
        label="Notes"
        name="notes"
        onchange={(e: any) => handleInputChange('notes', e.target.value)}
        placeholder="Enter notes"
        errors={errors.notes}
      />

      <div className="fixed bottom-0 left-0 right-0 p-2 bg-white border-t border-gray-200 flex justify-end space-x-3">
        <Button
          text={'Save Bill'}
          onClick={handleSaveInvoice}
          type={'button'}
        />
      </div>
    </div>
  );
};

export default Left;
