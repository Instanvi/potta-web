import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { journalApi, journalKeys } from '../utils/api';
import { JournalFilter } from '../utils/types';

const useGetJournalEntries = ({ page = 1, limit = 20, search = '' }: JournalFilter = {}) =>
  useQuery({
    queryKey: journalKeys.list({ page, limit, search }),
    queryFn: () => journalApi.getAll({ page, limit, search }),
    placeholderData: keepPreviousData,
  });

export default useGetJournalEntries;
