'use client';
import RootLayout from '../layout';
import ArApDashboard from '../_shared/ArApDashboard';
import { PageContainer, PageHeader } from '../_shared/states';

export default function AccountReceivablesPage() {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Receivables dashboard"
          description="What customers owe, what is overdue and what was collected in the period."
        />
        <ArApDashboard side="ar" />
      </PageContainer>
    </RootLayout>
  );
}
