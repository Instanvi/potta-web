import React, { useContext, useEffect, useMemo, useState } from 'react';
import Button from '@potta/components/button';
import { ContextData } from '@potta/components/providers/DataProvider';
import OrderSummary from '../orderSummary';
import CustomerPicker from '../CustomerPicker';
import { useCheckout } from '../useCheckout';
import type { PaymentMethod } from '@potta/app/(routes)/pos/utils/sale';
import { ReceiptPrinterFormatSelect } from '../../../print/ReceiptPrinterFormatSelect';
import { usePaymentMethods } from '@potta/app/(routes)/accounting/payment-methods/hooks';
import PaymentMethodSelect from '@potta/components/payment-method-select';
import { Skeleton } from '@potta/components/ui/loaders';

type MethodChoice = { code: string; label: string };

const FALLBACK: MethodChoice[] = [
  { code: 'MOBILE_MONEY', label: 'Mobile Money' },
  { code: 'CREDIT_CARD', label: 'Card' },
  { code: 'BANK_TRANSFER', label: 'Bank transfer' },
  { code: 'CREDIT', label: 'On account (credit)' },
  { code: 'OTHER', label: 'Other' },
];

const OtherPayment = () => {
  const context = useContext(ContextData);
  const { totals, checkout, printer, isPending, items, canSell } = useCheckout();
  const { data, isLoading } = usePaymentMethods({ page: 1, limit: 100 });
  const [methodCode, setMethodCode] = useState('');
  const [reference, setReference] = useState('');
  const [customerId, setCustomerId] = useState('');

  const methods = useMemo<MethodChoice[]>(() => {
    const fromApi = (data?.data ?? [])
      .filter((m) => m.isActive && m.code !== 'CASH')
      .map((m) => ({ code: m.code, label: m.name }));
    return fromApi.length > 0 ? fromApi : FALLBACK;
  }, [data?.data]);

  useEffect(() => {
    if (!methodCode && methods[0]) setMethodCode(methods[0].code);
  }, [methodCode, methods]);

  const selected = methods.find((m) => m.code === methodCode) ?? methods[0];
  const needsCustomer = selected?.code === 'CREDIT';
  const canSubmit =
    canSell &&
    items.length > 0 &&
    totals.total > 0 &&
    !isPending &&
    Boolean(selected) &&
    (!needsCustomer || Boolean(customerId));

  const handleComplete = async () => {
    if (!selected) return;
    const ok = await checkout({
      paymentMethod: selected.code as PaymentMethod,
      customerId,
      reference: reference.trim()
        ? `${selected.label}: ${reference.trim()}`
        : selected.label,
    });
    if (ok) {
      setReference('');
      setCustomerId('');
    }
  };

  return (
    <div className="h-full bg-white p-5">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="mb-1 text-base font-semibold text-gray-900">Other Method</h3>
          <p className="text-sm text-gray-500">Select how the customer pays</p>
        </div>
        <ReceiptPrinterFormatSelect printer={printer} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {isLoading && methods.length === 0 ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <>
              <PaymentMethodSelect
                label="Payment method"
                value={methodCode}
                onChange={setMethodCode}
                allowCreate
                extraOptions={[{ label: 'On account (credit)', value: 'CREDIT' }]}
              />
              <div className="space-y-2">
                {methods.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => setMethodCode(option.code)}
                    className={`flex w-full items-center space-x-3 border p-3 text-left transition-colors ${
                      methodCode === option.code
                        ? 'border-[var(--pos-green)] bg-[#e8f5e8]'
                        : 'border-[var(--pos-border)] bg-white hover:bg-[#f8f8f8]'
                    }`}
                  >
                    <i
                      className={`text-xl ${
                        option.code === 'CREDIT'
                          ? 'ri-user-shared-line'
                          : option.code === 'BANK_TRANSFER'
                            ? 'ri-bank-line'
                            : option.code === 'CREDIT_CARD'
                              ? 'ri-bank-card-line'
                              : 'ri-smartphone-line'
                      }`}
                    />
                    <p className="font-medium text-gray-800">{option.label}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Confirm payment with {selected?.label ?? 'the selected method'}, then complete the sale.
          </p>
          <div className="space-y-1">
            <label htmlFor="pos-reference" className="block text-sm font-medium text-gray-700">
              Reference (optional)
            </label>
            <input
              id="pos-reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="h-10 w-full border border-[var(--pos-border)] px-3 outline-none focus:border-[var(--pos-green)]"
            />
          </div>
          <CustomerPicker value={customerId} onChange={setCustomerId} required={needsCustomer} />
          <div className="flex w-full justify-between border-y border-[var(--pos-border)] py-3">
            <span className="font-medium text-gray-800">Amount due</span>
            <p className="text-base font-bold">{totals.total.toFixed(2)} XAF</p>
          </div>
          <Button
            width="full"
            type="button"
            text={
              isPending
                ? 'Processing...'
                : `Complete with ${selected?.label ?? 'payment'}`
            }
            onClick={handleComplete}
            disabled={!canSubmit}
          />
        </div>
      </div>

      <OrderSummary
        subtotal={context?.orderSummary?.subtotal || 0}
        discount={context?.orderSummary?.discount || 0}
        tax={context?.orderSummary?.tax || 0}
        itemDiscounts={context?.orderSummary?.itemDiscounts || 0}
        total={context?.orderSummary?.total || 0}
        setDiscount={(newDiscount: number) =>
          context?.setOrderSummary?.((prev) => ({ ...prev, discount: newDiscount }))
        }
      />
      {printer.getIframeElement()}
    </div>
  );
};

export default OtherPayment;
