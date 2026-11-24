'use client';
import { useState } from 'react';
import CustomerContent from './CustomerContent';
import VendorContent from './VendorContent';
import Select from '@potta/components/select';
import {
  readContactType,
  type ContactTypeFilter,
} from './contact-type';
import { ContactToolbarStartProvider } from './contact-toolbar';

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

  const typeSelect = (
    <div className="w-[160px] shrink-0">
      <Select
        bg="bg-white"
        options={TYPE_OPTIONS}
        selectedValue={type}
        onChange={(value: string) =>
          setType(value === 'vendors' ? 'vendors' : 'customers')
        }
        placeholder="Contact type"
        SelectClass="min-w-0"
      />
    </div>
  );

  return (
    <ContactToolbarStartProvider value={typeSelect}>
      {type === 'customers' ? <CustomerContent /> : <VendorContent />}
    </ContactToolbarStartProvider>
  );
};

export default ContactsContent;
