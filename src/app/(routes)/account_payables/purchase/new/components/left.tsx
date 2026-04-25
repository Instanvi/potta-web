'use client'; // For Next.js 13+ App Directory
import Input from '@potta/components/input';
import SearchSelect from '@potta/components/search-select';
import { useContext, useState, useEffect, useRef } from 'react';
import DynamicTable from './newtableInvoice';
import Button from '@potta/components/button';
import { ContextData } from '@potta/components/providers/DataProvider';
import useGetAllVendors from '@potta/app/(routes)/vendors/hooks/useGetAllVendors';
import Select from '@potta/components/select';
import Checkbox from '@potta/components/checkbox';

import toast from 'react-hot-toast';
import TextArea from '@potta/components/textArea';
import useCreatePurchaseOrder from '../hooks/useCreatePurchase';
import { DateInput } from '@potta/components/customDatePicker';
import { useRouter } from 'next/navigation';
import {
  validatePurchaseOrderForm,
  validateField,
  fieldSchemas,
  formatErrorForTextArea,
  getFirstErrorField,
} from '../validations/purchaseOrderValidation';

// Define Option interface to match the one in SearchSelect component
interface Option {
  label: string;
  value: string | number;
}

// Add these interfaces at the top of your file with the other interfaces
interface TableItem {
  name: string;
  qty: number;
  productId: string;
  uuid: string;
  id: number;
  price: number;
  tax: number;
}

interface LineItemsDto {
  description: string;
  quantity: number;
  productId: string;
}

// Add validation errors interface
interface ValidationErrors {
  orderDate?: string;
  requiredDate?: string;
  vendorId?: string;
  shippingAddress?: string;
  lineItems?: string;
  paymentMethod?: string;
  paymentTerms?: string;
  note?: string;
}

const Left = () => {
  const context = useContext(ContextData);
  const router = useRouter();
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>('');

  // Vendor data fetch
  const { data: vendorData, isLoading: vendorsLoading } = useGetAllVendors({
    page: 1,
    limit: 100,
  });
  const vendors = vendorData?.data || [];

  // Form state variables
  const [orderDate, setOrderDate] = useState('');
  const [requiredDate, setRequiredDate] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Option | null>(null);
  const [shipDate, setShipDate] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [shippingAddress, setShippingAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Use a ref to track if initial selection has been made
  const initialVendorSelectionMade = useRef(false);

  // Create vendor options
  const vendorOptions: Option[] = vendors.map((vendor: any) => ({
    label:
      vendor.name || `Vendor ${vendor.vendorId || vendor.uuid.slice(0, 8)}`,
    value: vendor.uuid,
  }));

  // Set initial vendor selection when data loads
  useEffect(() => {
    if (
      vendors.length > 0 &&
      !initialVendorSelectionMade.current &&
      !selectedVendor
    ) {
      const firstVendor = vendors[0];
      const vendorOption = {
        label:
          firstVendor.name ||
          `Vendor ${firstVendor.vendorId || firstVendor.uuid.slice(0, 8)}`,
        value: firstVendor.uuid,
      };
      setSelectedVendor(vendorOption);
      setVendorId(firstVendor.uuid);

      // Update context with vendor information for PDF view
      context?.setData((prevData: any) => ({
        ...prevData,
        vendorId: firstVendor.uuid,
        vendorName: vendorOption.label,
      }));

      initialVendorSelectionMade.current = true;
    }
  }, [vendors, selectedVendor, context]);

  // Reset form when modal is closed
  useEffect(() => {
    const handleModalClose = () => {
      resetForm();
    };

    const handleResetForm = () => {
      resetForm();
    };

    window.addEventListener('closePurchaseOrderModal', handleModalClose);
    window.addEventListener('resetPurchaseOrderForm', handleResetForm);
    return () => {
      window.removeEventListener('closePurchaseOrderModal', handleModalClose);
      window.removeEventListener('resetPurchaseOrderForm', handleResetForm);
    };
  }, []);

  // Handle input changes
  const handleInputChange = async (key: string, value: any) => {
    switch (key) {
      case 'orderDate':
        setOrderDate(value);
        break;
      case 'requiredDate':
        setRequiredDate(value);
        break;
      case 'shipDate':
        setShipDate(value);
        break;
      case 'status':
        setStatus(value);
        break;
      case 'shippingAddress':
        setShippingAddress(value);
        break;
      case 'note':
        setNote(value);
        break;
      case 'paymentTerms':
        setPaymentTerms(value);
        break;
      case 'vendorId':
        setVendorId(value);
        break;
      default:
        break;
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

    // Update context data for PDF view
    context?.setData((prevData: any) => ({
      ...prevData,
      [key]: value,
    }));
  };

  // Handle payment method selection
  const handlePaymentMethodClick = (option: string) => {
    // Map display names to API enum values
    const paymentMethodMap: { [key: string]: string } = {
      'Credit Card': 'CREDIT_CARD',
      'Bank Transfer': 'BANK_TRANSFER',
      'ACH Transfer': 'ACH_TRANSAFER',
      'Mobile Money': 'MOBILE_MONEY',
      Cash: 'CASH',
      Credit: 'CREDIT',
      Other: 'OTHER',
    };

    const apiValue = paymentMethodMap[option] || option;
    setSelectedPaymentMethod(apiValue);

    // Clear error when user selects a payment method
    if (errors.paymentMethod) {
      setErrors((prev) => ({
        ...prev,
        paymentMethod: undefined,
      }));
    }

    // Update context data for PDF view
    context?.setData((prevData: any) => ({
      ...prevData,
      paymentMethod: apiValue,
    }));
  };

  const validateForm = async () => {
    const tableData = context?.data?.table || [];

    const formData = {
      orderDate,
      requiredDate,
      vendorId,
      shippingAddress,
      paymentMethod: selectedPaymentMethod,
      paymentTerms,
      note,
      lineItems: tableData,
    };

    const { isValid, errors } = await validatePurchaseOrderForm(formData);

    setErrors(errors);
    return isValid;
  };

  const mutation = useCreatePurchaseOrder();
  const userId = 'f7b1b3b0-0b1b-4b3b-8b1b-0b1b3b0b1b3t'; // TODO: Replace with real userId from session
  const branchId = 'f7b1b3b0-0b1b-4b3b-8b1b-0b1b3b0b1b3b'; // TODO: Replace with real branchId from session
  const handleSavePurchaseOrder = async () => {
    setFormSubmitted(true);

    // Validate form
    const isValid = await validateForm();
    if (!isValid) {
      // Scroll to the first error - use the updated errors state
      setTimeout(() => {
        const firstErrorField = getFirstErrorField(errors);
        if (firstErrorField) {
          firstErrorField.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        } else {
          // Fallback to error-field class
          const fallbackErrorField = document.querySelector('.error-field');
          if (fallbackErrorField) {
            fallbackErrorField.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
        }
      }, 100); // Small delay to ensure errors state is updated
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    // Get table data from context with type annotation
    const tableData: TableItem[] = context?.data?.table || [];

    // Format line items according to API structure with correct discountType values
    const lineItems = tableData.map((item: TableItem) => ({
      description: item.name,
      quantity: item.qty,
      discountCap: 0,
      discountType: 'PERCENTAGE_WITH_CAP', // Fixed to match API enum
      unitPrice: item.price || 0, // Use actual price from table data
      taxRate: item.tax || 0, // Use actual tax from table data
      discountRate: 0,
      productId: item.uuid,
    }));

    // Calculate orderTotal from line items
    const orderTotal = lineItems.reduce((total, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const itemTax = (itemTotal * item.taxRate) / 100;
      return total + itemTotal + itemTax;
    }, 0);

    const purchaseOrderData = {
      orderDate: orderDate,
      requiredDate: requiredDate,
      shipDate: shipDate || new Date().toISOString(),
      orderTotal: orderTotal,
      shippingAddress: shippingAddress,
      paymentTerms: paymentTerms,
      paymentMethod: selectedPaymentMethod,
      status: status, // Already set to 'PENDING' which is valid
      vendorId: vendorId,
      notes: note,
      lineItems: lineItems,
    };

    // Save to context
    context?.setData((prevData: any) => ({
      ...prevData,
      purchaseOrder: purchaseOrderData,
    }));

    console.log('Purchase Order Data:', purchaseOrderData);
    mutation.mutate(
      { data: purchaseOrderData, userId, branchId },
      {
        onSuccess: () => {
          toast.success(`Purchase Order created successfully`);

          // Reset form and table data
          resetForm();

          // Close the modal by triggering the close function
          if (typeof window !== 'undefined') {
            // Dispatch a custom event to close the modal
            window.dispatchEvent(new CustomEvent('closePurchaseOrderModal'));
          }
          router.push('/account_payables/purchase'); // Redirect to purchase page
        },
        onError: (error: any) => {
          toast.error(
            `Failed to create Purchase Order: ${
              error.message || 'Unknown error'
            }`
          );
        },
      }
    );
  };

  // Function to reset form and table data
  const resetForm = () => {
    setOrderDate('');
    setRequiredDate('');
    setVendorId('');
    setSelectedVendor(null);
    setShipDate('');
    setStatus('PENDING');
    setShippingAddress('');
    setNote('');
    setPaymentTerms('');
    setSelectedPaymentMethod('');
    setErrors({});
    setFormSubmitted(false);

    // Reset table data in context
    context?.setData((prevData: any) => ({
      ...prevData,
      table: [],
    }));
  };

  // Helper function to render required field marker
  const RequiredMark = () => <span className="text-red-500 ml-1">*</span>;

  return (
    <>
      <div className="w-full max-w-5xl  px-2 min-w-5xl bg-transparent overflow-y-auto scroll gap-4">
        <div className="  ">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`${errors.orderDate ? 'error-field' : ''}`}>
              <DateInput
                label={'Order Date'}
                name="orderDate"
                value={orderDate ? new Date(orderDate) : undefined}
                onChange={(date) =>
                  handleInputChange('orderDate', date ? date.toISOString() : '')
                }
                placeholder="Select order date"
                required
                errors={errors.orderDate as any}
              />
            </div>

            <div className={`${errors.requiredDate ? 'error-field' : ''}`}>
              <DateInput
                label={'Due Date'}
                name="requiredDate"
                value={requiredDate ? new Date(requiredDate) : undefined}
                onChange={(date) =>
                  handleInputChange(
                    'requiredDate',
                    date ? date.toISOString() : ''
                  )
                }
                placeholder="Select required date"
                required
                errors={errors.requiredDate as any}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4"></div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className={`${errors.vendorId ? 'error-field' : ''}`}>
              <SearchSelect
                label={
                  <>
                    Vendor
                    <RequiredMark />
                  </>
                }
                options={vendorOptions}
                value={selectedVendor}
                onChange={(option: Option | null) => {
                  console.log(
                    'Vendor SearchSelect onChange called with:',
                    option
                  );
                  setSelectedVendor(option);
                  handleInputChange('vendorId', option?.value || '');

                  // Also update vendor name in context for PDF view
                  if (option) {
                    context?.setData((prevData: any) => ({
                      ...prevData,
                      vendorName: option.label,
                    }));
                  }
                }}
                isLoading={vendorsLoading}
                placeholder="Select a vendor..."
                isClearable={true}
                isSearchable={true}
              />
              {errors.vendorId && (
                <p className="text-red-500 text-sm mt-1">{errors.vendorId}</p>
              )}
            </div>
            <div className={` ${errors.shippingAddress ? 'error-field' : ''}`}>
              <Input
                type="text"
                label={
                  <>
                    Shipping Address
                    <RequiredMark />
                  </>
                }
                name="shippingAddress"
                value={shippingAddress}
                onchange={(e: any) =>
                  handleInputChange('shippingAddress', e.target.value)
                }
                errors={
                  errors.shippingAddress
                    ? { message: errors.shippingAddress }
                    : undefined
                }
              />
            </div>
          </div>
        </div>

        <div className="my-6">
          <h3 className="text-lg font-medium mb-2">
            Order Items
            <RequiredMark />
          </h3>
          <DynamicTable />
          {errors.lineItems && (
            <p className="text-red-500 text-sm mt-1">{errors.lineItems}</p>
          )}
        </div>

        <hr className="my-6" />
        <h3 className="text-lg font-medium mb-4">
          Payment Information
          <RequiredMark />
        </h3>
        <div className={`${errors.paymentMethod ? 'error-field' : ''}`}>
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
                  selectedPaymentMethod === option ||
                  (option === 'Credit Card' &&
                    selectedPaymentMethod === 'CREDIT_CARD') ||
                  (option === 'Bank Transfer' &&
                    selectedPaymentMethod === 'BANK_TRANSFER') ||
                  (option === 'ACH Transfer' &&
                    selectedPaymentMethod === 'ACH_TRANSAFER') ||
                  (option === 'Mobile Money' &&
                    selectedPaymentMethod === 'MOBILE_MONEY') ||
                  (option === 'Cash' && selectedPaymentMethod === 'CASH') ||
                  (option === 'Credit' && selectedPaymentMethod === 'CREDIT') ||
                  (option === 'Other' && selectedPaymentMethod === 'OTHER')
                    ? 'border-green-500 text-green-500'
                    : errors.paymentMethod && formSubmitted
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Checkbox
                    id={`payment-${option}`}
                    label=""
                    checked={
                      selectedPaymentMethod === option ||
                      (option === 'Credit Card' &&
                        selectedPaymentMethod === 'CREDIT_CARD') ||
                      (option === 'Bank Transfer' &&
                        selectedPaymentMethod === 'BANK_TRANSFER') ||
                      (option === 'ACH Transfer' &&
                        selectedPaymentMethod === 'ACH_TRANSAFER') ||
                      (option === 'Mobile Money' &&
                        selectedPaymentMethod === 'MOBILE_MONEY') ||
                      (option === 'Cash' && selectedPaymentMethod === 'CASH') ||
                      (option === 'Credit' &&
                        selectedPaymentMethod === 'CREDIT') ||
                      (option === 'Other' && selectedPaymentMethod === 'OTHER')
                    }
                    onChange={() => handlePaymentMethodClick(option)}
                    className="mr-2"
                  />
                  <span>{option.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
                </div>
              </div>
            ))}
            {errors.paymentMethod && (
              <p className="text-red-500 text-sm col-span-2">
                {errors.paymentMethod}
              </p>
            )}
          </div>

          <div className={`mt-4 ${errors.paymentTerms ? 'error-field' : ''}`}>
            <TextArea
              label="Payment Terms"
              name="paymentTerms"
              value={paymentTerms}
              onchange={(e: any) =>
                handleInputChange('paymentTerms', e.target.value)
              }
              placeholder="Specify payment terms and conditions (minimum 10 characters)"
              errors={errors.paymentTerms ? errors.paymentTerms : undefined}
            />
          </div>
        </div>

        <hr className="my-6" />
        <h3 className="text-lg font-medium mb-2">Additional Notes</h3>
        <TextArea
          name="note"
          value={note}
          onchange={(e: any) => handleInputChange('note', e.target.value)}
          className="h-36"
          placeholder="Add any notes or special instructions for this purchase order"
          errors={errors.note ? errors.note : undefined}
        />

        <div className="fixed bottom-0 left-0 right-0 p-2 bg-white border-t border-gray-200 flex justify-end space-x-3">
          <Button
            text={
              mutation.isPending
                ? 'Creating Purchase Order...'
                : 'Create Purchase Order'
            }
            onClick={handleSavePurchaseOrder}
            type="button"
          />
        </div>
      </div>
    </>
  );
};

export default Left;
