'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/shadcn/button';
import type { DashboardWidget } from '@/lib/dashboards/types';
import RootLayout from '../../layout';
import {
  ErrorState,
  LoadingState,
  PageContainer,
  PageHeader,
} from '../../_shared/states';
import { AddWidgetPanel } from '../components/AddWidgetPanel';
import { DashboardGrid } from '../components/DashboardWidgets';
import {
  useDashboard,
  useDashboardEntities,
  useSetWidgets,
} from '../hooks';

export default function DashboardDetailPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const id = params.id;
  const editing = search.get('edit') === '1';

  const { data, isLoading, error, refetch } = useDashboard(id);
  const catalog = useDashboardEntities();
  const saveWidgets = useSetWidgets(id);
  const [draft, setDraft] = useState<DashboardWidget[] | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    if (data?.widgets) setDraft(data.widgets);
  }, [data?.widgets]);

  const widgets = draft ?? data?.widgets ?? [];

  const save = () => {
    saveWidgets.mutate(widgets, {
      onSuccess: () => router.replace(`/dashboards/${id}`),
    });
  };

  return (
    <RootLayout>
      <PageContainer>
        {isLoading ? (
          <LoadingState label="Loading dashboard…" />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : !data ? (
          <ErrorState error={new Error('Dashboard not found')} />
        ) : (
          <>
            <PageHeader
              title={data.name}
              description={
                editing
                  ? 'Edit the layout, then save. Home will use this if it is your default.'
                  : `${data.widgetCount} widgets${data.isDefault ? ' · Home default' : ''}`
              }
              actions={
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href="/dashboards">Back</Link>
                  </Button>
                  {editing ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
                        Add widget
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setDraft(data.widgets);
                          router.replace(`/dashboards/${id}`);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={save} disabled={saveWidgets.isPending}>
                        {saveWidgets.isPending ? 'Saving…' : 'Save layout'}
                      </Button>
                    </>
                  ) : (
                    <Button asChild size="sm">
                      <Link href={`/dashboards/${id}?edit=1`}>Edit</Link>
                    </Button>
                  )}
                </div>
              }
            />

            {editing && catalog.data ? (
              <AddWidgetPanel
                open={addOpen}
                onOpenChange={setAddOpen}
                catalog={catalog.data}
                onAdd={(widget) => setDraft((prev) => [...(prev ?? []), widget])}
              />
            ) : null}

            <DashboardGrid
              widgets={widgets}
              onRemove={
                editing
                  ? (widgetId) =>
                      setDraft((prev) => (prev ?? []).filter((w) => w.id !== widgetId))
                  : undefined
              }
            />
          </>
        )}
      </PageContainer>
    </RootLayout>
  );
}
