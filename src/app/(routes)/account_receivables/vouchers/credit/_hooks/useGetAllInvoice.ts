import { useQuery } from '@tanstack/react-query';
import { invoiceApi } from '../_utils/api';
import { IFilter } from '../_utils/types';

const useGetAllInvoice = (filter: IFilter) => {
  return useQuery({
    queryKey: ['get-all-invoicing'],
    queryFn: () => invoiceApi.getAll(filter),
  });
};

export default useGetAllInvoice;
