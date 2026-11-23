'use client';
import { useState } from 'react';
import CustomerContent from './CustomerContent';
import VendorContent from './VendorContent';
import Select from '@potta/components/select';
import {
  readContactType,
  type ContactTypeFilter,
} from './contact-type';

export type { ContactTypeFilter };
export { readContactType };

const TYPE_OPTIONS = [
  { value: 'customers', label: 'Customers' },
  { value: 'vendors', label: 'Vendors' },
];

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
          onChange={(value: string) =>
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
