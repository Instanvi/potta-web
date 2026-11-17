'use client';

import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';
import AgingTab from '../../accounting/ledger/components/AgingTab';

export default function ArAgeingPage() {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Accounts receivable ageing"
          description="Customer balances by ageing bucket. Scoped to the active branch unless you have org-wide access."
        />
        <AgingTab type="AR" />
      </PageContainer>
    </RootLayout>
  );
}
