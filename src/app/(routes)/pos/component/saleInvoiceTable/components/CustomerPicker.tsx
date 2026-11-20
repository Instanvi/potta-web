'use client';
import React from 'react';
import useGetAllCustomers from '@potta/app/(routes)/customers/hooks/useGetAllCustomers';

const WALK_IN_CUSTOMER_ID = 'WALK-IN';

interface Props {
  value: string;
  onChange: (customerId: string) => void;
  /** Credit sales must name a customer. */
  required?: boolean;
}

/** Optional customer for a till sale; empty means the walk-in customer. */
export default function CustomerPicker({ value, onChange, required }: Props) {
  const { data, isLoading } = useGetAllCustomers({ page: 1, limit: 100 });
  const customers = (data?.data ?? []).filter((c: any) => c.customerId !== WALK_IN_CUSTOMER_ID);

  return (
    <div className="space-y-1">
      <label htmlFor="pos-customer" className="block text-sm font-medium text-gray-700">
        Customer{required ? ' (required for credit)' : ''}
      </label>
      <select
        id="pos-customer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        className={`w-full py-2.5 px-3 border bg-white outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
          required && !value ? 'border-red-400' : 'border-gray-300'
        }`}
      >
        <option value="">{isLoading ? 'Loading customers...' : 'Walk-in customer'}</option>
        {customers.map((c: any) => (
          <option key={c.uuid} value={c.uuid}>
            {[c.firstName, c.lastName].filter(Boolean).join(' ') || c.email || c.phone}
          </option>
        ))}
      </select>
    </div>
  );
}
