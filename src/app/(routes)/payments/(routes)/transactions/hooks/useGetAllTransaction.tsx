import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '../utils/api';

interface useGetAllTransactionsProps {
  page?: number;
  limit?: number;
}

const useGetAllTransactions = ({
  page = 1,
  limit = 10,
}: useGetAllTransactionsProps) => {
  return useQuery({
    queryKey: ['transactions', page, limit],
    queryFn: () =>
      transactionsApi.getAll({
        page,
        limit,
      }),
  });
};

export default useGetAllTransactions;
