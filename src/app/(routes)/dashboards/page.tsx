'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/shadcn/button';
import RootLayout from '../layout';
import {
  EmptyState,
  ErrorState,
  ListToolbar,
  LoadingState,
  PageContainer,
  PageHeader,
} from '../_shared/states';
import {
  useCreateDashboard,
  useDashboards,
  useDeleteDashboard,
  useDuplicateDashboard,
  useSetDefaultDashboard,
} from './hooks';

export default function DashboardsListPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data, isLoading, error, refetch } = useDashboards({
    status: 'active',
    search: search.trim() || undefined,
    limit: 100,
  });
  const create = useCreateDashboard();
  const setDefault = useSetDefaultDashboard();
  const duplicate = useDuplicateDashboard();
  const remove = useDeleteDashboard();

  const onCreate = () => {
    create.mutate(
      { name: 'New dashboard' },
      {
        onSuccess: (created) => router.push(`/dashboards/${created.id}?edit=1`),
      },
    );
  };

  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Dashboards"
          description="Create layouts of KPIs and charts. Set one as your Home default."
          actions={
            <Button size="sm" onClick={onCreate} disabled={create.isPending}>
              {create.isPending ? 'Creating…' : 'New dashboard'}
            </Button>
          }
        />
        <ListToolbar>
          <input
            className="h-9 w-full max-w-sm rounded-[2px] border border-black/10 bg-white px-3 text-sm"
            placeholder="Search dashboards"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </ListToolbar>

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : !data?.items.length ? (
          <EmptyState
            title="No dashboards yet"
            description="Create one, or customize the built-in overview from Home."
          />
        ) : (
          <ul className="divide-y divide-black/[0.08] rounded-[2px] border border-black/[0.08] bg-white">
            {data.items.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <Link href={`/dashboards/${d.id}`} className="font-medium hover:underline">
                    {d.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {d.widgetCount} widget{d.widgetCount === 1 ? '' : 's'}
                    {d.isDefault ? ' · Home default' : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboards/${d.id}?edit=1`}>Edit</Link>
                  </Button>
                  {!d.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={setDefault.isPending}
                      onClick={() => setDefault.mutate(d.id)}
                    >
                      Set default
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={duplicate.isPending}
                    onClick={() =>
                      duplicate.mutate(d.id, {
                        onSuccess: (copy) => router.push(`/dashboards/${copy.id}?edit=1`),
                      })
                    }
                  >
                    Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (confirm(`Delete “${d.name}”?`)) remove.mutate(d.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </RootLayout>
  );
}
