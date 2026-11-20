import { useQuery } from '@tanstack/react-query';
import { invoiceApi } from '../_utils/api';

const useGetOneInvoice = (invoice_id: string) => {
  return useQuery({
    queryKey: ['get-one-invoicing', invoice_id],
    queryFn: () => invoiceApi.getOne(invoice_id),
  });
};

export default useGetOneInvoice;
