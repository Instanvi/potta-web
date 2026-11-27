'use client';
import React, { useMemo, useState } from 'react';
import useGetAllCustomers from '@potta/app/(routes)/customers/hooks/useGetAllCustomers';

const WALK_IN_CUSTOMER_ID = 'WALK-IN';

interface Props {
  value: string;
  onChange: (customerId: string) => void;
}

type CustomerRow = {
  uuid: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  customerId?: string;
};

const displayName = (c: CustomerRow) =>
  [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email || c.phone || 'Customer';

/** Desktop-style customer search for the cart panel. */
export default function CustomerSearchBar({ value, onChange }: Props) {
  const { data, isLoading } = useGetAllCustomers({ page: 1, limit: 100 });
  const customers = useMemo(
    () =>
      ((data?.data ?? []) as CustomerRow[]).filter((c) => c.customerId !== WALK_IN_CUSTOMER_ID),
    [data?.data]
  );

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selected = customers.find((c) => c.uuid === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers.slice(0, 8);
    return customers
      .filter((c) => displayName(c).toLowerCase().includes(q) || (c.phone ?? '').includes(q))
      .slice(0, 8);
  }, [customers, query]);

  const clear = () => {
    onChange('');
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="relative mb-2.5">
      <div className="flex h-10 items-center border border-[var(--pos-border)] bg-white">
        <div className="flex w-10 shrink-0 items-center justify-center text-gray-500">
          <i className="ri-user-line text-lg" />
        </div>
        <input
          type="text"
          value={selected && !open ? displayName(selected) : query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (value) onChange('');
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={isLoading ? 'Loading customers...' : 'Search customers'}
          className="h-full w-full border-0 bg-transparent pr-8 text-sm outline-none"
        />
        {(value || query) && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 text-gray-400 hover:text-gray-700"
            aria-label="Clear customer"
          >
            ✕
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-1 max-h-52 overflow-y-auto border border-[var(--pos-border)] bg-white shadow-md">
          <button
            type="button"
            className="w-full border-b border-[var(--pos-border-soft)] px-3 py-2 text-left text-sm hover:bg-[#f8f8f8]"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onChange('');
              setQuery('');
              setOpen(false);
            }}
          >
            Walk-in customer
          </button>
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm italic text-orange-600">No customers found</div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.uuid}
                type="button"
                className="w-full border-b border-[var(--pos-border-soft)] px-3 py-2 text-left hover:bg-[#f8f8f8]"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(c.uuid);
                  setQuery('');
                  setOpen(false);
                }}
              >
                <div className="text-sm font-semibold text-gray-900">{displayName(c)}</div>
                {(c.phone || c.email) && (
                  <div className="text-xs text-gray-500">{c.phone || c.email}</div>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
