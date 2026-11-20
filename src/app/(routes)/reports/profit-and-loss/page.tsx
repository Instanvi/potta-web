'use client';

import { useState } from 'react';
import { Can } from '@/components/auth/can';
import IncomeStatementReport from '../../accounting/reports/components/IncomeStatementReport';
import { ReportPageShell } from '../components/ReportPageShell';

export default function ProfitAndLossPage() {
  const [hideZero, setHideZero] = useState(true);
  return (
    <ReportPageShell
      title="Profit and Loss"
      description="Income statement from posted journal lines. Defaults to the active branch."
      actions={
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
    >
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
    </ReportPageShell>
  );
}
