'use client';
import { useContext, useState } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';
import { Can } from '@/components/auth/can';
import RootLayout from '../../layout';
import { PageHeader, Tabs } from '../../_shared/states';
import EntityHealthPanel from './components/EntityHealthPanel';
import FeedPanel from './components/FeedPanel';
import MappingsPanel from './components/MappingsPanel';
import ReconcilePanel from './components/ReconcilePanel';
import RequestLookupPanel from './components/RequestLookupPanel';

type Tab = 'reconcile' | 'health' | 'mappings' | 'feed' | 'requests';

const TABS: { id: Tab; label: string }[] = [
  { id: 'reconcile', label: 'Reconcile' },
  { id: 'health', label: 'Entity health' },
  { id: 'mappings', label: 'Mappings' },
  { id: 'feed', label: 'Change feed' },
  { id: 'requests', label: 'Request lookup' },
];

const PosSyncPage = () => {
  const context = useContext(ContextData);
  const [tab, setTab] = useState<Tab>('reconcile');

  return (
    <RootLayout>
      <div
        className={`${
          context?.layoutMode === 'sidebar' ? 'pl-8' : 'pl-5'
        } pr-5 py-6 h-full overflow-y-auto`}
      >
        <PageHeader
          title="Desktop sync"
          description="Monitor what the Potta POS desktop app has pushed and what it will pull."
        />
        <Can
          resource="Transactions"
          action="view"
          fallback={
            <p className="text-sm text-gray-500">
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
      </div>
    </RootLayout>
  );
};

export default PosSyncPage;
