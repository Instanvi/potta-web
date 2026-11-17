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
    <div className="group flex items-center gap-2 border-b border-black/[0.06] py-2.5 last:border-b-0">
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
  reports,
  favourites,
  onToggleFavourite,
  defaultOpen = true,
}: {
  title: string;
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
    <section className="rounded-[2px] border border-black/[0.06] bg-white">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <CaretDown className="size-4" /> : <CaretRight className="size-4" />}
        {title}
      </button>
      {open ? (
        <div className="grid gap-x-8 border-t border-black/[0.06] px-4 pb-2 sm:grid-cols-2">
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
      ) : null}
    </section>
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
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Scope
              <select
                className="h-10 rounded-[2px] border border-input bg-background px-2 text-sm text-foreground"
                value={canOrgWide ? scope : 'branch'}
                disabled={!canOrgWide}
                onChange={(e) => setScope(e.target.value as ReportScopeMode)}
              >
                <option value="branch">
                  Branch{activeLocation?.name ? `: ${activeLocation.name}` : ''}
                </option>
                <option value="organization">Organization-wide</option>
              </select>
            </label>
            {!canOrgWide ? (
              <span className="text-xs text-muted-foreground">Org-wide locked (needs permission)</span>
            ) : null}
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type report name here"
          className="h-12 w-full max-w-md rounded-[2px] border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-[3px] focus:ring-ring/30"
        />
        <span
          className={cn(
            'rounded-[2px] px-2 py-1 text-xs',
            scope === 'organization' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
          )}
        >
          {scope === 'organization' ? 'Organization' : 'Branch'} data
        </span>
      </div>

      <div className="space-y-4">
        {!showOnlyFavourites || favouriteReports.length > 0 ? (
          <CategoryBlock
            title="Favourites"
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
