import {
  keepPreviousData,
  useQuery,
  type Query,
} from '@tanstack/react-query';
import {
  FeedParams,
  MappingsParams,
  SyncRequest,
  SyncRequestListParams,
  SyncRequestListResponse,
  posSyncApi,
  posSyncKeys,
} from '../utils/api';

type RefetchInterval<T> =
  | number
  | false
  | ((query: Query<T, Error>) => number | false | undefined);

export const useReconcile = (from: string, to: string) =>
  useQuery({
    queryKey: posSyncKeys.reconcile(from, to),
    queryFn: () => posSyncApi.reconcile(from, to),
    enabled: !!from && !!to && from <= to,
  });

export const useEntityHealth = () =>
  useQuery({
    queryKey: posSyncKeys.entityHealth(),
    queryFn: () => posSyncApi.entityHealth(),
  });

export const useMappings = (params: MappingsParams) =>
  useQuery({
    queryKey: posSyncKeys.mappings(params),
    queryFn: () => posSyncApi.mappings(params),
    placeholderData: keepPreviousData,
  });

export const useFeed = (params: FeedParams) =>
  useQuery({
    queryKey: posSyncKeys.feed(params),
    queryFn: () => posSyncApi.feed(params),
    placeholderData: keepPreviousData,
  });

export const useSyncRequests = (
  params: SyncRequestListParams,
  options?: { refetchInterval?: RefetchInterval<SyncRequestListResponse> },
) =>
  useQuery({
    queryKey: posSyncKeys.requests(params),
    queryFn: () => posSyncApi.listRequests(params),
    placeholderData: keepPreviousData,
    refetchInterval: options?.refetchInterval,
  });

export const useSyncRequest = (
  id: string,
  options?: { refetchInterval?: RefetchInterval<SyncRequest> },
) =>
  useQuery({
    queryKey: posSyncKeys.request(id),
    queryFn: () => posSyncApi.request(id),
    enabled: !!id,
    retry: false,
    refetchInterval: options?.refetchInterval,
  });
