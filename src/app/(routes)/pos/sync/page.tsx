'use client';
import { useState } from 'react';
import { Can } from '@/components/auth/can';
import RootLayout from '../../layout';
import { PageContainer, Tabs } from '../../_shared/states';
import EntityHealthPanel from './components/EntityHealthPanel';
import FeedPanel from './components/FeedPanel';
import MappingsPanel from './components/MappingsPanel';
import ReconcilePanel from './components/ReconcilePanel';
import RequestLookupPanel from './components/RequestLookupPanel';

type Tab = 'reconcile' | 'health' | 'mappings' | 'feed' | 'requests';

const TABS: { id: Tab; label: string }[] = [
  { id: 'reconcile', label: 'Match check' },
  { id: 'health', label: 'Problems' },
  { id: 'mappings', label: 'Links' },
  { id: 'feed', label: 'Recent changes' },
  { id: 'requests', label: 'Find a request' },
];

const PosSyncPage = () => {
  const [tab, setTab] = useState<Tab>('reconcile');

  return (
    <RootLayout>
      <PageContainer>
        
        <Can
          resource="Transactions"
          action="view"
          fallback={
            <p className="text-sm text-muted-foreground">
              You do not have permission to view POS sync diagnostics.
            </p>
          }
        >
          <Tabs tabs={TABS} value={tab} onChange={setTab} />
          {tab === 'reconcile' && <ReconcilePanel />}
          {tab === 'health' && <EntityHealthPanel />}
          {tab === 'mappings' && <MappingsPanel />}
          {tab === 'feed' && <FeedPanel />}
          {tab === 'requests' && <RequestLookupPanel />}
        </Can>
      </PageContainer>
    </RootLayout>
  );
};

export default PosSyncPage;
