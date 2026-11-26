'use client';

import { useEffect, useRef } from 'react';
import useGetOneCustomer from '@potta/app/(routes)/customers/hooks/useGetOneCustomer';
import type { Customer } from '@potta/app/(routes)/customers/utils/types';
import { formatPartyAddress } from '@/lib/party-address';

/**
 * When a customer is selected, load their record and hand back a formatted
 * address. The list endpoint often omits the address relation.
 */
export function useCustomerAddressFill(
  customerId: string,
  onAddress: (address: string, customer: Customer) => void,
) {
  const { data } = useGetOneCustomer(customerId);
  const onAddressRef = useRef(onAddress);
  const appliedId = useRef('');

  onAddressRef.current = onAddress;

  useEffect(() => {
    if (!customerId || !data) return;
    if (data.uuid && data.uuid !== customerId) return;
    if (appliedId.current === customerId) return;
    appliedId.current = customerId;
    onAddressRef.current(formatPartyAddress(data.address), data);
  }, [customerId, data]);
}
