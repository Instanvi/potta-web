import axios from 'config/axios.config';
import type {
  AggregateResult,
  Dashboard,
  DashboardList,
  DashboardRecordList,
  DashboardWidget,
  EntityCatalogEntry,
  EntityKey,
} from '@/lib/dashboards/types';

export const dashboardsApi = {
  list: async (params: { search?: string; status?: string; limit?: number; offset?: number } = {}) => {
    const res = await axios.get<DashboardList>('/dashboards', { params });
    return res.data;
  },
  get: async (id: string) => {
    const res = await axios.get<Dashboard>(`/dashboards/${id}`);
    return res.data;
  },
  getDefault: async () => {
    const res = await axios.get<Dashboard | null>('/dashboards/default');
    return res.data;
  },
  create: async (input: { name: string; descriptionHtml?: string }) => {
    const res = await axios.post<Dashboard>('/dashboards', input);
    return res.data;
  },
  update: async (id: string, input: { name?: string; descriptionHtml?: string; status?: string }) => {
    const res = await axios.patch<Dashboard>(`/dashboards/${id}`, input);
    return res.data;
  },
  setWidgets: async (id: string, widgets: DashboardWidget[]) => {
    const res = await axios.put<Dashboard>(`/dashboards/${id}/widgets`, { widgets });
    return res.data;
  },
  setDefault: async (id: string) => {
    const res = await axios.post<Dashboard>(`/dashboards/${id}/set-default`);
    return res.data;
  },
  clearDefault: async () => {
    const res = await axios.delete<{ cleared: boolean }>('/dashboards/default');
    return res.data;
  },
  duplicate: async (id: string) => {
    const res = await axios.post<Dashboard>(`/dashboards/${id}/duplicate`);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await axios.delete<{ deleted: boolean }>(`/dashboards/${id}`);
    return res.data;
  },
};

export const dashboardDataApi = {
  entities: async () => {
    const res = await axios.get<EntityCatalogEntry[]>('/dashboard-data/entities');
    return res.data;
  },
  aggregate: async (
    entity: EntityKey,
    params: {
      aggregation?: string;
      field?: string | null;
      status?: string[];
      groupBy?: string;
      limit?: number;
      fromDate?: string | null;
      toDate?: string | null;
    },
  ) => {
    const res = await axios.get<AggregateResult>(`/dashboard-data/${entity}/aggregate`, {
      params: {
        aggregation: params.aggregation,
        field: params.field ?? undefined,
        status: params.status?.length ? params.status.join(',') : undefined,
        groupBy: params.groupBy,
        limit: params.limit,
        fromDate: params.fromDate ?? undefined,
        toDate: params.toDate ?? undefined,
      },
    });
    return res.data;
  },
  records: async (
    entity: EntityKey,
    params: {
      sort?: string;
      order?: 'asc' | 'desc';
      search?: string;
      limit?: number;
      offset?: number;
    },
  ) => {
    const res = await axios.get<DashboardRecordList>(`/dashboard-data/${entity}/records`, { params });
    return res.data;
  },
};
