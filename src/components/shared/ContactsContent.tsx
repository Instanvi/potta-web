'use client';
import { useState } from 'react';
import CustomerContent from './CustomerContent';
import VendorContent from './VendorContent';
import { Tabs } from '@potta/app/(routes)/_shared/states';

export type ContactTypeFilter = 'all' | 'customers' | 'vendors';

const TABS: { id: ContactTypeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'customers', label: 'Customers' },
  { id: 'vendors', label: 'Vendors' },
];

export function readContactType(value?: string | null): ContactTypeFilter {
  if (value === 'customers' || value === 'customer') return 'customers';
  if (value === 'vendors' || value === 'vendor') return 'vendors';
  return 'all';
}

/** Customers and vendors on one page, filtered by type. */
const ContactsContent = ({ initialType = 'all' }: { initialType?: ContactTypeFilter }) => {
  const [type, setType] = useState<ContactTypeFilter>(initialType);

  return (
    <div>
      <Tabs tabs={TABS} value={type} onChange={setType} />
      {type !== 'vendors' && (
        <section className={type === 'all' ? 'mb-8' : undefined}>
          {type === 'all' && <h3 className="mb-3 text-sm font-medium text-foreground">Customers</h3>}
          <CustomerContent />
        </section>
      )}
      {type !== 'customers' && (
        <section>
          {type === 'all' && <h3 className="mb-3 text-sm font-medium text-foreground">Vendors</h3>}
          <VendorContent />
        </section>
      )}
    </div>
  );
};

export default ContactsContent;
