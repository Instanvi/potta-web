'use client';
import { Suspense, useState } from 'react';
import { Can } from '@/components/auth/can';
import RootLayout from '../../layout';
import { LoadingState, PageContainer, Tabs } from '../../_shared/states';
import EntityHealthPanel from './components/EntityHealthPanel';
import FeedPanel from './components/FeedPanel';
import MappingsPanel from './components/MappingsPanel';
import ReconcilePanel from './components/ReconcilePanel';
import SyncActivityPanel from './components/SyncActivityPanel';

type Tab = 'activity' | 'reconcile' | 'health' | 'mappings' | 'feed';

const TABS: { id: Tab; label: string }[] = [
  { id: 'activity', label: 'Activity' },
  { id: 'reconcile', label: 'Match check' },
  { id: 'health', label: 'Problems' },
  { id: 'mappings', label: 'Links' },
  { id: 'feed', label: 'Recent changes' },
];

const PosSyncPage = () => {
  const [tab, setTab] = useState<Tab>('activity');

  return (
    <RootLayout>
      <PageContainer>
        <Can
          resource="Transactions"
          action="view"
          fallback={
            <p className="text-sm text-muted-foreground">
              You do not have permission to view sync activity.
            </p>
          }
        >
          <Tabs tabs={TABS} value={tab} onChange={setTab} />
          {tab === 'activity' && (
            <Suspense fallback={<LoadingState />}>
              <SyncActivityPanel />
            </Suspense>
          )}
          {tab === 'reconcile' && <ReconcilePanel />}
          {tab === 'health' && <EntityHealthPanel />}
          {tab === 'mappings' && <MappingsPanel />}
          {tab === 'feed' && <FeedPanel />}
        </Can>
      </PageContainer>
    </RootLayout>
  );
};

export default PosSyncPage;
