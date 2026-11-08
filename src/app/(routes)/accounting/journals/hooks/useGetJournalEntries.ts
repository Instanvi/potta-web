import { useQuery } from '@tanstack/react-query';
import { journalApi, journalKeys } from '../utils/api';

const useGetJournalEntries = () =>
  useQuery({
    queryKey: journalKeys.list(),
    queryFn: () => journalApi.getAll(),
  });

export default useGetJournalEntries;
