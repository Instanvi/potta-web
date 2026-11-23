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
  PageContainer,
} from '../_shared/states';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/ui/loaders';
import { FIELD_INPUT } from '@/lib/field-styles';
import { cn } from '@/lib/utils';
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
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(
    null,
  );
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
        <ListToolbar
          actions={
            <>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9"
                onClick={() => void refetch()}
                disabled={isLoading}
                aria-label="Refresh dashboards"
                title="Refresh"
              >
                <i className={`ri-refresh-line text-base ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button size="sm" onClick={onCreate} disabled={create.isPending}>
                {create.isPending ? 'Creating…' : 'New dashboard'}
              </Button>
            </>
          }
        >
          <input
            className={cn(FIELD_INPUT, 'max-w-sm !bg-white')}
            placeholder="Search dashboards"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </ListToolbar>

        {isLoading ? (
          <ul className="divide-y divide-black/[0.08] rounded-[2px] border border-black/[0.08] bg-white" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-14" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </li>
            ))}
          </ul>
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
                    onClick={() => setPendingDelete({ id: d.id, name: d.name })}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <ConfirmDialog
          open={Boolean(pendingDelete)}
          onOpenChange={(open) => {
            if (!open) setPendingDelete(null);
          }}
          title={pendingDelete ? `Delete “${pendingDelete.name}”?` : 'Delete dashboard?'}
          description="This permanently removes the dashboard and its widgets."
          confirmText="Delete"
          destructive
          isLoading={remove.isPending}
          onConfirm={() => {
            if (!pendingDelete) return;
            remove.mutate(pendingDelete.id, {
              onSuccess: () => setPendingDelete(null),
            });
          }}
        />
      </PageContainer>
    </RootLayout>
  );
}
