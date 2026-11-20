'use client';
import { useState } from 'react';
import CustomerContent from './CustomerContent';
import VendorContent from './VendorContent';
import Select from '@potta/components/select';

export type ContactTypeFilter = 'customers' | 'vendors';

const TYPE_OPTIONS = [
  { value: 'customers', label: 'Customers' },
  { value: 'vendors', label: 'Vendors' },
];

export function readContactType(value?: string | null): ContactTypeFilter {
  if (value === 'vendors' || value === 'vendor') return 'vendors';
  return 'customers';
}

/** One contacts table at a time — switch between customers and vendors. */
const ContactsContent = ({
  initialType = 'customers',
}: {
  initialType?: ContactTypeFilter;
}) => {
  const [type, setType] = useState<ContactTypeFilter>(
    initialType === 'vendors' ? 'vendors' : 'customers',
  );

  return (
    <div>
      <div className="mb-4 w-full max-w-[220px]">
        <Select
          bg="bg-white"
          options={TYPE_OPTIONS}
          selectedValue={type}
          onChange={(value) =>
            setType(value === 'vendors' ? 'vendors' : 'customers')
          }
          placeholder="Contact type"
        />
      </div>
      {type === 'customers' ? <CustomerContent /> : <VendorContent />}
    </div>
  );
};

export default ContactsContent;
