'use client'; // For Next.js 13+ App Directory
import Input from '@potta/components/input';
import SearchSelect from '@potta/components/search-select';
import { useContext, useState, useEffect, useRef, useCallback } from 'react';
import DynamicTable from './newtableInvoice';
import { ContextData } from '@potta/components/providers/DataProvider';
import useGetAllCustomers from '@potta/app/(routes)/customers/hooks/useGetAllCustomers';
import SliderCustomer from '@potta/app/(routes)/customers/components/customerSlider';
import Select from '@potta/components/select';
import { Customer } from '@potta/app/(routes)/customers/utils/types';
import TextArea from '@potta/components/textArea';
import { toast } from 'sonner';
import { DatePicker } from '@potta/components/ui/date-picker';
import { useRouter } from 'next/navigation';
import useCreateInvoice from '../../_hooks/useCreateInvoice';
import useUpdateInvoice from '../../_hooks/useUpdateInvoice';
import SearchableSelect from '@potta/components/searchableSelect';
import Checkbox from '@potta/components/checkbox';
import PaymentMethodSelect from '@potta/components/payment-method-select';
import {
  validateInvoiceForm,
  fieldSchemas,
} from '../validations/invoiceValidation';
import {
  DocumentBalanceDue,
  DocumentFormCard,
  DocumentFormFooter,
  DocumentFormShell,
  DocumentFooterLink,
  DocumentSectionTitle,
} from '@potta/components/document-form-layout';
import { Button as ShadcnButton } from '@/components/shadcn/button';
import {
  GeneratedNumberField,
  generateDocumentNumber,
  withDocumentAcronym,
} from '@potta/components/generated-number-field';
import {
  formatOrgAddress,
  orgDisplayName,
  useOrganizationProfile,
} from '@/hooks/use-organization-profile';
import { formatPartyAddress } from '@/lib/party-address';

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
  productId?: string;
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
  onOpenPreview?: () => void;
  /** @deprecated Prefer onOpenPreview */
  onTogglePreview?: () => void;
  showPreview?: boolean;
}

const Left = ({
  initialInvoiceType,
  isEditMode = false,
  originalInvoice,
  onSave,
  onOpenPreview,
  onTogglePreview,
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
  const [invoiceNumber, setInvoiceNumber] = useState(() =>
    generateDocumentNumber('INV'),
  );
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
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [paymentReference, setPaymentReference] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [sendLater, setSendLater] = useState(false);
  const [amountsAre, setAmountsAre] = useState<'exclusive' | 'inclusive'>('exclusive');
  const [isAddCustomerDrawer, setIsAddCustomerDrawer] = useState(false);
  const [taxRate, setTaxRate] = useState(0);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { data: org } = useOrganizationProfile();
  const sellerName = orgDisplayName(org) || 'Your organization';
  const sellerAddressLines = formatOrgAddress(org);

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

  // If the initialInvoiceType changes (shouldn't, but for safety), update state
  useEffect(() => {
    if (initialInvoiceType) {
      setInvioceType(mapTypeToLabel(initialInvoiceType));
      setInvoiceTypeDisabled(true);
    }
  }, [initialInvoiceType]);

  // Copy filled invoice data into the form. The provider starts as an empty
  // array, and publishing the invoice number stores a partial object — only
  // apply fields that are actually present so defaults stay selected.
  useEffect(() => {
    const source = context?.data;
    if (!source || Array.isArray(source)) return;
    if (source.issueDate) setIssueDate(source.issueDate);
    if (source.dueDate) setDueDate(source.dueDate);
    if (source.billing) setBillingAddress(source.billing);
    if (source.shipping) setShippingAddress(source.shipping);
    if (source.note) setNote(source.note);
    if (source.paymentTerms) setPaymentTerms(source.paymentTerms);
    if (source.paymentReference) setPaymentReference(source.paymentReference);
    if (source.taxRate != null && source.taxRate !== '') setTaxRate(source.taxRate);
    if (source.invoiceNumber) {
      setInvoiceNumber(withDocumentAcronym(String(source.invoiceNumber), 'INV'));
    }
    if (source.currency) setCurrency(source.currency);
    if (source.invoiceType) setInvioceType(source.invoiceType);
  }, [context?.data]);

  // The preview reads the shared form context, so publish the INV- number once.
  useEffect(() => {
    if (!context?.setData) return;
    const current = String(context.data?.invoiceNumber || '').trim();
    if (current) return;
    context.setData((prevData: any) => ({
      ...prevData,
      invoiceNumber,
    }));
  }, [context, invoiceNumber]);

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

  const handlePaymentMethodChange = (code: string) => {
    setSelectedPaymentMethod(code);

    if (errors.paymentMethod) {
      setErrors((prev) => ({ ...prev, paymentMethod: undefined }));
    }

    context?.setData((prevData: any) => ({
      ...prevData,
      payment_method: code,
      paymentMethod: code,
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
    const lineItems: LineItemsDto[] = tableData.map((item: TableItem) => {
      const line: LineItemsDto = {
        description: item.name,
        quantity: item.qty,
        discountCap: 0,
        discountType: 'PERCENTAGE_WITH_CAP',
        unitPrice: Number(item.price),
        taxRate: item.tax,
        discountRate: 0,
      };
      // Catalog lines keep productId; free-text services omit it
      if (item.uuid && !String(item.uuid).startsWith('custom-')) {
        line.productId = item.uuid;
      }
      return line;
    });

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
      paymentMethod: selectedPaymentMethod,
      invoiceNumber: withDocumentAcronym(invoiceNumber, 'INV'),
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
  const RequiredMark = () => <span className="ml-1 text-red-500">*</span>;

  const tableRows: TableItem[] = context?.data?.table || [];
  const lineSubtotal = tableRows.reduce(
    (sum, row) => sum + Number(row.qty || 0) * Number(row.price || 0),
    0,
  );
  const taxAmount = lineSubtotal * (Number(taxRate) || 0) / 100;
  const balanceDue = lineSubtotal + taxAmount;
  const money = (n: number) =>
    `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const selectedCustomerRecord = customers.find((c) => c.uuid === customerName);
  const resolvedEmail = customerEmail || selectedCustomerRecord?.email || '';

  const saving = isEditMode ? updateMutation.isPending : createMutation.isPending;
  const saveLabel = isEditMode
    ? updateMutation.isPending
      ? 'Updating…'
      : 'Update invoice'
    : createMutation.isPending
      ? 'Saving…'
      : 'Save';

  return (
    <>
      <DocumentFormShell>
        {/* Party + balance due */}
        <DocumentFormCard flush>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
              <div className={errors.customerName ? 'error-field' : ''}>
                <div className="flex items-end gap-2">
                  <div className="min-w-0 flex-1">
                    <SearchableSelect
                      label="Customer"
                      options={customerOptions}
                      selectedValue={customerName}
                      onChange={(value: string) => {
                        handleInputChange('customerName', value);
                        const selectedOption = customerOptions.find((option) => option.value === value);
                        setSelectedCustomer(
                          selectedOption
                            ? { label: selectedOption.label, value: selectedOption.value }
                            : null,
                        );
                        const cust = customers.find((c) => c.uuid === value);
                        setCustomerEmail(cust?.email || '');
                        const partyAddress = formatPartyAddress(cust?.address);
                        if (partyAddress) {
                          handleInputChange('billing', partyAddress);
                          if (!shippingAddress.trim()) {
                            handleInputChange('shipping', partyAddress);
                          }
                        }
                      }}
                      placeholder="Select a customer"
                      isDisabled={customersLoading}
                      required
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
                {errors.customerName ? (
                  <p className="mt-1 text-sm text-red-500">{errors.customerName}</p>
                ) : null}
              </div>
              <div>
                <Input
                  type="email"
                  label="Customer email"
                  name="customerEmail"
                  value={resolvedEmail}
                  onchange={(e: any) => setCustomerEmail(e.target.value)}
                />
                <label className="mt-2 flex items-center gap-2 text-sm text-black/70">
                  <Checkbox
                    id="send-later"
                    label="Send later"
                    checked={sendLater}
                    onChange={() => setSendLater((v) => !v)}
                  />
                </label>
              </div>
            </div>
            <DocumentBalanceDue amount={money(balanceDue)} />
          </div>
          {(sellerName || sellerAddressLines.length > 0) && (
            <div className="mt-4 border-t border-black/[0.06] pt-4 text-sm text-muted-foreground">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-black/45">
                From (your organization)
              </p>
              <p className="mt-1 font-medium text-foreground">{sellerName}</p>
              {sellerAddressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
              {org?.businessPhone ? <p>{org.businessPhone}</p> : null}
              {org?.businessEmail ? <p>{org.businessEmail}</p> : null}
            </div>
          )}
        </DocumentFormCard>

        {/* Dates / terms / number */}
        <DocumentFormCard flush>
          <DocumentSectionTitle>Invoice details</DocumentSectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <div className={errors.paymentTerms ? 'error-field' : ''}>
              <Select
                label="Terms"
                options={[
                  { label: 'Due on receipt', value: 'Due on receipt' },
                  { label: 'Net 15', value: 'Net 15' },
                  { label: 'Net 30', value: 'Net 30' },
                  { label: 'Net 60', value: 'Net 60' },
                ]}
                selectedValue={paymentTerms}
                onChange={(value: any) => handleInputChange('paymentTerms', value)}
                bg="bg-white"
                error={errors.paymentTerms}
              />
            </div>
            <div className={errors.issueDate ? 'error-field' : ''}>
              <DatePicker
                label="Invoice date"
                name="issueDate"
                value={issueDate}
                onChange={(value) => handleInputChange('issueDate', value)}
                placeholder="Select date"
                required
                error={errors.issueDate}
              />
            </div>
            <div className={errors.dueDate ? 'error-field' : ''}>
              <DatePicker
                label="Due date"
                name="dueDate"
                value={dueDate}
                min={issueDate || undefined}
                onChange={(value) => handleInputChange('dueDate', value)}
                placeholder="Select date"
                required
                error={errors.dueDate}
              />
            </div>
            <div>
              <GeneratedNumberField
                label="Invoice no."
                name="invoiceNumber"
                acronym="INV"
                value={invoiceNumber}
                onChange={(value) => handleInputChange('invoiceNumber', value)}
              />
            </div>
            <div className={errors.currency ? 'error-field' : ''}>
              <Select
                label="Currency"
                options={[
                  { label: 'XAF', value: 'XAF' },
                  { label: 'USD ($)', value: 'USD' },
                  { label: 'EUR (€)', value: 'EUR' },
                ]}
                selectedValue={currency}
                onChange={(value: any) => handleInputChange('currency', value)}
                bg="bg-white"
                error={errors.currency}
              />
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <div className={errors.taxRate ? 'error-field' : ''}>
                <Input
                  type="number"
                  label="Tax rate %"
                  name="taxRate"
                  value={taxRate}
                  onchange={(e: any) => handleInputChange('taxRate', e.target.value)}
                  errors={errors.taxRate}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 max-w-xs">
            <Select
              label="Amounts are"
              options={[
                { label: 'Exclusive of Tax', value: 'exclusive' },
                { label: 'Inclusive of Tax', value: 'inclusive' },
              ]}
              selectedValue={amountsAre}
              onChange={(value: any) => setAmountsAre(value)}
              bg="bg-white"
            />
          </div>
        </DocumentFormCard>

        {/* Addresses */}
        <DocumentFormCard flush>
          <DocumentSectionTitle>Addresses</DocumentSectionTitle>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className={errors.billingAddress ? 'error-field' : ''}>
              <TextArea
                label="Billing address"
                name="billing"
                value={billingAddress}
                onchange={(e: any) => handleInputChange('billing', e.target.value)}
                errors={errors.billingAddress}
              />
            </div>
            <div className={errors.shippingAddress ? 'error-field' : ''}>
              <TextArea
                label="Shipping address"
                name="shipping"
                value={shippingAddress}
                onchange={(e: any) => handleInputChange('shipping', e.target.value)}
                errors={errors.shippingAddress}
              />
            </div>
          </div>
        </DocumentFormCard>

        {/* Line items */}
        <DocumentFormCard flush>
          <DocumentSectionTitle>
            Product / service lines <RequiredMark />
          </DocumentSectionTitle>
          <DynamicTable />
          {errors.lineItems && (
            <p className="mt-2 text-sm text-red-500">{errors.lineItems}</p>
          )}
        </DocumentFormCard>

        {/* Message + payments + totals */}
        <DocumentFormCard flush>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-7">
              <div className={errors.notes ? 'error-field' : ''}>
                <TextArea
                  label="Message on invoice"
                  name="note"
                  value={note}
                  onchange={(e: any) => handleInputChange('note', e.target.value)}
                  errors={errors.notes}
                />
              </div>
              <div className="space-y-4 rounded-[2px] border border-black/[0.08] bg-main-bg/40 p-4">
                <PaymentMethodSelect
                  value={selectedPaymentMethod}
                  onChange={handlePaymentMethodChange}
                  error={errors.paymentMethod}
                />
                <div className={errors.paymentReference ? 'error-field' : ''}>
                  <GeneratedNumberField
                    label="Payment reference"
                    name="paymentReference"
                    value={paymentReference}
                    onChange={(value) => handleInputChange('paymentReference', value)}
                    errors={errors.paymentReference}
                  />
                </div>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="ml-auto w-full max-w-sm space-y-2 text-sm">
                <div className="flex justify-between text-black/70">
                  <span>Subtotal</span>
                  <span className="tabular-nums text-foreground">{money(lineSubtotal)}</span>
                </div>
                <div className="flex justify-between text-black/70">
                  <span>Tax</span>
                  <span className="tabular-nums text-foreground">{money(taxAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-black/[0.08] pt-3 text-base font-medium">
                  <span>Total</span>
                  <span className="tabular-nums">{money(balanceDue)}</span>
                </div>
                <div className="flex justify-between pt-1 text-base font-medium">
                  <span>Balance due</span>
                  <span className="tabular-nums text-primary">{money(balanceDue)}</span>
                </div>
              </div>
            </div>
          </div>
        </DocumentFormCard>
      </DocumentFormShell>

      <DocumentFormFooter
        left={
          <ShadcnButton
            type="button"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            onClick={() => router.push('/account_receivables/invoice')}
          >
            Cancel
          </ShadcnButton>
        }
        center={
          <>
            <DocumentFooterLink
              onClick={() => {
                if (onOpenPreview) onOpenPreview();
                else if (onTogglePreview) onTogglePreview();
                else toast.info('Preview is available from the header.');
              }}
            >
              Print or Preview
            </DocumentFooterLink>
            <DocumentFooterLink href="/account_receivables/recurring">
              Make recurring
            </DocumentFooterLink>
          </>
        }
        right={
          <>
            <ShadcnButton
              type="button"
              variant="outline"
              className="border-white/40 bg-white text-foreground hover:bg-white/90"
              onClick={handleSaveInvoice}
              disabled={saving}
            >
              {saveLabel}
            </ShadcnButton>
            <ShadcnButton
              type="button"
              className="bg-white/15 text-white hover:bg-white/25"
              onClick={handleSaveInvoice}
              disabled={saving}
            >
              {sendLater ? 'Save and close' : 'Save and send'}
            </ShadcnButton>
          </>
        }
      />

      <SliderCustomer
        open={isAddCustomerDrawer}
        setOpen={setIsAddCustomerDrawer}
        showTrigger={false}
      />
    </>
  );
};

export default Left;
