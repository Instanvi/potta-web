'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChartBar, PencilSimple } from '@phosphor-icons/react';
import { Button } from '@/components/shadcn/button';
import Select from '@potta/components/select';
import { BUILTIN_BOOKS_DASHBOARD, BUILTIN_DASHBOARD_NAME } from '@/lib/dashboards/builtin';
import RootLayout from '../layout';
import { LoadingState, PageContainer, PageHeader } from '../_shared/states';
import { DashboardGrid } from '../dashboards/components/DashboardWidgets';
import {
  useClearDefaultDashboard,
  useCustomizeBuiltinDashboard,
  useDashboardEntities,
  useDashboards,
  useDefaultDashboard,
  useSetDefaultDashboard,
} from '../dashboards/hooks';

const BUILTIN_KEY = '__builtin';

function widgetEntity(widget: { config?: { entity?: string } }): string | undefined {
  return widget.config?.entity;
}

export default function HomePage() {
  const router = useRouter();
  const defaultDashboard = useDefaultDashboard();
  const catalog = useDashboardEntities();
  const dashboards = useDashboards({ status: 'active', limit: 100 });
  const setDefault = useSetDefaultDashboard();
  const clearDefault = useClearDefaultDashboard();
  const customizeBuiltin = useCustomizeBuiltinDashboard();

  const chosen = defaultDashboard.data;
  const builtin = BUILTIN_BOOKS_DASHBOARD.filter((w) => {
    const entity = widgetEntity(w);
    return !entity || !catalog.data || catalog.data.some((e) => e.key === entity);
  });
  const widgets = chosen ? chosen.widgets : builtin;
  const switching = setDefault.isPending || clearDefault.isPending;

  const switchTo = (key: string) => {
    if (key === (chosen?.id ?? BUILTIN_KEY)) return;
    if (key === BUILTIN_KEY) clearDefault.mutate();
    else setDefault.mutate(key);
  };

  const customize = () => {
    if (chosen) {
      router.push(`/dashboards/${chosen.id}?edit=1`);
      return;
    }
    customizeBuiltin.mutate(
      { name: 'My books dashboard', widgets: builtin },
      { onSuccess: (created) => router.push(`/dashboards/${created.id}?edit=1`) },
    );
  };

  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title={chosen?.name ?? BUILTIN_DASHBOARD_NAME}
          description="Key balances plus invoice, bill, and journal trends. Customize to add your own charts."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Select
                name="Dashboard shown on Home"
                SelectClass="w-56"
                isDisabled={switching || defaultDashboard.isLoading}
                selectedValue={chosen?.id ?? BUILTIN_KEY}
                onChange={switchTo}
                options={[
                  { value: BUILTIN_KEY, label: `${BUILTIN_DASHBOARD_NAME} (built-in)` },
                  ...(dashboards.data?.items ?? []).map((d) => ({
                    value: d.id,
                    label: d.name,
                  })),
                ]}
              />
              <Button
                size="default"
                className="h-10 px-4 text-[15px] font-normal"
                onClick={customize}
                disabled={customizeBuiltin.isPending}
              >
                <PencilSimple size={16} className="mr-1.5" />
                {customizeBuiltin.isPending ? 'Preparing…' : 'Customize'}
              </Button>
              <Button asChild size="sm" variant="ghost" className="font-normal text-sm text-foreground">
                <Link href="/dashboards">
                  <ChartBar size={14} className="mr-1" />
                  All dashboards
                </Link>
              </Button>
            </div>
          }
        />
        {defaultDashboard.isLoading ? (
          <LoadingState label="Loading dashboard…" />
        ) : (
          <DashboardGrid widgets={widgets} />
        )}
      </PageContainer>
    </RootLayout>
  );
}
