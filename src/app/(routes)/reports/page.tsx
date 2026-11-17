'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { CaretDown, CaretRight, Star } from '@phosphor-icons/react';
import { useSearchParams } from 'next/navigation';

import RootLayout from '../layout';
import { PageContainer, PageHeader } from '../_shared/states';
import { Can, useCan } from '@/components/auth/can';
import { useAuthContextStore } from '@/store/use-auth-context-store';
import {
  DEFAULT_FAVOURITE_IDS,
  REPORT_CATEGORIES,
  type ReportDef,
  type ReportScopeMode,
} from '@/lib/reports-catalog';
import { cn } from '@/lib/utils';
import { PanelCard, PanelCardContent, PanelCardHeader } from '@/components/ui/panel-card';
import { Input } from '@/components/shadcn/input';
import { Button } from '@/components/shadcn/button';

const FAV_KEY = 'potta.report.favourites';

function loadFavourites(): string[] {
  if (typeof window === 'undefined') return [...DEFAULT_FAVOURITE_IDS];
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (!raw) return [...DEFAULT_FAVOURITE_IDS];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [...DEFAULT_FAVOURITE_IDS];
  } catch {
    return [...DEFAULT_FAVOURITE_IDS];
  }
}

function ReportRow({
  report,
  favourite,
  onToggleFavourite,
}: {
  report: ReportDef;
  favourite: boolean;
  onToggleFavourite: () => void;
}) {
  const href = report.live && report.href ? report.href : `/reports/view/${report.id}`;
  return (
    <div className="group flex items-center gap-2 border-b border-neutral-50 py-2.5 last:border-b-0">
      <Link href={href} className="min-w-0 flex-1 text-sm text-foreground hover:text-primary">
        {report.title}
        {!report.live ? (
          <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">Soon</span>
        ) : null}
      </Link>
      <button
        type="button"
        aria-label={favourite ? 'Remove favourite' : 'Add favourite'}
        onClick={onToggleFavourite}
        className="rounded-[2px] p-1 text-muted-foreground hover:bg-muted hover:text-primary"
      >
        <Star className="size-4" weight={favourite ? 'fill' : 'regular'} />
      </button>
    </div>
  );
}

function CategoryBlock({
  title,
  description,
  reports,
  favourites,
  onToggleFavourite,
  defaultOpen = true,
}: {
  title: string;
  description?: string;
  reports: ReportDef[];
  favourites: Set<string>;
  onToggleFavourite: (id: string) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const mid = Math.ceil(reports.length / 2);
  const left = reports.slice(0, mid);
  const right = reports.slice(mid);

  return (
    <PanelCard>
      <button
        type="button"
        className="flex w-full items-start justify-between gap-4 border-b border-neutral-50 p-6 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-lg font-medium text-black">
            {open ? <CaretDown className="size-4 shrink-0" /> : <CaretRight className="size-4 shrink-0" />}
            {title}
          </h3>
          {description ? <p className="mt-1 text-sm text-black/70">{description}</p> : null}
        </div>
      </button>
      {open ? (
        <PanelCardContent className="pt-2">
          <div className="grid gap-x-8 sm:grid-cols-2">
            <div>
              {left.map((r) => (
                <ReportRow
                  key={r.id}
                  report={r}
                  favourite={favourites.has(r.id)}
                  onToggleFavourite={() => onToggleFavourite(r.id)}
                />
              ))}
            </div>
            <div>
              {right.map((r) => (
                <ReportRow
                  key={r.id}
                  report={r}
                  favourite={favourites.has(r.id)}
                  onToggleFavourite={() => onToggleFavourite(r.id)}
                />
              ))}
            </div>
          </div>
        </PanelCardContent>
      ) : null}
    </PanelCard>
  );
}

function ReportsHub() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const { canAccess } = useCan();
  const locationId = useAuthContextStore((s) => s.locationId);
  const hierarchy = useAuthContextStore((s) => s.hierarchy);
  const assignments = useAuthContextStore((s) => s.organizationAssignments);
  const activeLocation = useMemo(() => {
    if (hierarchy?.location?.id === locationId) return hierarchy.location;
    return assignments.find((a) => a.location?.id === locationId)?.location ?? hierarchy?.location;
  }, [hierarchy, assignments, locationId]);

  const canOrgWide = canAccess('Report', 'view-organization') || canAccess('Ledger', 'view-organization');
  const [scope, setScope] = useState<ReportScopeMode>('branch');
  const [query, setQuery] = useState('');
  const [favourites, setFavourites] = useState<string[]>(() => loadFavourites());
  const favSet = useMemo(() => new Set(favourites), [favourites]);

  function toggleFavourite(id: string) {
    setFavourites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    return REPORT_CATEGORIES.map((cat) => ({
      ...cat,
      reports: q
        ? cat.reports.filter((r) => r.title.toLowerCase().includes(q))
        : cat.reports,
    })).filter((cat) => cat.reports.length > 0);
  }, [query]);

  const favouriteReports = useMemo(() => {
    const byId = new Map(REPORT_CATEGORIES.flatMap((c) => c.reports).map((r) => [r.id, r]));
    return favourites.map((id) => byId.get(id)).filter(Boolean) as ReportDef[];
  }, [favourites]);

  const showOnlyFavourites = tab === 'favourites';

  return (
    <PageContainer>
      <PageHeader
        title="Reports"
        description="Financial and operational reports. Scoped to your branch unless you can view the whole organization."
      />

      <PanelCard className="mb-4">
        <PanelCardHeader
          title="Find reports"
          description="Search the catalog or switch branch vs organization scope."
          action={
            <span
              className={cn(
                'rounded-[2px] px-2 py-1 text-xs',
                scope === 'organization' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
              )}
            >
              {scope === 'organization' ? 'Organization' : 'Branch'} data
            </span>
          }
        />
        <PanelCardContent className="flex flex-wrap items-end gap-3 pt-0">
          <div className="min-w-[220px] flex-1 max-w-md">
            <label className="mb-1 block text-sm font-medium text-foreground">Search</label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type report name here"
            />
          </div>
          <div className="w-full max-w-xs">
            <label className="mb-1 block text-sm font-medium text-foreground">Scope</label>
            <select
              className="flex h-10 w-full rounded-t-[2px] rounded-b-none border-0 border-b border-black/15 bg-zinc-50 px-3 text-sm text-foreground outline-none focus-visible:border-primary"
              value={canOrgWide ? scope : 'branch'}
              disabled={!canOrgWide}
              onChange={(e) => setScope(e.target.value as ReportScopeMode)}
            >
              <option value="branch">
                Branch{activeLocation?.name ? `: ${activeLocation.name}` : ''}
              </option>
              <option value="organization">Organization-wide</option>
            </select>
          </div>
          {!canOrgWide ? (
            <p className="w-full text-xs text-muted-foreground">Org-wide locked (needs permission)</p>
          ) : null}
          <div className="flex gap-2">
            <Button asChild variant={showOnlyFavourites ? 'outline' : 'default'} size="sm">
              <Link href="/reports">All reports</Link>
            </Button>
            <Button asChild variant={showOnlyFavourites ? 'default' : 'outline'} size="sm">
              <Link href="/reports?tab=favourites">Favourites</Link>
            </Button>
          </div>
        </PanelCardContent>
      </PanelCard>

      <div className="space-y-4">
        {!showOnlyFavourites || favouriteReports.length > 0 ? (
          <CategoryBlock
            title="Favourites"
            description="Reports you star for quick access"
            reports={
              showOnlyFavourites
                ? favouriteReports
                : favouriteReports.filter((r) => !query || r.title.toLowerCase().includes(query.toLowerCase()))
            }
            favourites={favSet}
            onToggleFavourite={toggleFavourite}
          />
        ) : null}

        {!showOnlyFavourites
          ? filteredCategories.map((cat) => (
              <CategoryBlock
                key={cat.id}
                title={cat.title}
                description={`${cat.reports.length} report${cat.reports.length === 1 ? '' : 's'}`}
                reports={cat.reports}
                favourites={favSet}
                onToggleFavourite={toggleFavourite}
              />
            ))
          : null}
      </div>
    </PageContainer>
  );
}

export default function ReportsPage() {
  return (
    <RootLayout>
      <Suspense fallback={<PageContainer><p className="text-sm text-muted-foreground">Loading reports…</p></PageContainer>}>
        <Can
          resource="Ledger"
          action={['view-balance-sheet', 'view-income-statement', 'view-entries']}
          fallback={
            <Can
              resource="Report"
              action={['view', 'view-organization']}
              fallback={
                <Can resource="GeneralLedger" action={['view-balance-sheet', 'income-statement', 'view-all']}>
                  <ReportsHub />
                </Can>
              }
            >
              <ReportsHub />
            </Can>
          }
        >
          <ReportsHub />
        </Can>
      </Suspense>
    </RootLayout>
  );
}
