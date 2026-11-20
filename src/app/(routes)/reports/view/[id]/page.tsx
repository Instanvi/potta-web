'use client';

import { useParams } from 'next/navigation';
import { findReport, REPORT_CATEGORIES } from '@/lib/reports-catalog';
import { ReportRunner } from '@/app/(routes)/reports/components/ReportRunner';
import { ReportPageShell } from '@/app/(routes)/reports/components/ReportPageShell';
import { EmptyState } from '@/app/(routes)/_shared/states';
import Link from 'next/link';

const AS_OF_IDS = new Set([
  'trial-balance',
  'adjusted-trial-balance',
  'balance-sheet-summary',
  'balance-sheet-detail',
  'ar-ageing-summary',
  'ap-ageing-summary',
  'ar-ageing-detail',
  'ap-ageing-detail',
  'customer-balance-summary',
  'vendor-balance-summary',
  'customer-balance-detail',
  'vendor-balance-detail',
  'open-invoices',
  'collections',
  'statement-list',
  'business-snapshot',
]);

const COMPARE_IDS = new Set(['balance-sheet-comparison', 'pl-comparison', 'pl-ytd']);

export default function ReportViewPage() {
  const params = useParams();
  const id = String(params?.id ?? '');
  const report = findReport(id);
  const category = REPORT_CATEGORIES.find((c) => c.reports.some((r) => r.id === id));

  if (!report) {
    return (
      <ReportPageShell title="Report not found" description="This report id is not in the catalog.">
        <EmptyState
          variant="plain"
          title="Unknown report"
          description="Pick a report from the hub."
          action={
            <Link href="/reports" className="text-sm font-medium text-primary hover:underline">
              Back to reports
            </Link>
          }
        />
      </ReportPageShell>
    );
  }

  const mode = COMPARE_IDS.has(id) ? 'compare' : AS_OF_IDS.has(id) ? 'asOf' : 'range';

  return (
    <ReportRunner
      reportId={id}
      title={report.title}
      description={`${category?.title ?? 'Reports'} · Live from posted books data.`}
      mode={mode}
    />
  );
}
