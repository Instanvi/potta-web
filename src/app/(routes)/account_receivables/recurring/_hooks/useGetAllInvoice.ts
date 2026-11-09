import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { invoiceApi } from '../_utils/api';
import { IFilter } from '../_utils/types';

const useGetAllInvoice = (filter: IFilter) => {
  return useQuery({
    queryKey: ['get-all-invoicing', filter],
    queryFn: () => invoiceApi.getAll(filter),
    placeholderData: keepPreviousData,
  });
};

export default useGetAllInvoice;
