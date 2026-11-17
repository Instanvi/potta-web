'use client';

import { useState } from 'react';
import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';
import { Can } from '@/components/auth/can';
import IncomeStatementReport from '../../accounting/reports/components/IncomeStatementReport';
import { PanelCard, PanelCardContent, PanelCardHeader } from '@/components/ui/panel-card';

export default function ProfitAndLossPage() {
  const [hideZero, setHideZero] = useState(true);
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Profit and Loss"
          description="Income statement from posted journal lines. Defaults to the active branch."
        />
        <PanelCard>
          <PanelCardHeader
            title="Profit and Loss"
            description="Visual representation of income and expenses for the period"
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
              action="view-income-statement"
              fallback={
                <Can resource="GeneralLedger" action="income-statement">
                  <IncomeStatementReport hideZero={hideZero} />
                </Can>
              }
            >
              <IncomeStatementReport hideZero={hideZero} />
            </Can>
          </PanelCardContent>
        </PanelCard>
      </PageContainer>
    </RootLayout>
  );
}
