'use client';
import { useContext, useState } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';
import { Can } from '@/components/auth/can';
import RootLayout from '../../layout';
import { PageHeader, Tabs } from '../../_shared/states';
import AgingTab from './components/AgingTab';
import GeneralLedgerTab from './components/GeneralLedgerTab';

type Tab = 'general' | 'AR' | 'AP';

const TABS: { id: Tab; label: string }[] = [
  { id: 'general', label: 'General ledger' },
  { id: 'AR', label: 'Receivables aging' },
  { id: 'AP', label: 'Payables aging' },
];

const NoAccess = () => (
  <p className="text-sm text-gray-500">You do not have permission to view this ledger.</p>
);

const LedgerPage = () => {
  const context = useContext(ContextData);
  const [tab, setTab] = useState<Tab>('general');

  return (
    <RootLayout>
      <div
        className={`${
          context?.layoutMode === 'sidebar' ? 'pl-8' : 'pl-5'
        } pr-5 py-6`}
      >
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
      </div>
    </RootLayout>
  );
};

export default LedgerPage;
