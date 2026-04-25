import { useQuery } from '@tanstack/react-query';
import { JournalFilter, JournalResponse } from '../utils/types';
import { journalApi } from '../utils/api';

const useGetAllJournals = (filter: JournalFilter) => {
  return useQuery<JournalResponse, Error, JournalResponse>({
    queryKey: ['get-all-journals', filter.page, filter.limit],
    queryFn: () => journalApi.getAll(filter),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export default useGetAllJournals;
