'use client';

import { Can } from '@/components/auth/can';
import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';
import IntegrationTransactionsTable from './components/IntegrationTransactionsTable';

export default function Page() {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Integration transactions"
          description="Lines pushed from Pay, Expense, POS and other connected apps. Accept to post a journal."
        />
        <Can
          resource="JournalEntries"
          action="view-all"
          fallback={
            <p className="text-sm text-muted-foreground">
              You do not have permission to view integration transactions.
            </p>
          }
        >
          <IntegrationTransactionsTable />
        </Can>
      </PageContainer>
    </RootLayout>
  );
}
