import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '../utils/api';

const useGetTransactionDetails = (uuid: string | null) => {
  return useQuery({
    queryKey: ['transaction-details', uuid],
    queryFn: async () => {
      if (!uuid) return null;
      return transactionsApi.getOne(uuid);
    },
    enabled: !!uuid,
  });
};

export default useGetTransactionDetails;
