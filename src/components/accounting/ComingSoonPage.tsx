'use client';

import RootLayout from '@/app/(routes)/layout';
import { PageContainer, PageHeader } from '@/app/(routes)/_shared/states';

export function ComingSoonPage({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title={title}
          description={description ?? 'This screen is on the accounting roadmap and will be wired next.'}
        />
        <div className="rounded-[2px] border border-black/10 bg-white px-6 py-16 text-center">
          <p className="text-base font-medium text-black">Coming soon</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This screen is on the accounting roadmap and will use the same filters and export pattern as live reports.
          </p>
        </div>
      </PageContainer>
    </RootLayout>
  );
}
