'use client';
import Input from '@potta/components/input';
import SearchSelect from '@potta/components/search-select';
import { useContext, useState, useEffect, useRef } from 'react';
import CreditNoteForm from './newtableInvoice';
import Button from '@potta/components/button';
import { ContextData } from '@potta/components/providers/DataProvider';
import useGetAllCustomers from '@potta/app/(routes)/customers/hooks/useGetAllCustomers';
import SliderCustomer from '@potta/app/(routes)/customers/components/customerSlider';
import Select from '@potta/components/select';
import { Customer } from '@potta/app/(routes)/customers/utils/types';
import TextArea from '@potta/components/textArea';

import toast from 'react-hot-toast';
import useCreateCreditNote from '../hooks/useCreateCredit';

// Define Option interface to match the one in SearchSelect component
interface Option {
  label: string;
  value: string | number;
}

// Add validation errors interface
interface ValidationErrors {
  issueDate?: string;
  customerName?: string;
  creditAmount?: string;
  reason?: string;
  invoiceId?: string;
}

const Left = () => {
  const context = useContext(ContextData);
  const { data, isLoading: customersLoading } = useGetAllCustomers({
    page: 1,
    limit: 100,
  });
  const customers: Customer[] = data?.data || [];
  const [issueDate, setIssueDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Option | null>(null);
  const [currency, setCurrency] = useState('USD');
  const [note, setNote] = useState('');
  const [isAddCustomerDrawer, setIsAddCustomerDrawer] = useState(false);
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
      // Update context data
      context?.setData((prevData: any) => ({
        ...prevData,
        customerName: firstCustomer.uuid,
      }));
    }
  }, [customers, customerName, context, selectedCustomer]);

  const handleInputChange = (key: string, value: any) => {
    console.log(`Changing ${key} to:`, value);

    // Clear error for this field if it exists
    if (errors[key as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }

    // Update local state
    switch (key) {
      case 'issueDate':
        setIssueDate(value);
        break;
      case 'customerName':
        setCustomerName(value);
        break;
      case 'currency':
        setCurrency(value);
        break;
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

  const validateForm = () => {
    const newErrors: ValidationErrors = {};
    const contextData = context?.data || {};

    // Required field validation
    if (!issueDate) newErrors.issueDate = 'Issue date is required';
    if (!customerName) newErrors.customerName = 'Customer is required';
    if (!contextData.invoiceId) newErrors.invoiceId = 'Invoice is required';
    if (!contextData.creditAmount || contextData.creditAmount <= 0)
      newErrors.creditAmount = 'Valid credit amount is required';
    if (!contextData.reason) newErrors.reason = 'Reason is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutation = useCreateCreditNote();
  const handleSaveCreditNote = () => {
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

    const contextData = context?.data || {};

    const creditNoteData = {
      customerId: customerName,
      issueDate: issueDate,
      creditAmount: contextData.creditAmount,
      reason: contextData.reason,
      invoiceId: contextData.invoiceId,
      salesPersonId: '532e5da0-204f-4417-95e0-f26a13c62e39', // Add actual salesperson if available
      notes: note,
    };

    console.log('Credit Note Data:', creditNoteData);
    mutation.mutate(creditNoteData, {
      onSuccess: () => {
        toast.success('Credit note created successfully');
        // You can add navigation or other actions here after successful creation
        // For example: router.push('/invoice/credit');
      },
      onError: (error: any) => {
        toast.error(
          `Failed to create credit note: ${error.message || 'Unknown error'}`
        );
        console.error('Error creating credit note:', error);
      },
    });
  };

  // Helper function to render required field marker
  const RequiredMark = () => <span className="text-red-500 ml-1">*</span>;

  return (
    <div className="max-w-5xl min-w-5xl px-2 bg-transparent overflow-y-auto scroll bg-white">
      <div className="w-full grid grid-cols-3 gap-4">
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
        <div className={`${errors.issueDate ? 'error-field' : ''}`}>
          <Input
            type="date"
            label={
              <>
                Issue Date
                <RequiredMark />
              </>
            }
            name="issueDate"
            value={issueDate}
            onchange={(e) =>
              handleInputChange(
                'issueDate',
                typeof e === 'string' ? e : e.target.value
              )
            }
            placeholder="Select issue date"
            errors={
              errors.issueDate ? { message: errors.issueDate } : undefined
            }
          />
        </div>
      </div>

      <div className="mt-3 w-full flex flex-col">
        <div
          className={`w-[50%] flex items-center space-x-3 ${
            errors.customerName ? 'error-field' : ''
          }`}
        >
          <div className="w-full">
            <SearchSelect
              label="Customer"
              options={customerOptions}
              value={selectedCustomer}
              onChange={(option: Option | null) => {
                console.log('SearchSelect onChange called with:', option);
                setSelectedCustomer(option);
                handleInputChange('customerName', option?.value || '');
              }}
              isLoading={customersLoading}
              placeholder="Select a customer..."
              isClearable={true}
              isSearchable={true}
            />
            {errors.customerName && (
              <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
            )}
          </div>
          <div className="h-full mt-8 flex items-center">
            <button
              type="button"
              onClick={() => setIsAddCustomerDrawer(true)}
              className="flex items-center justify-center text-white bg-green-700 rounded-full size-10"
            >
              <i className="ri-add-line text-3xl"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="my-5 pt-5">
        <h3 className="mb-4 text-gray-900 text-lg font-medium">
          Credit Note Details
          <RequiredMark />
        </h3>
        <CreditNoteForm />
        {(errors.invoiceId || errors.creditAmount || errors.reason) && (
          <div className="mt-2 bg-red-50 p-3 rounded">
            {errors.invoiceId && (
              <p className="text-red-500 text-sm">{errors.invoiceId}</p>
            )}
            {errors.creditAmount && (
              <p className="text-red-500 text-sm">{errors.creditAmount}</p>
            )}
            {errors.reason && (
              <p className="text-red-500 text-sm">{errors.reason}</p>
            )}
          </div>
        )}
      </div>

      <hr className="my-5" />
      <h3 className="text-xl font-thin my-2">Notes</h3>
      <textarea
        value={note}
        onChange={(e) => handleInputChange('note', e.target.value)}
        className="h-36 border p-2 w-full outline-none mt-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
   "
        placeholder="Add any additional notes about this credit note"
      ></textarea>

      <div className="mt-5 w-full flex justify-end">
        <Button
          text="Save Credit Note"
          onClick={handleSaveCreditNote}
          type="button"
          isLoading={mutation.isPending}
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
