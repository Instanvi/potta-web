'use client'; // For Next.js 13+ App Directory
import Input from '@potta/components/input';
import SearchSelect from '@potta/components/search-select';
import { useContext, useState, useEffect, useRef, useCallback } from 'react';
import DynamicTable from './newtableInvoice';
import Button from '@potta/components/button';
import { ContextData } from '@potta/components/providers/DataProvider';
import useGetAllCustomers from '@potta/app/(routes)/customers/hooks/useGetAllCustomers';
import SliderCustomer from '@potta/app/(routes)/customers/components/customerSlider';
import Select from '@potta/components/select';
import { Customer } from '@potta/app/(routes)/customers/utils/types';
import TextArea from '@potta/components/textArea';
import toast from 'react-hot-toast';
import { DateInput } from '@potta/components/customDatePicker';
import { useRouter } from 'next/navigation';
import useCreateInvoice from '../../_hooks/useCreateInvoice';
import useUpdateInvoice from '../../_hooks/useUpdateInvoice';
import SearchableSelect from '@potta/components/searchableSelect';
import { format } from 'date-fns';
import Checkbox from '@potta/components/checkbox';
import {
  validateInvoiceForm,
  fieldSchemas,
} from '../validations/invoiceValidation';

// Import Option interface from SearchableSelect to avoid conflicts
import type { Option as SearchableSelectOption } from '@potta/components/searchableSelect';

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
  discountType: string;
  unitPrice: number;
  taxRate: number;
  discountRate: number;
  productId: string;
}

// Add validation errors interface
interface ValidationErrors {
  // Basic Information Section
  issueDate?: string;
  dueDate?: string;
  customerName?: string;
  currency?: string;

  // Address Section
  billingAddress?: string;
  shippingAddress?: string;

  // Line Items Section
  lineItems?: string;

  // Payment Section
  paymentMethod?: string;
  paymentReference?: string;
  taxRate?: string;
  paymentTerms?: string;

  // Notes Section
  notes?: string;

  // General Section Errors
  basicInfo?: string;
  addresses?: string;
  payment?: string;
}

interface LeftProps {
  initialInvoiceType?: string | null;
  isEditMode?: boolean;
  originalInvoice?: any;
  onSave?: () => void;
}

const Left = ({
  initialInvoiceType,
  isEditMode = false,
  originalInvoice,
  onSave,
}: LeftProps) => {
  const context = useContext(ContextData);
  const router = useRouter();
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>('');
  const { data, isLoading: customersLoading } = useGetAllCustomers({
    page: 1,
    limit: 100,
  });
  const customers: Customer[] = data?.data || [];
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [invoice, setInvoice] = useState('Invoice');
  const [customerName, setCustomerName] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Option | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('0025');
  const [currency, setCurrency] = useState('USD');
  const [invoiceType, setInvioceType] = useState(
    initialInvoiceType ? mapTypeToLabel(initialInvoiceType) : 'Invoice'
  );
  const [invoiceTypeDisabled, setInvoiceTypeDisabled] = useState(
    !!initialInvoiceType
  );
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [isAddCustomerDrawer, setIsAddCustomerDrawer] = useState(false);
  const [taxRate, setTaxRate] = useState(0);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Use a ref to track if initial selection has been made
  const initialSelectionMade = useRef(false);

  // Create customer options with proper typing for SearchableSelect
  const customerOptions: SearchableSelectOption[] = customers.map(
    (customer: Customer) => ({
      label:
        customer.firstName ||
        customer.lastName ||
        `Customer ${customer.customerId || customer.uuid.slice(0, 8)}`,
      value: customer.uuid, // UUID is already a string
    })
  );

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

  // Map URL type param to select label
  function mapTypeToLabel(type: string) {
    switch (type.toLowerCase()) {
      case 'invoice':
        return 'Invoice';
      case 'proforma':
      case 'proformainvoice':
        return 'Performa Invoice';
      case 'prepayment':
      case 'prepaymentinvoice':
        return 'Prepayment Invoice';
      default:
        return 'Invoice';
    }
  }

  // Map display labels to API values
  function mapInvoiceTypeToApiValue(displayType: string): string {
    switch (displayType) {
      case 'Invoice':
        return 'INVOICE';
      case 'Performa Invoice':
        return 'PROFORMA_INVOICE';
      case 'Prepayment Invoice':
        return 'PREPAYMENT_INVOICE';
      default:
        return 'INVOICE';
    }
  }

  function mapPaymentMethodToApiValue(displayMethod: string): string {
    switch (displayMethod) {
      case 'Credit Card':
        return 'CREDIT_CARD';
      case 'Bank Transfer':
        return 'BANK_TRANSFER';
      case 'ACH Transfer':
        return 'ACH_TRANSFER'; // Fixed typo: was ACH_TRANSAFER
      case 'Mobile Money':
        return 'MOBILE_MONEY';
      case 'Cash':
        return 'CASH';
      case 'Credit':
        return 'CREDIT';
      case 'Other':
        return 'OTHER';
      default:
        return 'OTHER';
    }
  }

  // If the initialInvoiceType changes (shouldn't, but for safety), update state
  useEffect(() => {
    if (initialInvoiceType) {
      setInvioceType(mapTypeToLabel(initialInvoiceType));
      setInvoiceTypeDisabled(true);
    }
  }, [initialInvoiceType]);

  // Sync local state with context.data when it changes (for dummy data fill)
  useEffect(() => {
    if (context?.data) {
      setIssueDate(context.data.issueDate || '');
      setDueDate(context.data.dueDate || '');
      setBillingAddress(context.data.billing || '');
      setShippingAddress(context.data.shipping || '');
      setNote(context.data.note || '');
      setPaymentTerms(context.data.paymentTerms || '');
      setPaymentReference(context.data.paymentReference || '');
      setTaxRate(context.data.taxRate || 0);
      setInvoiceNumber(context.data.invoiceNumber || '');
      setCurrency(context.data.currency || 'USD');
      setInvioceType(context.data.invoiceType || 'Invoice');
      // Add more fields as needed
    }
  }, [context?.data]);

  const handleInputChange = async (key: string, value: any) => {
    console.log(`Changing ${key} to:`, value);

    // Clear error for this field if it exists
    if (errors[key as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }

    // Real-time validation for specific fields
    if (fieldSchemas[key as keyof typeof fieldSchemas]) {
      try {
        await fieldSchemas[key as keyof typeof fieldSchemas].validate(value);
        // Clear error if validation passes
        setErrors((prev) => ({ ...prev, [key]: undefined }));
      } catch (error: any) {
        // Set error if validation fails
        setErrors((prev) => ({ ...prev, [key]: error.message }));
      }
    }

    // Update local state
    switch (key) {
      case 'issueDate':
        setIssueDate(value);
        break;
      case 'dueDate':
        setDueDate(value);
        break;
      case 'invoice':
        setInvoice(value);
        break;
      case 'invoiceNumber':
        setInvoiceNumber(value);
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
      case 'invoiceType':
        setInvioceType(value);
        break;
      case 'billing':
        setBillingAddress(value);
        break;
      case 'shipping':
        setShippingAddress(value);
        break;
      case 'paymentReference':
        setPaymentReference(value);
        break;
      case 'paymentTerms':
        setPaymentTerms(value);
        break;
      case 'taxRate':
        setTaxRate(value);
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

  const validateForm = async () => {
    const tableData: TableItem[] = context?.data?.table || [];

    const formData = {
      issueDate,
      dueDate,
      customerName,
      currency,
      invoiceNumber,
      invoiceType,
      billingAddress,
      shippingAddress,
      lineItems: tableData,
      paymentMethod: selectedPaymentMethod,
      paymentReference,
      taxRate: Number(taxRate),
      paymentTerms,
      notes: note,
    };

    const result = await validateInvoiceForm(formData, {
      validateAddresses: true,
      validatePaymentTerms: true,
      validateNotes: true,
    });

    if (!result.isValid) {
      setErrors(result.errors as ValidationErrors);
      return false;
    }

    setErrors({});
    return true;
  };
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice(originalInvoice?.uuid || '');
  const handleSaveInvoice = async () => {
    setFormSubmitted(true);

    // Validate form
    const isValid = await validateForm();
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
      discountType: 'PERCENTAGE_WITH_CAP', // Fixed enum value
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

    const InvoiceData = {
      issuedDate: issueDate, // Convert string to Date object
      dueDate: dueDate, // Convert string to Date object
      shippingAddress: shippingAddress,
      billingAddress: billingAddress,
      invoiceType: mapInvoiceTypeToApiValue(invoiceType), // Map to API value
      currency: currency,
      taxRate: Number(taxRate),
      // totalAmount: totalAmount,
      paymentTerms: paymentTerms,
      paymentReference: paymentReference, // or generate a unique reference
      notes: note,
      paymentMethod: mapPaymentMethodToApiValue(selectedPaymentMethod), // Map to API value
      invoiceNumber: invoiceNumber,
      // discountAmount: 0, // Add default or actual value if available
      customerId: customerName, // Using the customer UUID as customerId
      // salePersonId: 'c9c0c3a4-353f-4907-a342-ae64e629936f', // property salePersonId should not exist
      lineItems: lineItems,
    };

    // Save to context
    context?.setData((prevData: any) => ({
      ...prevData,
      saleReceipt: InvoiceData,
    }));

    console.log('Raw Sale Receipt Data:', InvoiceData);

    if (isEditMode) {
      updateMutation.mutate(InvoiceData, {
        onSuccess: () => {
          toast.success('Invoice updated successfully!');
          onSave?.();
        },
        onError: (error: any) => {
          // Handle backend validation errors for update
          if (error.data?.message && Array.isArray(error.data.message)) {
            const backendErrors: ValidationErrors = {};
            error.data.message.forEach((errorMessage: string) => {
              // Map backend error messages to form fields
              if (
                errorMessage.includes('notes') ||
                errorMessage.includes('Notes')
              ) {
                backendErrors.notes = errorMessage;
              } else if (
                errorMessage.includes('issueDate') ||
                errorMessage.includes('issuedDate')
              ) {
                backendErrors.issueDate = errorMessage;
              } else if (errorMessage.includes('dueDate')) {
                backendErrors.dueDate = errorMessage;
              } else if (
                errorMessage.includes('customerId') ||
                errorMessage.includes('customer')
              ) {
                backendErrors.customerName = errorMessage;
              } else if (errorMessage.includes('currency')) {
                backendErrors.currency = errorMessage;
              } else if (errorMessage.includes('paymentMethod')) {
                backendErrors.paymentMethod = errorMessage;
              } else if (errorMessage.includes('paymentReference')) {
                backendErrors.paymentReference = errorMessage;
              } else if (errorMessage.includes('taxRate')) {
                backendErrors.taxRate = errorMessage;
              } else if (errorMessage.includes('paymentTerms')) {
                backendErrors.paymentTerms = errorMessage;
              } else if (errorMessage.includes('lineItems')) {
                backendErrors.lineItems = errorMessage;
              } else if (errorMessage.includes('billingAddress')) {
                backendErrors.billingAddress = errorMessage;
              } else if (errorMessage.includes('shippingAddress')) {
                backendErrors.shippingAddress = errorMessage;
              } else if (errorMessage.includes('invoiceType')) {
                backendErrors.basicInfo = errorMessage;
              } else if (errorMessage.includes('invoiceNumber')) {
                backendErrors.basicInfo = errorMessage;
              }
            });
            setErrors(backendErrors);
            const firstErrorField = document.querySelector('.error-field');
            if (firstErrorField) {
              firstErrorField.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });
            }
          } else {
            toast.error(
              `Failed to update Invoice: ${
                error.data?.message || error.message || 'Unknown error'
              }`
            );
          }
        },
      });
    } else {
      createMutation.mutate(InvoiceData, {
        onSuccess: () => {
          toast.success(
            `${
              InvoiceData.invoiceType.toLowerCase().charAt(0).toUpperCase() +
              InvoiceData.invoiceType.slice(1)
            } created successfully`
          );
          router.push('/account_receivables/invoice');
          // You can add navigation or other actions here after successful creation
          // For example: router.push('/pos/sales');
        },
        onError: (error: any) => {
          // Handle backend validation errors
          if (error.data?.message && Array.isArray(error.data.message)) {
            const backendErrors: ValidationErrors = {};

            console.log(
              'Backend validation errors received:',
              error.data.message
            );

            error.data.message.forEach((errorMessage: string) => {
              // Map backend error messages to form fields and sections
              if (
                errorMessage.includes('notes') ||
                errorMessage.includes('Notes')
              ) {
                backendErrors.notes = errorMessage;
              } else if (
                errorMessage.includes('issueDate') ||
                errorMessage.includes('issuedDate')
              ) {
                backendErrors.issueDate = errorMessage;
              } else if (errorMessage.includes('dueDate')) {
                backendErrors.dueDate = errorMessage;
              } else if (
                errorMessage.includes('customerId') ||
                errorMessage.includes('customer')
              ) {
                backendErrors.customerName = errorMessage;
              } else if (errorMessage.includes('currency')) {
                backendErrors.currency = errorMessage;
              } else if (errorMessage.includes('paymentMethod')) {
                backendErrors.paymentMethod = errorMessage;
              } else if (errorMessage.includes('paymentReference')) {
                backendErrors.paymentReference = errorMessage;
              } else if (errorMessage.includes('taxRate')) {
                backendErrors.taxRate = errorMessage;
              } else if (errorMessage.includes('paymentTerms')) {
                backendErrors.paymentTerms = errorMessage;
              } else if (errorMessage.includes('lineItems')) {
                backendErrors.lineItems = errorMessage;
              } else if (errorMessage.includes('billingAddress')) {
                backendErrors.billingAddress = errorMessage;
              } else if (errorMessage.includes('shippingAddress')) {
                backendErrors.shippingAddress = errorMessage;
              } else if (errorMessage.includes('invoiceType')) {
                backendErrors.basicInfo = errorMessage;
              } else if (errorMessage.includes('invoiceNumber')) {
                backendErrors.basicInfo = errorMessage;
              } else {
                // For any unmapped errors, add them to a general field
                console.log('Unmapped error:', errorMessage);
              }
            });

            // Log the mapped errors for debugging
            console.log('Mapped backend errors:', backendErrors);

            // Set the backend errors
            setErrors(backendErrors);

            // Scroll to the first error field
            const firstErrorField = document.querySelector('.error-field');
            if (firstErrorField) {
              firstErrorField.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });
            }
          } else {
            // Handle general errors
            toast.error(
              `Failed to create Invoice: ${
                error.data?.message || error.message || 'Unknown error'
              }`
            );
          }
          console.error(
            'Error creating Invoice Please Try again later:',
            error
          );
        },
      });
    }
    // Also log the raw data object if needed
  };

  // Helper function to render required field marker
  const RequiredMark = () => <span className="text-red-500 ml-1">*</span>;

  return (
    <div className="max-w-5xl min-w-5xl p-4 bg-transparent overflow-y-auto scroll bg-white ">
      {/* Basic Information Section */}
      <div className="mb-6">
        <div className="w-full grid grid-cols-4 gap-4">
          <div className={`${errors.currency ? 'error-field' : ''}`}>
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
              error={errors.currency}
            />
          </div>
          <div className={`${errors.issueDate ? 'error-field' : ''}`}>
            <DateInput
              label="Issued Date"
              name="issueDate"
              value={issueDate ? new Date(issueDate) : undefined}
              onChange={(date) =>
                handleInputChange(
                  'issueDate',
                  date ? format(date, 'yyyy-MM-dd') : ''
                )
              }
              placeholder="Select issue date"
              required
              errors={errors.issueDate as any}
            />
          </div>
          <div className={`${errors.dueDate ? 'error-field' : ''}`}>
            <DateInput
              label="Due Date"
              name="dueDate"
              value={dueDate ? new Date(dueDate) : undefined}
              onChange={(date) =>
                handleInputChange(
                  'dueDate',
                  date ? format(date, 'yyyy-MM-dd') : ''
                )
              }
              placeholder="Select due date"
              required
              errors={errors.dueDate as any}
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
              <SearchableSelect
                label="Customer"
                options={customerOptions}
                selectedValue={customerName}
                onChange={(value: string) => {
                  console.log('SearchableSelect onChange called with:', value);
                  handleInputChange('customerName', value);
                  // Find and set the selected customer option
                  const selectedOption = customerOptions.find(
                    (option) => option.value === value
                  );
                  setSelectedCustomer(
                    selectedOption
                      ? {
                          label: selectedOption.label,
                          value: selectedOption.value,
                        }
                      : null
                  );
                }}
                placeholder="Select a customer..."
                isDisabled={customersLoading}
                required
              />
              {errors.customerName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.customerName}
                </p>
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
          <div className="flex space-x-4 mt-4">
            <div
              className={`w-full ${errors.billingAddress ? 'error-field' : ''}`}
            >
              <Input
                type="text"
                label="Billing Address"
                name="billing"
                value={billingAddress}
                onchange={(e: any) =>
                  handleInputChange('billing', e.target.value)
                }
                errors={errors.billingAddress}
              />
            </div>
            <div
              className={`w-full ${
                errors.shippingAddress ? 'error-field' : ''
              }`}
            >
              <Input
                type="text"
                label="Shipping Address"
                name="shipping"
                value={shippingAddress}
                onchange={(e: any) =>
                  handleInputChange('shipping', e.target.value)
                }
                errors={errors.shippingAddress}
              />
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
        <div className={`mt-2 ${errors.paymentMethod ? 'error-field' : ''}`}>
          <div className="grid grid-cols-2 py-4 gap-4">
            {[
              'Credit Card',
              'Bank Transfer',
              'ACH Transfer',
              'Mobile Money',
              'Cash',
              'Credit',
              'Other',
            ].map((option) => (
              <div
                key={option}
                onClick={() => handlePaymentMethodClick(option)}
                className={`p-4 border cursor-pointer ${
                  selectedPaymentMethod === option
                    ? 'border-green-500 text-green-500'
                    : errors.paymentMethod && formSubmitted
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Checkbox
                    id={`payment-${option}`}
                    label={option.replace(/([A-Z])/g, ' $1').toUpperCase()}
                    checked={selectedPaymentMethod === option}
                    onChange={() => handlePaymentMethodClick(option)}
                  />
                </div>
              </div>
            ))}
            {errors.paymentMethod && (
              <p className="text-red-500 text-sm col-span-2">
                {errors.paymentMethod}
              </p>
            )}
          </div>
          <div className={`${errors.paymentReference ? 'error-field' : ''}`}>
            <Input
              type="text"
              label="Payment Reference"
              name="paymentReference"
              value={paymentReference}
              onchange={(e: any) =>
                handleInputChange('paymentReference', e.target.value)
              }
              errors={errors.paymentReference}
            />
          </div>
          <div className={`${errors.taxRate ? 'error-field' : ''}`}>
            <Input
              type="number"
              label="Tax Rate"
              name="taxRate"
              value={taxRate}
              onchange={(e: any) =>
                handleInputChange('taxRate', e.target.value)
              }
              errors={errors.taxRate}
            />
          </div>
          <div className={`${errors.paymentTerms ? 'error-field' : ''}`}>
            <TextArea
              label="Payment Terms"
              name="paymentTerms"
              value={paymentTerms}
              onchange={(e: any) =>
                handleInputChange('paymentTerms', e.target.value)
              }
              errors={errors.paymentTerms}
            />
          </div>
        </div>

        <hr className="my-5" />
        <h3 className="text-xl  my-2">Notes</h3>
        <div className={`${errors.notes ? 'error-field' : ''}`}>
          <textarea
            value={note}
            onChange={(e) => handleInputChange('note', e.target.value)}
            className={`h-36 border p-2 w-full outline-none mt-2 focus:outline-none focus:ring-2 mb-10 ${
              errors.notes
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'focus:ring-green-500 focus:border-green-500'
            }`}
          ></textarea>
          {errors.notes && (
            <p className="text-red-500 text-sm mt-1">{errors.notes}</p>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-2 bg-white border-t border-gray-200 flex justify-end space-x-3">
          {' '}
          <Button
            text={
              isEditMode
                ? updateMutation.isPending
                  ? 'Updating Invoice...'
                  : 'Update Invoice'
                : createMutation.isPending
                ? 'Creating Invoice...'
                : 'Save Invoice'
            }
            onClick={handleSaveInvoice}
            type={'button'}
            disabled={
              isEditMode ? updateMutation.isPending : createMutation.isPending
            }
          />
        </div>
        <SliderCustomer
          open={isAddCustomerDrawer}
          setOpen={setIsAddCustomerDrawer}
        />
      </div>
    </div>
  );
};

export default Left;
