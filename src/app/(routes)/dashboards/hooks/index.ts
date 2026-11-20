import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { DashboardWidget } from '@/lib/dashboards/types';
import { dashboardDataApi, dashboardsApi } from '../utils/api';

const DASHBOARD_ROOT = ['dashboards'] as const;

export const dashboardKeys = {
  all: DASHBOARD_ROOT,
  list: (filters: Record<string, unknown>) => [...DASHBOARD_ROOT, 'list', filters] as const,
  detail: (id: string) => [...DASHBOARD_ROOT, 'detail', id] as const,
  default: [...DASHBOARD_ROOT, 'default'] as const,
  entities: [...DASHBOARD_ROOT, 'entities'] as const,
  aggregate: (entity: string, params: unknown) => [...DASHBOARD_ROOT, 'aggregate', entity, params] as const,
  records: (entity: string, params: unknown) => [...DASHBOARD_ROOT, 'records', entity, params] as const,
};

export const useDashboards = (filters: { search?: string; status?: string; limit?: number } = {}) =>
  useQuery({
    queryKey: dashboardKeys.list(filters),
    queryFn: () => dashboardsApi.list(filters),
  });

export const useDashboard = (id: string) =>
  useQuery({
    queryKey: dashboardKeys.detail(id),
    queryFn: () => dashboardsApi.get(id),
    enabled: !!id,
  });

export const useDefaultDashboard = () =>
  useQuery({
    queryKey: dashboardKeys.default,
    queryFn: () => dashboardsApi.getDefault(),
  });

export const useDashboardEntities = () =>
  useQuery({
    queryKey: dashboardKeys.entities,
    queryFn: () => dashboardDataApi.entities(),
  });

export const useAggregate = (
  entity: string | undefined,
  params: {
    aggregation?: string;
    field?: string | null;
    status?: string[];
    groupBy?: string;
    limit?: number;
  },
  enabled = true,
) =>
  useQuery({
    queryKey: dashboardKeys.aggregate(entity ?? '', params),
    queryFn: () =>
      dashboardDataApi.aggregate(entity as never, params),
    enabled: enabled && !!entity,
  });

export const useDashboardRecords = (
  entity: string | undefined,
  params: { sort?: string; order?: 'asc' | 'desc'; limit?: number },
  enabled = true,
) =>
  useQuery({
    queryKey: dashboardKeys.records(entity ?? '', params),
    queryFn: () => dashboardDataApi.records(entity as never, params),
    enabled: enabled && !!entity,
  });

export const useCreateDashboard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; descriptionHtml?: string }) => dashboardsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: dashboardKeys.all }),
  });
};

export const useSetWidgets = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (widgets: DashboardWidget[]) => dashboardsApi.setWidgets(id, widgets),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dashboardKeys.detail(id) });
      qc.invalidateQueries({ queryKey: dashboardKeys.default });
      qc.invalidateQueries({ queryKey: dashboardKeys.list({}) });
    },
  });
};

export const useSetDefaultDashboard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dashboardsApi.setDefault(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: dashboardKeys.all }),
  });
};

export const useClearDefaultDashboard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => dashboardsApi.clearDefault(),
    onSuccess: () => qc.invalidateQueries({ queryKey: dashboardKeys.all }),
  });
};

export const useCustomizeBuiltinDashboard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; widgets: DashboardWidget[] }) => {
      const created = await dashboardsApi.create({ name: input.name });
      await dashboardsApi.setWidgets(created.id, input.widgets);
      await dashboardsApi.setDefault(created.id);
      return dashboardsApi.get(created.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: dashboardKeys.all }),
  });
};

export const useDuplicateDashboard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dashboardsApi.duplicate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: dashboardKeys.all }),
  });
};

export const useDeleteDashboard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dashboardsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: dashboardKeys.all }),
  });
};
