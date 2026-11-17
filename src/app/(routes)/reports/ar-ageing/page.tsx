'use client';

import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';
import AgingTab from '../../accounting/ledger/components/AgingTab';
import { PanelCard, PanelCardContent, PanelCardHeader } from '@/components/ui/panel-card';

export default function ArAgeingPage() {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Accounts receivable ageing"
          description="Customer balances by ageing bucket. Scoped to the active branch unless you have org-wide access."
        />
        <PanelCard>
          <PanelCardHeader
            title="AR ageing"
            description="Outstanding receivables by ageing bucket"
          />
          <PanelCardContent>
            <AgingTab type="AR" />
          </PanelCardContent>
        </PanelCard>
      </PageContainer>
    </RootLayout>
  );
}
