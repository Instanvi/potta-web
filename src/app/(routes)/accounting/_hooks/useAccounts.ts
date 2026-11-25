import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiErrorMessage } from '../../_shared/format';
import { accountsApi } from '../utils/api';
import type { accountPayload } from '../utils/validations';

export interface AccountFilterParams {
  page?: number;
  limit?: number;
  sortBy?: string[];
  search?: string;
  filter?: string[];
}

export const accountKeys = {
  all: ['accounts'] as const,
  tree: () => [...accountKeys.all, 'tree'] as const,
  byType: (type: string, search?: string) =>
    [...accountKeys.all, 'by-type', type, search ?? ''] as const,
  filtered: (params: AccountFilterParams = {}) =>
    [...accountKeys.all, 'filtered', params] as const,
  detail: (accountId: string) =>
    [...accountKeys.all, 'detail', accountId] as const,
};

/** The chart of accounts changes rarely, so keep it fresh for a while. */
export const ACCOUNT_TREE_STALE_TIME = 5 * 60 * 1000;

/** Shared with `prefetchQuery` (sidebar hover) so the cache entry is identical. */
export const accountTreeQueryOptions = () =>
  queryOptions({
    queryKey: accountKeys.tree(),
    queryFn: () => accountsApi.getAll(),
    staleTime: ACCOUNT_TREE_STALE_TIME,
  });

export const useAccountTree = () => useQuery(accountTreeQueryOptions());

export const useAccountsByType = (
  type: string,
  options: { search?: string; enabled?: boolean } = {},
) =>
  useQuery({
    queryKey: accountKeys.byType(type, options.search),
    queryFn: () => accountsApi.getByType(type, options.search),
    enabled: !!type && (options.enabled ?? true),
    staleTime: ACCOUNT_TREE_STALE_TIME,
  });

export const useAccountsFiltered = (
  params: AccountFilterParams,
  options: { enabled?: boolean } = {},
) =>
  useQuery({
    queryKey: accountKeys.filtered(params),
    queryFn: () => accountsApi.getFiltered(params),
    enabled: options.enabled ?? true,
    placeholderData: keepPreviousData,
  });

/** Search-as-you-type lookup; stays idle until there is a term. */
export const useAccountSearch = (term: string, limit = 10) => {
  const search = term.trim();
  return useAccountsFiltered({ search, limit }, { enabled: !!search });
};

export const useAccountDetail = (accountId?: string | null) =>
  useQuery({
    queryKey: accountKeys.detail(accountId ?? ''),
    queryFn: () => accountsApi.getOne(accountId as string),
    enabled: !!accountId,
  });

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: accountPayload) => accountsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
};

export const useSeedAccounts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => accountsApi.seedAccounts(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      if (result.reason === 'already_seeded') {
        toast.message('Accounts already set up for this organization');
      } else {
        toast.success('Accounts set up');
      }
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, 'Could not set up accounts')),
  });
};
