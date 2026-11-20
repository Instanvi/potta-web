'use client';

import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';
import AgingTab from '../../accounting/ledger/components/AgingTab';
import { PanelCard, PanelCardContent, PanelCardHeader } from '@/components/ui/panel-card';

export default function ApAgeingPage() {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Accounts payable ageing"
          description="Vendor balances by ageing bucket. Scoped to the active branch unless you have org-wide access."
        />
        <PanelCard>
          <PanelCardHeader
            title="AP ageing"
            description="Outstanding payables by ageing bucket"
          />
          <PanelCardContent>
            <AgingTab type="AP" />
          </PanelCardContent>
        </PanelCard>
      </PageContainer>
    </RootLayout>
  );
}
