'use client'; // For Next.js 13+ App Directory
import Input from '@potta/components/input';
import SearchSelect from '@potta/components/search-select';
import { useContext, useState, useEffect, useRef } from 'react';
import DynamicTable from './newtableInvoice';
import Button from '@potta/components/button';
import { ContextData } from '@potta/components/providers/DataProvider';
import useGetAllVendors from '@potta/app/(routes)/vendors/hooks/useGetAllVendors';
import SliderVendor from '@potta/app/(routes)/vendors/components/vendorSlider';
import { toast } from 'sonner';
import TextArea from '@potta/components/textArea';
import useCreatePurchaseOrder from '../hooks/useCreatePurchase';
import { DatePicker } from '@potta/components/ui/date-picker';
import { useRouter } from 'next/navigation';
import PaymentMethodSelect from '@potta/components/payment-method-select';
import { DocumentLetterheadControls } from '@/components/documents/document-letterhead-controls';
import {
  DocumentFormCard,
  DocumentSectionTitle,
} from '@potta/components/document-form-layout';
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
  const {
    data: vendorData,
    isLoading: vendorsLoading,
    refetch: refetchVendors,
  } = useGetAllVendors({
    page: 1,
    limit: 100,
  });
  const vendors = vendorData?.data || [];

  // Form state variables
  const [orderDate, setOrderDate] = useState('');
  const [requiredDate, setRequiredDate] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Option | null>(null);
  const [addVendorOpen, setAddVendorOpen] = useState(false);
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

  const handlePaymentMethodChange = (code: string) => {
    setSelectedPaymentMethod(code);
    if (errors.paymentMethod) {
      setErrors((prev) => ({
        ...prev,
        paymentMethod: undefined,
      }));
    }
    context?.setData((prevData: any) => ({
      ...prevData,
      paymentMethod: code,
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
      <div className="scroll mx-auto flex w-full max-w-6xl flex-col gap-3 overflow-y-auto bg-white px-3 pb-20 sm:px-5 md:px-8 lg:px-10">
        <DocumentLetterheadControls flush />
        <DocumentFormCard flush className="mb-3">
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className={`${errors.orderDate ? 'error-field' : ''}`}>
              <DatePicker
                valueType="date"
                label={'Order Date'}
                name="orderDate"
                value={orderDate ? new Date(orderDate) : null}
                onChange={(date) =>
                  handleInputChange('orderDate', date ? date.toISOString() : '')
                }
                placeholder="Select order date"
                required
                error={errors.orderDate}
              />
            </div>

            <div className={`${errors.requiredDate ? 'error-field' : ''}`}>
              <DatePicker
                valueType="date"
                label={'Due Date'}
                name="requiredDate"
                value={requiredDate ? new Date(requiredDate) : null}
                onChange={(date) =>
                  handleInputChange(
                    'requiredDate',
                    date ? date.toISOString() : ''
                  )
                }
                placeholder="Select required date"
                required
                min={orderDate ? new Date(orderDate) : undefined}
                error={errors.requiredDate}
              />
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-4">
            <div className={`${errors.vendorId ? 'error-field' : ''}`}>
              <div className="flex items-end gap-2">
                <div className="min-w-0 flex-1">
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
                      setSelectedVendor(option);
                      handleInputChange('vendorId', option?.value || '');

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
                </div>
                <button
                  type="button"
                  onClick={() => setAddVendorOpen(true)}
                  className="mb-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-[2px] bg-primary text-white hover:bg-brand-hover"
                  aria-label="Add vendor"
                  title="Add vendor"
                >
                  <i className="ri-add-line text-xl" />
                </button>
              </div>
              {errors.vendorId && (
                <p className="mt-1 text-sm text-red-500">{errors.vendorId}</p>
              )}
            </div>
            <div className={`${errors.shippingAddress ? 'error-field' : ''}`}>
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
                inputClass="!bg-white"
              />
            </div>
          </div>
        </DocumentFormCard>

        <DocumentFormCard flush className="mb-3">
          <DocumentSectionTitle>
            Order Items
            <RequiredMark />
          </DocumentSectionTitle>
          <DynamicTable />
          {errors.lineItems && (
            <p className="mt-1 text-sm text-red-500">{errors.lineItems}</p>
          )}
        </DocumentFormCard>

        <DocumentFormCard flush className="mb-3">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-7">
              <DocumentSectionTitle>
                Payment Information
                <RequiredMark />
              </DocumentSectionTitle>
              <div
                className={`space-y-4 rounded-[2px] border border-black/[0.08] bg-white p-4 ${
                  errors.paymentMethod ? 'error-field' : ''
                }`}
              >
                <PaymentMethodSelect
                  value={selectedPaymentMethod}
                  onChange={handlePaymentMethodChange}
                  error={
                    formSubmitted && errors.paymentMethod
                      ? errors.paymentMethod
                      : undefined
                  }
                />
                <div className={errors.paymentTerms ? 'error-field' : ''}>
                  <TextArea
                    label="Payment Terms"
                    name="paymentTerms"
                    value={paymentTerms}
                    onchange={(e: any) =>
                      handleInputChange('paymentTerms', e.target.value)
                    }
                    placeholder="Specify payment terms and conditions (minimum 10 characters)"
                    errors={
                      errors.paymentTerms ? errors.paymentTerms : undefined
                    }
                  />
                </div>
              </div>
              <div className={errors.note ? 'error-field' : ''}>
                <TextArea
                  label="Additional Notes"
                  name="note"
                  value={note}
                  onchange={(e: any) =>
                    handleInputChange('note', e.target.value)
                  }
                  className="h-36"
                  placeholder="Add any notes or special instructions for this purchase order"
                  errors={errors.note ? errors.note : undefined}
                />
              </div>
            </div>
          </div>
        </DocumentFormCard>

        <div className="fixed bottom-0 left-0 right-0 flex justify-end space-x-3 border-t border-gray-200 bg-white p-2">
          <Button
            text={
              mutation.isPending
                ? 'Creating Purchase Order...'
                : 'Create Purchase Order'
            }
            isLoading={mutation.isPending}
            disabled={mutation.isPending}
            onClick={handleSavePurchaseOrder}
            type="button"
          />
        </div>
      </div>
      <SliderVendor
        open={addVendorOpen}
        setOpen={setAddVendorOpen}
        showTrigger={false}
        onCreated={(id) => {
          void refetchVendors().then((res) => {
            const list = res.data?.data ?? [];
            const created = id ? list.find((v: { uuid: string }) => v.uuid === id) : list[0];
            if (!created) return;
            const option = {
              label:
                created.name ||
                `Vendor ${created.vendorId || created.uuid.slice(0, 8)}`,
              value: created.uuid,
            };
            setSelectedVendor(option);
            handleInputChange('vendorId', created.uuid);
            context?.setData((prevData: any) => ({
              ...prevData,
              vendorName: option.label,
            }));
          });
        }}
      />
    </>
  );
};

export default Left;
