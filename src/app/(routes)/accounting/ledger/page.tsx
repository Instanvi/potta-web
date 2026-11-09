'use client';
import { useState } from 'react';
import { Can } from '@/components/auth/can';
import RootLayout from '../../layout';
import { PageContainer, PageHeader, Tabs } from '../../_shared/states';
import AgingTab from './components/AgingTab';
import GeneralLedgerTab from './components/GeneralLedgerTab';

type Tab = 'general' | 'AR' | 'AP';

const TABS: { id: Tab; label: string }[] = [
  { id: 'general', label: 'General ledger' },
  { id: 'AR', label: 'Receivables aging' },
  { id: 'AP', label: 'Payables aging' },
];

const NoAccess = () => (
  <p className="text-sm text-muted-foreground">You do not have permission to view this ledger.</p>
);

const LedgerPage = () => {
  const [tab, setTab] = useState<Tab>('general');

  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Ledger"
          description="Posted entries and customer/vendor balances by age."
        />
        <Tabs tabs={TABS} value={tab} onChange={setTab} />
        {tab === 'general' ? (
          <Can resource="Ledger" action="view-entries" fallback={<NoAccess />}>
            <GeneralLedgerTab />
          </Can>
        ) : (
          <Can resource="Ledger" action="view-sub-ledgers" fallback={<NoAccess />}>
            <AgingTab key={tab} type={tab} />
          </Can>
        )}
      </PageContainer>
    </RootLayout>
  );
};

export default LedgerPage;
