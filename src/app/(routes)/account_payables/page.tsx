'use client';
import RootLayout from '../layout';
import ArApDashboard from '../_shared/ArApDashboard';
import { PageContainer, PageHeader } from '../_shared/states';

export default function AccountPayablesPage() {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Payables dashboard"
          description="What you owe vendors, what is overdue and what was paid in the period."
        />
        <ArApDashboard side="ap" />
      </PageContainer>
    </RootLayout>
  );
}
