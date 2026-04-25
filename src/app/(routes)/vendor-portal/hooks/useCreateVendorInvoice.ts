import axios from 'config/axios.config';
import { useMutation } from '@tanstack/react-query';
import { VendorInvoiceData } from '../types';

interface CreateVendorInvoiceArgs {
  data: VendorInvoiceData;
  token: string;
  orgId?: string;
  locationId?: string;
}

export default function useCreateVendorInvoice() {
  return useMutation({
    mutationFn: async ({
      data,
      token,
      orgId,
      locationId,
    }: CreateVendorInvoiceArgs) => {
      const response = await axios.post('/vendor-portal/create-invoice', data, {
        params: {
          token: token,
          ...(orgId && { orgId }),
          ...(locationId && { locationId }),
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
  });
}
