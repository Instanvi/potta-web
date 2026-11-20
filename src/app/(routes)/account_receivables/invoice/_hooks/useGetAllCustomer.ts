import { useQuery } from '@tanstack/react-query';
import { invoiceApi } from '../_utils/api';

const useGetAllCustomer = (invoice_id: string) => {
  return useQuery({
    queryKey: ['get-all-customers'],
    queryFn: () => invoiceApi.getAllCustomers(invoice_id),
  });
};

export default useGetAllCustomer;
