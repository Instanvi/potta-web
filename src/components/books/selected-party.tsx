'use client';

import useGetOneCustomer from '@potta/app/(routes)/customers/hooks/useGetOneCustomer';
import useGetOneVendor from '@potta/app/(routes)/vendors/hooks/useGetOneVendor';
import type { Customer } from '@potta/app/(routes)/customers/utils/types';
import type { Vendor } from '@potta/app/(routes)/vendors/utils/types';
import { formatPartyAddressLines } from '@/lib/party-address';

export type PartySnapshot = {
  kind: 'Customer' | 'Vendor';
  name: string;
  email?: string | null;
  phone?: string | null;
  addressLines: string[];
  taxId?: string | null;
  contactPerson?: string | null;
};

export function customerSnapshot(customer: Customer): PartySnapshot {
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim();
  return {
    kind: 'Customer',
    name: name || 'Customer',
    email: customer.email,
    phone: customer.phone,
    addressLines: formatPartyAddressLines(customer.address),
    taxId: customer.taxId,
    contactPerson: customer.contactPerson,
  };
}

export function vendorSnapshot(vendor: Vendor): PartySnapshot {
  return {
    kind: 'Vendor',
    name: vendor.name?.trim() || 'Vendor',
    email: vendor.email,
    phone: vendor.phone,
    addressLines: formatPartyAddressLines(vendor.address),
    taxId: vendor.taxId,
    contactPerson: vendor.contactPerson,
  };
}

export function SelectedParty({
  kind,
  id,
}: {
  kind: 'customer' | 'vendor';
  id: string;
}) {
  if (!id) return null;
  return kind === 'customer' ? <CustomerParty id={id} /> : <VendorParty id={id} />;
}

function CustomerParty({ id }: { id: string }) {
  const { data, isLoading, isError } = useGetOneCustomer(id);
  if (isLoading) return <PartyFrame>Loading customer…</PartyFrame>;
  if (isError || !data) return <PartyFrame>Could not load this customer.</PartyFrame>;
  return <PartyCard party={customerSnapshot(data)} />;
}

function VendorParty({ id }: { id: string }) {
  const { data, isLoading, isError } = useGetOneVendor(id);
  if (isLoading) return <PartyFrame>Loading vendor…</PartyFrame>;
  if (isError || !data) return <PartyFrame>Could not load this vendor.</PartyFrame>;
  return <PartyCard party={vendorSnapshot(data)} />;
}

function PartyFrame({ children }: { children: string }) {
  return (
    <div className="rounded-[2px] border border-black/[0.08] bg-zinc-50 px-4 py-3 text-sm text-muted-foreground md:col-span-2">
      {children}
    </div>
  );
}

export function PartyCard({ party }: { party: PartySnapshot }) {
  const contact = [party.email, party.phone].filter(Boolean).join(' · ');
  return (
    <div className="rounded-[2px] border border-black/[0.08] bg-zinc-50 px-4 py-3 md:col-span-2">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/45">
        {party.kind}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground">{party.name}</p>
      {contact ? <p className="mt-0.5 text-sm text-muted-foreground">{contact}</p> : null}
      {party.contactPerson ? (
        <p className="mt-0.5 text-sm text-muted-foreground">Contact: {party.contactPerson}</p>
      ) : null}
      {party.addressLines.length > 0 ? (
        <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
          {party.addressLines.join('\n')}
        </p>
      ) : null}
      {party.taxId ? (
        <p className="mt-1 text-xs text-muted-foreground">Tax ID {party.taxId}</p>
      ) : null}
    </div>
  );
}
