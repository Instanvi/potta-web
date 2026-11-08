'use client';
import { useContext, useState } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';
import { Can } from '@/components/auth/can';
import RootLayout from '../../layout';
import { PageHeader, Tabs } from '../../_shared/states';
import BalanceSheetReport from './components/BalanceSheetReport';
import IncomeStatementReport from './components/IncomeStatementReport';

type Tab = 'balance-sheet' | 'income-statement';

const TABS: { id: Tab; label: string }[] = [
  { id: 'balance-sheet', label: 'Balance sheet' },
  { id: 'income-statement', label: 'Income statement' },
];

const NoAccess = () => (
  <p className="text-sm text-gray-500">You do not have permission to view this report.</p>
);

const ReportsPage = () => {
  const context = useContext(ContextData);
  const [tab, setTab] = useState<Tab>('balance-sheet');
  const [hideZero, setHideZero] = useState(true);

  return (
    <RootLayout>
      <div
        className={`${
          context?.layoutMode === 'sidebar' ? 'pl-8' : 'pl-5'
        } pr-5 py-6`}
      >
        <PageHeader
          title="Financial reports"
          description="OHADA balance sheet and income statement from the general ledger."
          actions={
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={hideZero}
                onChange={(e) => setHideZero(e.target.checked)}
                className="accent-green-700"
              />
              Hide zero balances
            </label>
          }
        />
        <Tabs tabs={TABS} value={tab} onChange={setTab} />
        {tab === 'balance-sheet' ? (
          <Can resource="Ledger" action="view-balance-sheet" fallback={<NoAccess />}>
            <BalanceSheetReport hideZero={hideZero} />
          </Can>
        ) : (
          <Can resource="Ledger" action="view-income-statement" fallback={<NoAccess />}>
            <IncomeStatementReport hideZero={hideZero} />
          </Can>
        )}
      </div>
    </RootLayout>
  );
};

export default ReportsPage;
