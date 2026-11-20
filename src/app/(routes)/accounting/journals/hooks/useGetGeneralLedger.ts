import { useQuery } from '@tanstack/react-query';
import { journalApi } from '../utils/api';

interface UseGetGeneralLedgerProps {
  page?: number;
  limit?: number;
  startDate: string;
  endDate: string;
}

const useGetGeneralLedger = ({
  page = 1,
  limit = 10,
  startDate,
  endDate,
}: UseGetGeneralLedgerProps) => {
  return useQuery({
    queryKey: ['generalLedger', page, limit, startDate, endDate],
    queryFn: () =>
      journalApi.getAll({
        page,
        limit,
        dateFrom: startDate,
        dateTo: endDate,
      }),
  });
};

export default useGetGeneralLedger;
