'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import RootLayout from '../../../layout';
import { PageContainer, PageHeader } from '../../../_shared/states';
import { findReport } from '@/lib/reports-catalog';
import { PanelCard, PanelCardContent, PanelCardHeader } from '@/components/ui/panel-card';

export default function ReportShellPage() {
  const params = useParams<{ id: string }>();
  const report = findReport(params.id);

  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title={report?.title ?? 'Report'}
          description="This report is listed in the hub and will be wired to posted journal data next."
        />
        <PanelCard>
          <PanelCardHeader
            title={report?.title ?? 'Report'}
            description="Latest additions to your report catalog"
            action={
              <Link href="/reports" className="text-sm font-medium text-primary hover:underline">
                View All
              </Link>
            }
          />
          <PanelCardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="text-base font-medium text-black">Coming soon</p>
            <p className="text-sm text-black/70">This report will be available here shortly.</p>
          </PanelCardContent>
        </PanelCard>
      </PageContainer>
    </RootLayout>
  );
}
