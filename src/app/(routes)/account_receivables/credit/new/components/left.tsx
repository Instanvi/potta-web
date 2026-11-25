'use client';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Select from '@potta/components/select';
import SearchableSelect, {
  Option as SearchableSelectOption,
} from '@potta/components/searchableSelect';
import TextArea from '@potta/components/textArea';
import { DatePicker } from '@potta/components/ui/date-picker';
import { ContextData } from '@potta/components/providers/DataProvider';
import useGetAllCustomers from '@potta/app/(routes)/customers/hooks/useGetAllCustomers';
import SliderCustomer from '@potta/app/(routes)/customers/components/customerSlider';
import { Customer } from '@potta/app/(routes)/customers/utils/types';
import {
  DocumentBalanceDue,
  DocumentFooterLink,
  DocumentFormCard,
  DocumentFormFooter,
  DocumentFormShell,
  DocumentSectionTitle,
} from '@potta/components/document-form-layout';
import { Button as ShadcnButton } from '@/components/shadcn/button';
import { Can } from '@/components/auth/can';
import CreditNoteForm from './newtableInvoice';
import { useCreateCreditNote, useCustomerInvoices } from '../../_hooks';
import { CreateCreditNotePayload } from '../../_utils/types';
import {
  computeCreditAmount,
  serializeLineItems,
} from '../../_utils/lines';

interface ValidationErrors {
  customerName?: string;
  issueDate?: string;
  reason?: string;
  lineItems?: string;
}

interface LeftProps {
  onOpenPreview?: () => void;
}

const DEFAULT_CURRENCY = 'USD';

/** Blank document state shared with the invoice/bill forms (they all use ContextData.data). */
const freshDocumentState = () => ({ currency: DEFAULT_CURRENCY, table: [] });

const Left = ({ onOpenPreview }: LeftProps) => {
  const context = useContext(ContextData);
  const router = useRouter();
  const setContextData = context?.setData;

  const { data, isLoading: customersLoading } = useGetAllCustomers({
    page: 1,
    limit: 100,
  });
  const customers: Customer[] = data?.data || [];

  const [issueDate, setIssueDate] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  /** Single field used as both API `reason` and `notes`. */
  const [note, setNote] = useState('');
  const [isAddCustomerDrawer, setIsAddCustomerDrawer] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Reset shared document state on mount (and on leave) so invoice/bill lines never leak in.
  useEffect(() => {
    setContextData?.(freshDocumentState());
    return () => setContextData?.(freshDocumentState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setContextField = (key: string, value: unknown) =>
    setContextData?.((prev: any) => ({ ...prev, [key]: value }));

  const customerOptions: SearchableSelectOption[] = customers.map(
    (customer: Customer) => ({
      label:
        [customer.firstName, customer.lastName].filter(Boolean).join(' ') ||
        `Customer ${customer.customerId || customer.uuid.slice(0, 8)}`,
      value: customer.uuid,
    })
  );

  const { data: invoicesData, isLoading: invoicesLoading } =
    useCustomerInvoices(customerId);
  const invoiceOptions: SearchableSelectOption[] = useMemo(
    () =>
      ((invoicesData?.data ?? []) as any[]).map((inv) => ({
        value: inv.uuid,
        label: `${inv.invoiceNumber || inv.invoiceId || inv.code} · ${Number(
          inv.invoiceTotal ?? 0
        ).toLocaleString()} ${inv.currency ?? ''}`.trim(),
      })),
    [invoicesData]
  );

  const clearError = (key: keyof ValidationErrors) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const handleCustomerChange = (value: string) => {
    setCustomerId(value);
    setInvoiceId('');
    clearError('customerName');
    setContextData?.((prev: any) => ({
      ...prev,
      customerName: value,
      invoiceId: '',
    }));
  };

  const handleInvoiceChange = (value: string) => {
    setInvoiceId(value);
    setContextField('invoiceId', value);
  };

  const handleIssueDateChange = (value: string) => {
    setIssueDate(value);
    clearError('issueDate');
    setContextField('issueDate', value);
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    setContextField('currency', value);
  };

  const handleNoteChange = (value: string) => {
    setNote(value);
    clearError('reason');
    // Keep preview + API in sync: notes and reason are the same text.
    setContextData?.((prev: any) => ({
      ...prev,
      note: value,
      reason: value,
    }));
  };

  const tableRows = context?.data?.table || [];
  const creditAmount = computeCreditAmount(tableRows);
  const money = (n: number) =>
    `${currency} ${n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  useEffect(() => {
    setContextData?.((prev: any) =>
      Number(prev?.creditAmount) === creditAmount
        ? prev
        : { ...prev, creditAmount }
    );
  }, [creditAmount, setContextData]);

  const validateForm = () => {
    const next: ValidationErrors = {};
    if (!customerId) next.customerName = 'Customer is required';
    if (!issueDate) next.issueDate = 'Issue date is required';
    if (!note.trim()) next.reason = 'Notes / reason is required';
    if (serializeLineItems(tableRows).length === 0 || creditAmount <= 0) {
      next.lineItems = 'Add at least one line with a quantity and price';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const mutation = useCreateCreditNote();

  const handleSave = () => {
    if (!validateForm()) {
      setTimeout(() => {
        document
          .querySelector('.error-field')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);
      return;
    }

    const text = note.trim();
    const payload: CreateCreditNotePayload = {
      customerId,
      issueDate,
      creditAmount,
      reason: text,
      notes: text,
      currency,
      lineItems: serializeLineItems(tableRows),
      ...(invoiceId ? { invoiceId } : {}),
    };

    mutation.mutate(payload, {
      onSuccess: () => router.push('/account_receivables/credit'),
    });
  };

  const RequiredMark = () => <span className="ml-1 text-red-500">*</span>;

  return (
    <>
      <DocumentFormShell className="bg-white">
          {/* Customer + invoice + amount */}
          <DocumentFormCard flush>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                <div className={errors.customerName ? 'error-field' : ''}>
                  <div className="flex items-end gap-2">
                    <div className="min-w-0 flex-1">
                      <SearchableSelect
                        label="Customer"
                        options={customerOptions}
                        selectedValue={customerId}
                        onChange={handleCustomerChange}
                        placeholder="Select a customer"
                        isDisabled={customersLoading}
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddCustomerDrawer(true)}
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-brand-hover"
                      aria-label="Add customer"
                    >
                      <i className="ri-add-line text-xl" />
                    </button>
                  </div>
                  {errors.customerName ? (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.customerName}
                    </p>
                  ) : null}
                </div>
                <div>
                  <SearchableSelect
                    label="Invoice"
                    options={invoiceOptions}
                    selectedValue={invoiceId}
                    onChange={handleInvoiceChange}
                    placeholder={
                      !customerId
                        ? 'Select a customer first'
                        : !invoicesLoading && invoiceOptions.length === 0
                          ? 'No invoices for this customer'
                          : 'Select an invoice'
                    }
                    isDisabled={!customerId || invoicesLoading}
                  />
                </div>
              </div>
              <DocumentBalanceDue label="Credit amount" amount={money(creditAmount)} />
            </div>
          </DocumentFormCard>

          {/* Credit meta */}
          <DocumentFormCard flush>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className={errors.issueDate ? 'error-field' : ''}>
                <DatePicker
                  label="Issue date"
                  name="issueDate"
                  value={issueDate}
                  onChange={handleIssueDateChange}
                  placeholder="Select date"
                  required
                  error={errors.issueDate}
                />
              </div>
              <div>
                <Select
                  label="Currency"
                  options={[
                    { label: 'XAF', value: 'XAF' },
                    { label: 'USD ($)', value: 'USD' },
                    { label: 'EUR (€)', value: 'EUR' },
                  ]}
                  selectedValue={currency}
                  onChange={handleCurrencyChange}
                  bg="bg-white"
                />
              </div>
            </div>
          </DocumentFormCard>

          {/* Line items */}
          <DocumentFormCard flush>
            <DocumentSectionTitle>
              Product / service lines <RequiredMark />
            </DocumentSectionTitle>
            <div className={errors.lineItems ? 'error-field' : ''}>
              <CreditNoteForm />
              {errors.lineItems ? (
                <p className="mt-2 text-sm text-red-500">{errors.lineItems}</p>
              ) : null}
            </div>
          </DocumentFormCard>

          {/* Notes doubles as the API reason — kept next to the lines section. */}
          <DocumentFormCard flush>
            <div className={errors.reason ? 'error-field' : ''}>
              <TextArea
                label="Notes / reason *"
                name="note"
                value={note}
                placeholder="e.g. Returned goods, billing error"
                onchange={(e: any) => handleNoteChange(e.target.value)}
              />
              {errors.reason ? (
                <p className="mt-1 text-sm text-red-500">{errors.reason}</p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  Saved as both the credit note reason and notes.
                </p>
              )}
            </div>
          </DocumentFormCard>
      </DocumentFormShell>

      <DocumentFormFooter
        left={
          <ShadcnButton
            type="button"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            onClick={() => router.push('/account_receivables/credit')}
          >
            Cancel
          </ShadcnButton>
        }
        center={
          <DocumentFooterLink onClick={() => onOpenPreview?.()}>
            Print or Preview
          </DocumentFooterLink>
        }
        right={
          <Can resource="CreditNote" action="create">
            <ShadcnButton
              type="button"
              variant="outline"
              className="border-white/40 bg-white text-foreground hover:bg-white/90"
              onClick={handleSave}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving…' : 'Save'}
            </ShadcnButton>
          </Can>
        }
      />

      <SliderCustomer
        open={isAddCustomerDrawer}
        setOpen={setIsAddCustomerDrawer}
      />
    </>
  );
};

export default Left;
