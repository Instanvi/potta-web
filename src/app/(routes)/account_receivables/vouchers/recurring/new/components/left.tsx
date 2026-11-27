'use client';
import Input from '@potta/components/input';
import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import DynamicTable from './newtableInvoice';
import { ContextData } from '@potta/components/providers/DataProvider';
import useGetAllCustomers from '@potta/app/(routes)/customers/hooks/useGetAllCustomers';
import SliderCustomer from '@potta/app/(routes)/customers/components/customerSlider';
import Select from '@potta/components/select';
import SearchableSelect from '@potta/components/searchableSelect';
import { Customer } from '@potta/app/(routes)/customers/utils/types';
import TextArea from '@potta/components/textArea';
import { DatePicker } from '@potta/components/ui/date-picker';
import { toast } from 'sonner';
import useCreateInvoice from '../../_hooks/useCreateInvoice';
import {
  GeneratedNumberField,
  generateDocumentNumber,
} from '@potta/components/generated-number-field';
import PaymentMethodSelect from '@potta/components/payment-method-select';
import { withOptionalDocumentFields } from '@/lib/document-api-fields';
import { useCustomerAddressFill } from '@/hooks/use-customer-address';
import {
  DocumentBalanceDue,
  DocumentFooterLink,
  DocumentFormCard,
  DocumentFormFooter,
  DocumentFormShell,
  DocumentSectionTitle,
} from '@potta/components/document-form-layout';
import { Button as ShadcnButton } from '@/components/shadcn/button';
import {
  formatOrgAddress,
  orgDisplayName,
  useOrganizationProfile,
} from '@/hooks/use-organization-profile';

// Define Option interface to match the one in SearchSelect component
interface Option {
  label: string;
  value: string;
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
  issueDate?: string;
  dueDate?: string;
  customerName?: string;
  billingAddress?: string;
  lineItems?: string;
  paymentMethod?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  occurrences?: string;
}

// Define recurring frequency options
const frequencyOptions = [
  { label: 'Weekly', value: 'Weekly' },
  { label: 'Bi-Weekly', value: 'BiWeekly' },
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Quarterly', value: 'Quarterly' },
  { label: 'Semi-Annually', value: 'SemiAnnually' },
  { label: 'Annually', value: 'Annually' },
];

const Left = ({ onOpenPreview }: { onOpenPreview?: () => void }) => {
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
    generateDocumentNumber('VCH'),
  );
  const [currency, setCurrency] = useState('USD');
  const [invoiceType, setInvioceType] = useState('Invoice');
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [isAddCustomerDrawer, setIsAddCustomerDrawer] = useState(false);
  const [taxRate, setTaxRate] = useState(0);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Recurring invoice specific states
  const [frequency, setFrequency] = useState('Monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [occurrences, setOccurrences] = useState('');
  const [isEndDateOption, setIsEndDateOption] = useState(true);

  useCustomerAddressFill(customerName, (address) => {
    if (!address) return;
    setBillingAddress(address);
    setShippingAddress(address);
    context?.setData((prevData: any) => ({
      ...prevData,
      billing: address,
      shipping: address,
    }));
  });

  // Create customer options with proper typing
  const customerOptions: Option[] = customers.map((customer: Customer) => ({
    label:
      customer.firstName ||
      customer.lastName ||
      `Customer ${customer.customerId || customer.uuid.slice(0, 8)}`,
    value: customer.uuid,
  }));

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
      case 'frequency':
        setFrequency(value);
        break;
      case 'startDate':
        setStartDate(value);
        break;
      case 'endDate':
        setEndDate(value);
        break;
      case 'occurrences':
        setOccurrences(value);
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

  const validateForm = () => {
    const newErrors: ValidationErrors = {};

    // Required field validation
    if (!issueDate) newErrors.issueDate = 'Issue date is required';
    if (!dueDate) newErrors.dueDate = 'Due date is required';
    if (!customerName) newErrors.customerName = 'Customer is required';
    if (!selectedPaymentMethod)
      newErrors.paymentMethod = 'Payment method is required';
    if (!frequency) newErrors.frequency = 'Frequency is required';
    if (!startDate) newErrors.startDate = 'Start date is required';

    // Validate end date or occurrences based on selection
    if (isEndDateOption) {
      if (!endDate) newErrors.endDate = 'End date is required';
      if (endDate && new Date(endDate) <= new Date(startDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    } else {
      if (!occurrences || parseInt(occurrences) <= 0) {
        newErrors.occurrences = 'Number of occurrences must be greater than 0';
      }
    }

    // Check if there are line items
    const tableData = context?.data?.table || [];
    if (tableData.length === 0)
      newErrors.lineItems = 'At least one item is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutation = useCreateInvoice();
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
      discountType: 'PercentageWithCap',
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

    const InvoiceData = withOptionalDocumentFields(
      {
        issuedDate: issueDate,
        dueDate: dueDate,
        invoiceType: invoiceType,
        currency: currency,
        taxRate: Number(taxRate),
        totalAmount: totalAmount,
        paymentReference: paymentReference || undefined,
        paymentMethod: selectedPaymentMethod || undefined,
        invoiceNumber: invoiceNumber,
        discountAmount: 0,
        customerId: customerName,
        salePersonId: 'c9c0c3a4-353f-4907-a342-ae64e629936f',
        lineItems: lineItems,
        isRecurring: true,
        frequency: frequency,
        startDate: startDate,
        endDate: isEndDateOption ? endDate : null,
        occurrences: !isEndDateOption ? parseInt(occurrences) : null,
      },
      {
        shippingAddress,
        billingAddress,
        paymentTerms,
        notes: note,
      },
    );

    // Save to context
    context?.setData((prevData: any) => ({
      ...prevData,
      saleReceipt: InvoiceData,
    }));

    console.log('Raw Recurring Invoice Data:', InvoiceData);
    mutation.mutate(InvoiceData, {
      onSuccess: () => {
        toast.success(
          `Recurring ${InvoiceData.invoiceType} created successfully`
        );
        // You can add navigation or other actions here after successful creation
      },
      onError: (error: any) => {
        toast.error(
          `Failed to create Recurring Invoice: ${
            error.message || 'Unknown error'
          }`
        );
        console.error(
          'Error creating Recurring Invoice Please Try again later:',
          error
        );
      },
    });
  };

  const RequiredMark = () => <span className="ml-1 text-red-500">*</span>;

  const { data: org } = useOrganizationProfile();
  const sellerName = orgDisplayName(org) || 'Your organization';
  const sellerAddressLines = formatOrgAddress(org);

  const tableRows: TableItem[] = context?.data?.table || [];
  const lineSubtotal = tableRows.reduce(
    (sum, row) => sum + Number(row.qty || 0) * Number(row.price || 0),
    0,
  );
  const taxAmount = (lineSubtotal * (Number(taxRate) || 0)) / 100;
  const balanceDue = lineSubtotal + taxAmount;
  const money = (n: number) =>
    `${currency} ${n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <DocumentFormShell className="pb-6">
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
                          const selectedOption = customerOptions.find(
                            (option) => option.value === value,
                          );
                          setSelectedCustomer(selectedOption ?? null);
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

          <DocumentFormCard flush>
            <DocumentSectionTitle>Voucher details</DocumentSectionTitle>
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className={errors.issueDate ? 'error-field' : ''}>
                <DatePicker
                  label="Issued date"
                  required
                  name="issueDate"
                  value={issueDate}
                  onChange={(value) => handleInputChange('issueDate', value)}
                  placeholder="Select date"
                  error={errors.issueDate}
                />
              </div>
              <div className={errors.dueDate ? 'error-field' : ''}>
                <DatePicker
                  label="Due date"
                  required
                  name="dueDate"
                  value={dueDate}
                  min={issueDate || undefined}
                  onChange={(value) => handleInputChange('dueDate', value)}
                  placeholder="Select date"
                  error={errors.dueDate}
                />
              </div>
              <GeneratedNumberField
                label="Voucher no."
                name="invoiceNumber"
                acronym="VCH"
                value={invoiceNumber}
                onChange={(value) => handleInputChange('invoiceNumber', value)}
              />
              <Select
                label="Currency"
                options={[
                  { label: 'XAF', value: 'XAF' },
                  { label: 'USD ($)', value: 'USD' },
                  { label: 'EUR (€)', value: 'EUR' },
                ]}
                selectedValue={currency}
                onChange={(value: string) => handleInputChange('currency', value)}
                bg="bg-white"
              />
              <Input
                type="number"
                label="Tax rate %"
                name="taxRate"
                value={taxRate}
                onchange={(e) => handleInputChange('taxRate', e.target.value)}
              />
            </div>
          </DocumentFormCard>

          <DocumentFormCard flush>
            <DocumentSectionTitle>Recurring schedule</DocumentSectionTitle>
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className={errors.frequency ? 'error-field' : ''}>
                <Select
                  label="Frequency"
                  required
                  options={frequencyOptions}
                  selectedValue={frequency}
                  onChange={(value: string) => handleInputChange('frequency', value)}
                  bg="bg-white"
                  error={errors.frequency}
                />
              </div>
              <div className={errors.startDate ? 'error-field' : ''}>
                <DatePicker
                  label="Start date"
                  required
                  name="startDate"
                  value={startDate}
                  onChange={(value) => handleInputChange('startDate', value)}
                  placeholder="Select date"
                  error={errors.startDate}
                />
              </div>
              <div className="sm:col-span-2">
                <span className="mb-1 block text-sm font-normal text-foreground">Ends</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEndDateOption(true)}
                    className={`h-9 rounded-[2px] border px-3 text-sm ${
                      isEndDateOption
                        ? 'border-primary bg-primary text-white'
                        : 'border-black/15 bg-white text-foreground hover:bg-accent'
                    }`}
                  >
                    On a date
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEndDateOption(false)}
                    className={`h-9 rounded-[2px] border px-3 text-sm ${
                      !isEndDateOption
                        ? 'border-primary bg-primary text-white'
                        : 'border-black/15 bg-white text-foreground hover:bg-accent'
                    }`}
                  >
                    After a number of times
                  </button>
                </div>
              </div>
              {isEndDateOption ? (
                <div className={errors.endDate ? 'error-field' : ''}>
                  <DatePicker
                    label="End date"
                    required
                    name="endDate"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(value) => handleInputChange('endDate', value)}
                    placeholder="Select date"
                    error={errors.endDate}
                  />
                </div>
              ) : (
                <div className={errors.occurrences ? 'error-field' : ''}>
                  <Input
                    type="number"
                    label="Number of occurrences"
                    name="occurrences"
                    required
                    value={occurrences}
                    min={1}
                    placeholder="e.g. 12"
                    onchange={(e) => handleInputChange('occurrences', e.target.value)}
                    errors={errors.occurrences ? { message: errors.occurrences } : undefined}
                  />
                </div>
              )}
            </div>
          </DocumentFormCard>

          <DocumentFormCard flush>
            <DocumentSectionTitle>Addresses</DocumentSectionTitle>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextArea
                label="Billing address"
                name="billing"
                value={billingAddress}
                onchange={(e) => handleInputChange('billing', e.target.value)}
              />
              <TextArea
                label="Shipping address"
                name="shipping"
                value={shippingAddress}
                onchange={(e) => handleInputChange('shipping', e.target.value)}
              />
            </div>
          </DocumentFormCard>

          <DocumentFormCard flush>
            <DocumentSectionTitle>
              Product / service lines
              <RequiredMark />
            </DocumentSectionTitle>
            <div className={errors.lineItems ? 'error-field' : ''}>
              <DynamicTable showSummary={false} />
              {errors.lineItems ? (
                <p className="mt-2 text-sm text-red-500">{errors.lineItems}</p>
              ) : null}
            </div>
          </DocumentFormCard>

          <DocumentFormCard flush>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-7">
                <TextArea
                  label="Message on voucher"
                  name="note"
                  value={note}
                  onchange={(e) => handleInputChange('note', e.target.value)}
                />
                <div className="space-y-4 rounded-[2px] border border-black/[0.08] bg-main-bg/40 p-4">
                  <PaymentMethodSelect
                    value={selectedPaymentMethod}
                    onChange={handlePaymentMethodChange}
                    error={errors.paymentMethod}
                    required
                  />
                  <GeneratedNumberField
                    label="Payment reference"
                    name="paymentReference"
                    value={paymentReference}
                    onChange={(value) => handleInputChange('paymentReference', value)}
                  />
                  <TextArea
                    label="Payment terms"
                    name="paymentTerms"
                    value={paymentTerms}
                    onchange={(e) => handleInputChange('paymentTerms', e.target.value)}
                  />
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
      </div>

      <DocumentFormFooter
        left={
          <ShadcnButton
            type="button"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            onClick={() => router.push('/account_receivables/vouchers/recurring')}
          >
            Cancel
          </ShadcnButton>
        }
        center={
          onOpenPreview ? (
            <DocumentFooterLink onClick={onOpenPreview}>Print or Preview</DocumentFooterLink>
          ) : null
        }
        right={
          <ShadcnButton
            type="button"
            className="bg-white text-foreground hover:bg-white/90"
            onClick={handleSaveInvoice}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Saving…' : 'Save'}
          </ShadcnButton>
        }
      />

      <SliderCustomer
        open={isAddCustomerDrawer}
        setOpen={setIsAddCustomerDrawer}
        showTrigger={false}
      />
    </div>
  );
};

export default Left;
