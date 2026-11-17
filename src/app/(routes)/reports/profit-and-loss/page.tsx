'use client';

import { useState } from 'react';
import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';
import { Can } from '@/components/auth/can';
import IncomeStatementReport from '../../accounting/reports/components/IncomeStatementReport';

export default function ProfitAndLossPage() {
  const [hideZero, setHideZero] = useState(true);
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Profit and Loss"
          description="Income statement from posted journal lines. Defaults to the active branch."
          actions={
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
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
      </PageContainer>
    </RootLayout>
  );
}
