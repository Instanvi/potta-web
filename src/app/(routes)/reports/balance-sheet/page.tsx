'use client';

import { useState } from 'react';
import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';
import { Can } from '@/components/auth/can';
import BalanceSheetReport from '../../accounting/reports/components/BalanceSheetReport';
import { PanelCard, PanelCardContent, PanelCardHeader } from '@/components/ui/panel-card';

export default function BalanceSheetPage() {
  const [hideZero, setHideZero] = useState(true);
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Balance Sheet"
          description="As-of balances from posted journal lines. Defaults to the active branch."
        />
        <PanelCard>
          <PanelCardHeader
            title="Balance Sheet"
            description="Visual representation of assets, liabilities and equity"
            action={
              <label className="flex items-center gap-2 text-sm text-black/70">
                <input
                  type="checkbox"
                  checked={hideZero}
                  onChange={(e) => setHideZero(e.target.checked)}
                  className="accent-primary"
                />
                Hide zero balances
              </label>
            }
          />
          <PanelCardContent>
            <Can
              resource="Ledger"
              action="view-balance-sheet"
              fallback={
                <Can resource="GeneralLedger" action="view-balance-sheet">
                  <BalanceSheetReport hideZero={hideZero} />
                </Can>
              }
            >
              <BalanceSheetReport hideZero={hideZero} />
            </Can>
          </PanelCardContent>
        </PanelCard>
      </PageContainer>
    </RootLayout>
  );
}
