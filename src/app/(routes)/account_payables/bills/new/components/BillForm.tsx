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

const BillForm = () => {
  const router = useRouter();
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
      { onSuccess: (bill) => router.push(`/account_payables/bills?id=${bill.uuid}`) }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="pb-24">
      <div className="flex flex-col gap-8 xl:flex-row">
        <div className="min-w-0 flex-1 space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  placeholder={vendorsLoading ? 'Loading vendors...' : 'Select a vendor...'}
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
                    label="Purchase order (optional)"
                    options={purchaseOrders.map((po) => ({
                      value: po.uuid,
                      label: `${po.orderNumber || po.purchaseOrderId || po.uuid.slice(0, 8)} · ${formatDate(
                        po.orderDate
                      )} · ${formatMoney(po.orderTotal, currency)}`,
                    }))}
                    selectedValue={field.value}
                    onChange={(value: string) => field.onChange(value)}
                    placeholder={
                      !vendorId
                        ? 'Select a vendor first'
                        : ordersLoading
                        ? 'Loading orders...'
                        : purchaseOrders.length === 0
                        ? 'No purchase orders for this vendor'
                        : 'Link a purchase order...'
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
                      {copyingLines ? 'Copying lines...' : 'Copy line items from this order'}
                    </button>
                  )}
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Input
              type="text"
              name="vendorInvoiceNumber"
              label="Vendor invoice no."
              placeholder="e.g. INV-0042"
              register={register}
              errors={errors.vendorInvoiceNumber}
            />
            <FormDatePicker control={control} name="issueDate" label="Issue date" required />
            <FormDatePicker control={control} name="dueDate" label="Due date" required min={issueDate} />
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Input
                type="text"
                name="expenseAccountCode"
                label="Expense account"
                required
                register={register}
                errors={errors.expenseAccountCode}
              />
              <p className="mt-1 text-xs text-gray-500">
                Debited when the bill is approved (601 purchases of goods, 605 other purchases, 622 rent...).
              </p>
            </div>
            <Controller
              control={control}
              name="paymentMethod"
              render={({ field }) => (
                <Select
                  label="Planned payment method"
                  options={PAYMENT_METHODS.filter((m) => m.value !== 'CREDIT')}
                  selectedValue={field.value}
                  onChange={(v: PaymentMethod) => field.onChange(v)}
                  bg="bg-white"
                />
              )}
            />
          </div>

          <div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Line items <RequiredMark />
            </h3>
            <LineItemsEditor control={control} register={register} errors={errors} currency={currency} />
          </div>

          <TextArea
            name="notes"
            label="Notes"
            placeholder="Internal notes about this bill"
            register={register}
            errors={errors.notes}
          />
        </div>

        <aside className="w-full shrink-0 xl:w-80">
          <div className="sticky top-4 border border-gray-200 bg-gray-50 p-5">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatMoney(summary.subtotal, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Discounts</span>
                <span>−{formatMoney(summary.discount, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">VAT</span>
                <span>{formatMoney(summary.tax, currency)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-medium">
                <span>Total</span>
                <span className="text-primary">{formatMoney(summary.total, currency)}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              The bill is saved as a draft. Approving it later posts Dr {expenseAccountCode || '601'}{' '}
              expense + Dr 445 VAT / Cr vendor payable.
            </p>
          </div>
        </aside>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-end gap-3 border-t border-gray-200 bg-white p-3 pr-20">
        <Button
          text="Cancel"
          type="button"
          theme="gray"
          color
          onClick={() => router.push('/account_payables/bills')}
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
};

export default BillForm;
