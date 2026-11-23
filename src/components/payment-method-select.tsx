'use client';

import { useMemo, useState } from 'react';
import Select from '@potta/components/select';
import { usePaymentMethods } from '@potta/app/(routes)/accounting/payment-methods/hooks';
import PaymentMethodSheet from '@potta/app/(routes)/accounting/payment-methods/components/PaymentMethodSheet';
import type { OrgPaymentMethod } from '@potta/app/(routes)/accounting/payment-methods/utils/api';
import { Skeleton } from '@potta/components/ui/loaders';

type Props = {
  value: string;
  onChange: (code: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
  /** When true, show a + control to add a custom method. */
  allowCreate?: boolean;
};

/**
 * Dynamic payment method select backed by GET /payment-method
 * (defaults auto-seeded on first list).
 */
export function PaymentMethodSelect({
  value,
  onChange,
  error,
  label = 'Payment method',
  required = true,
  allowCreate = true,
}: Props) {
  const { data, isLoading } = usePaymentMethods({ page: 1, limit: 100 });
  const [sheetOpen, setSheetOpen] = useState(false);

  const options = useMemo(
    () =>
      (data?.data ?? [])
        .filter((m) => m.isActive)
        .map((m) => ({ label: m.name, value: m.code })),
    [data?.data],
  );

  const onCreated = (method: OrgPaymentMethod) => {
    onChange(method.code);
  };

  if (isLoading && options.length === 0) {
    return (
      <div className="space-y-1" aria-busy="true">
        <span className="mb-1 block text-sm font-normal text-foreground">
          {label}
          {required ? <span className=" text-red-500">*</span> : null}
        </span>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 ${error ? 'error-field' : ''}`}>
      <div className="min-w-0 flex-1">
        <Select
          label={label}
          required={required}
          options={options}
          selectedValue={value || ''}
          onChange={(v: string) => onChange(v)}
          bg="bg-white"
          placeholder="Select payment method"
          error={error}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
      {allowCreate && (
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="mb-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-[2px] bg-primary text-white hover:bg-brand-hover"
          aria-label="Add payment method"
          title="Add payment method"
        >
          <i className="ri-add-line text-xl" />
        </button>
      )}
      <PaymentMethodSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onCreated={onCreated}
      />
    </div>
  );
}

export default PaymentMethodSelect;
