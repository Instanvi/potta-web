'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, Resolver, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'sonner';
import Button from '@potta/components/button';
import Input from '@potta/components/input';
import Select from '@potta/components/select';
import SearchableSelect from '@potta/components/searchableSelect';
import TextArea from '@potta/components/textArea';
import { FormDatePicker } from '@potta/components/ui/date-picker';
import { apiErrorMessage, formatDate, today, toDateInput } from '../../../../_shared/format';
import { usePurchaseOrderOptions, useVendorOptions } from '../../../hooks';
import { apLookupsApi } from '../../../utils/api';
import { formatMoney } from '../../../utils/format';
import { useCreateBill } from '../../hooks';
import { BillCurrency, PAYMENT_METHODS, PaymentMethod } from '../../utils/types';
import { BillFormValues, billSchema, lineTotals } from '../validations/billValidation';
import LineItemsEditor, { DEFAULT_TAX_RATE, emptyLine } from './LineItemsEditor';
import {
  DocumentBalanceDue,
  DocumentFormCard,
  DocumentFormFooter,
  DocumentFormShell,
  DocumentFooterLink,
  DocumentSectionTitle,
} from '@potta/components/document-form-layout';
import { Button as ShadcnButton } from '@/components/shadcn/button';

const CURRENCIES: { value: BillCurrency; label: string }[] = [
  { value: 'XAF', label: 'XAF (FCFA)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
];

const RequiredMark = () => <span className="text-red-500">*</span>;

const addDays = (date: string, days: number) => {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toDateInput(d);
};

interface BillFormProps {
  /** `sheet`: rendered inside the half-screen slide-over (stacked layout, sheet-relative footer). */
  variant?: 'page' | 'sheet';
  /** Called after save (with the new bill id) or cancel; defaults to navigating back to the bills list. */
  onDone?: (billId?: string) => void;
}

const BillForm = ({ variant = 'page', onDone }: BillFormProps) => {
  const router = useRouter();
  const inSheet = variant === 'sheet';
  const createBill = useCreateBill();
  const { data: vendors = [], isLoading: vendorsLoading } = useVendorOptions();
  const [copyingLines, setCopyingLines] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BillFormValues>({
    resolver: yupResolver(billSchema) as unknown as Resolver<BillFormValues>,
    defaultValues: {
      vendorId: '',
      purchaseOrderId: '',
      vendorInvoiceNumber: '',
      issueDate: today(),
      dueDate: addDays(today(), 30),
      currency: 'XAF',
      paymentMethod: 'BANK_TRANSFER',
      expenseAccountCode: '601',
      notes: '',
      lineItems: [emptyLine()],
    },
  });

  const vendorId = useWatch({ control, name: 'vendorId' });
  const purchaseOrderId = useWatch({ control, name: 'purchaseOrderId' });
  const currency = useWatch({ control, name: 'currency' });
  const issueDate = useWatch({ control, name: 'issueDate' });
  const lines = useWatch({ control, name: 'lineItems' }) ?? [];
  const expenseAccountCode = useWatch({ control, name: 'expenseAccountCode' });
  const { data: purchaseOrders = [], isFetching: ordersLoading } = usePurchaseOrderOptions(vendorId || undefined);

  const summary = useMemo(
    () =>
      lines.reduce(
        (acc, line) => {
          const t = lineTotals(line ?? {});
          acc.subtotal += t.gross;
          acc.discount += t.discount;
          acc.tax += t.tax;
          acc.total += t.total;
          return acc;
        },
        { subtotal: 0, discount: 0, tax: 0, total: 0 }
      ),
    [lines]
  );

  const copyLinesFromOrder = async () => {
    if (!purchaseOrderId) return;
    setCopyingLines(true);
    try {
      const orderLines = await apLookupsApi.purchaseOrderLines(purchaseOrderId);
      if (orderLines.length === 0) {
        toast.info('This purchase order has no line items');
        return;
      }
      setValue(
        'lineItems',
        orderLines.map((l) => ({
          description: l.description || 'Item',
          quantity: Number(l.quantity ?? 1),
          unitPrice: Number(l.unitPrice ?? 0),
          taxRate: l.taxRate != null ? Number(l.taxRate) : DEFAULT_TAX_RATE,
          discountAmount: Number(l.discountAmount ?? 0),
          productId: l.product?.uuid,
        })),
        { shouldValidate: true }
      );
      toast.success(`Copied ${orderLines.length} line(s) from the purchase order`);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Could not load the purchase order lines'));
    } finally {
      setCopyingLines(false);
    }
  };

  const onSubmit = (values: BillFormValues) => {
    createBill.mutate(
      {
        vendorId: values.vendorId,
        purchaseOrderId: values.purchaseOrderId || undefined,
        vendorInvoiceNumber: values.vendorInvoiceNumber?.trim() || undefined,
        issueDate: values.issueDate,
        dueDate: values.dueDate,
        currency: values.currency,
        paymentMethod: values.paymentMethod,
        expenseAccountCode: values.expenseAccountCode.trim(),
        notes: values.notes?.trim() || undefined,
        lineItems: values.lineItems.map((l) => ({
          description: l.description.trim(),
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          taxRate: l.taxRate != null ? Number(l.taxRate) : undefined,
          discountAmount: l.discountAmount ? Number(l.discountAmount) : undefined,
          productId: l.productId || undefined,
        })),
      },
      {
        onSuccess: (bill) =>
          onDone ? onDone(bill.uuid) : router.push(`/account_payables/bills?id=${bill.uuid}`),
      }
    );
  };

  const fields = (
    <>
      <DocumentFormCard flush={!inSheet}>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="vendorId"
              render={({ field }) => (
                <SearchableSelect
                  label="Vendor"
                  required
                  options={vendors.map((v) => ({ label: v.name, value: v.uuid }))}
                  selectedValue={field.value}
                  onChange={(value: string) => {
                    field.onChange(value);
                    setValue('purchaseOrderId', '');
                    const vendor = vendors.find((v) => v.uuid === value);
                    const vendorCurrency = CURRENCIES.find((c) => c.value === vendor?.currency)?.value;
                    if (vendorCurrency) setValue('currency', vendorCurrency);
                  }}
                  placeholder={vendorsLoading ? 'Loading vendors…' : 'Select a vendor'}
                  isDisabled={vendorsLoading}
                  error={errors.vendorId?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="purchaseOrderId"
              render={({ field }) => (
                <div>
                  <SearchableSelect
                    label="Purchase order"
                    options={purchaseOrders.map((po) => ({
                      value: po.uuid,
                      label: `${po.orderNumber || po.purchaseOrderId || po.uuid.slice(0, 8)} · ${formatDate(
                        po.orderDate,
                      )} · ${formatMoney(po.orderTotal, currency)}`,
                    }))}
                    selectedValue={field.value}
                    onChange={(value: string) => field.onChange(value)}
                    placeholder={
                      !vendorId
                        ? 'Select a vendor first'
                        : ordersLoading
                          ? 'Loading orders…'
                          : purchaseOrders.length === 0
                            ? 'No purchase orders'
                            : 'Link a purchase order…'
                    }
                    isDisabled={!vendorId || purchaseOrders.length === 0}
                  />
                  {purchaseOrderId && (
                    <button
                      type="button"
                      disabled={copyingLines}
                      onClick={copyLinesFromOrder}
                      className="mt-1 text-sm font-medium text-primary hover:underline disabled:opacity-50"
                    >
                      {copyingLines ? 'Copying lines…' : 'Copy lines from order'}
                    </button>
                  )}
                </div>
              )}
            />
          </div>
          <DocumentBalanceDue amount={formatMoney(summary.total, currency)} />
        </div>
      </DocumentFormCard>

      <DocumentFormCard flush={!inSheet}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-2">
            <Input
              type="text"
              name="vendorInvoiceNumber"
              label="Bill no."
              placeholder="e.g. INV-0042"
              register={register}
              errors={errors.vendorInvoiceNumber}
            />
          </div>
          <div className="md:col-span-2">
            <FormDatePicker control={control} name="issueDate" label="Bill date" required />
          </div>
          <div className="md:col-span-2">
            <FormDatePicker control={control} name="dueDate" label="Due date" required min={issueDate} />
          </div>
          <div className="md:col-span-2">
            <Controller
              control={control}
              name="currency"
              render={({ field }) => (
                <Select
                  label="Currency"
                  options={CURRENCIES}
                  selectedValue={field.value}
                  onChange={(v: BillCurrency) => field.onChange(v)}
                  bg="bg-white"
                />
              )}
            />
          </div>
          <div className="md:col-span-2">
            <Input
              type="text"
              name="expenseAccountCode"
              label="Expense account"
              required
              register={register}
              errors={errors.expenseAccountCode}
            />
          </div>
          <div className="md:col-span-2">
            <Controller
              control={control}
              name="paymentMethod"
              render={({ field }) => (
                <Select
                  label="Payment method"
                  options={PAYMENT_METHODS.filter((m) => m.value !== 'CREDIT')}
                  selectedValue={field.value}
                  onChange={(v: PaymentMethod) => field.onChange(v)}
                  bg="bg-white"
                />
              )}
            />
          </div>
        </div>
      </DocumentFormCard>

      <DocumentFormCard flush={!inSheet}>
        <DocumentSectionTitle>
          Product / service lines <RequiredMark />
        </DocumentSectionTitle>
        <LineItemsEditor control={control} register={register} errors={errors} currency={currency} />
      </DocumentFormCard>

      <DocumentFormCard flush={!inSheet}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <TextArea
              name="notes"
              label="Message on bill"
              placeholder="Notes visible on this bill"
              register={register}
              errors={errors.notes}
            />
            <p className="mt-3 text-xs text-black/60">
              Saved as a draft. Approving posts Dr {expenseAccountCode || '601'} expense + Dr 445 VAT / Cr
              vendor payable.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="ml-auto w-full max-w-sm space-y-2 text-sm">
              <div className="flex justify-between text-black/70">
                <span>Subtotal</span>
                <span className="tabular-nums text-foreground">
                  {formatMoney(summary.subtotal, currency)}
                </span>
              </div>
              <div className="flex justify-between text-black/70">
                <span>Discounts</span>
                <span className="tabular-nums text-foreground">
                  −{formatMoney(summary.discount, currency)}
                </span>
              </div>
              <div className="flex justify-between text-black/70">
                <span>VAT</span>
                <span className="tabular-nums text-foreground">
                  {formatMoney(summary.tax, currency)}
                </span>
              </div>
              <div className="flex justify-between border-t border-black/[0.08] pt-3 text-base font-medium">
                <span>Total</span>
                <span className="tabular-nums">{formatMoney(summary.total, currency)}</span>
              </div>
              <div className="flex justify-between pt-1 text-base font-medium">
                <span>Balance due</span>
                <span className="tabular-nums text-primary">
                  {formatMoney(summary.total, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DocumentFormCard>
    </>
  );

  if (inSheet) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4 pb-2">
        {fields}
        <div className="sticky bottom-0 z-20 -mx-4 flex justify-between gap-3 border-t border-black/10 bg-white p-3 sm:-mx-6">
          <Button
            text="Cancel"
            type="button"
            theme="gray"
            color
            onClick={() => (onDone ? onDone() : router.push('/account_payables/bills'))}
          />
          <Button
            text="Save bill"
            type="submit"
            isLoading={createBill.isPending}
            disabled={createBill.isPending}
          />
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DocumentFormShell>{fields}</DocumentFormShell>
      <DocumentFormFooter
        left={
          <ShadcnButton
            type="button"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            onClick={() => (onDone ? onDone() : router.push('/account_payables/bills'))}
          >
            Cancel
          </ShadcnButton>
        }
        center={
          <DocumentFooterLink onClick={() => toast.info('Print / preview opens after save.')}>
            Print or Preview
          </DocumentFooterLink>
        }
        right={
          <>
            <ShadcnButton
              type="submit"
              variant="outline"
              className="border-white/30 bg-white text-foreground hover:bg-white/90"
              disabled={createBill.isPending}
            >
              {createBill.isPending ? 'Saving…' : 'Save'}
            </ShadcnButton>
            <ShadcnButton
              type="submit"
              className="bg-white/15 text-white hover:bg-white/25"
              disabled={createBill.isPending}
            >
              {createBill.isPending ? 'Saving…' : 'Save and close'}
            </ShadcnButton>
          </>
        }
      />
    </form>
  );
};

export default BillForm;
