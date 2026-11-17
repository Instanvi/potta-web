'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import RootLayout from '../../../layout';
import { PageContainer, PageHeader } from '../../../_shared/states';
import { findReport } from '@/lib/reports-catalog';

export default function ReportShellPage() {
  const params = useParams<{ id: string }>();
  const report = findReport(params.id);

  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title={report?.title ?? 'Report'}
          description="This report is listed in the hub and will be wired to posted journal data next."
          actions={
            <Link href="/reports" className="text-sm text-primary hover:underline">
              Back to reports
            </Link>
          }
        />
        <div className="rounded-[2px] border border-dashed border-black/10 bg-white px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Coming soon</p>
        </div>
      </PageContainer>
    </RootLayout>
  );
}
