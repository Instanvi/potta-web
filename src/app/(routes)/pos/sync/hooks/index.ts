import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { FeedParams, MappingsParams, posSyncApi, posSyncKeys } from '../utils/api';

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

export const useSyncRequest = (id: string) =>
  useQuery({
    queryKey: posSyncKeys.request(id),
    queryFn: () => posSyncApi.request(id),
    enabled: !!id,
    retry: false,
  });
