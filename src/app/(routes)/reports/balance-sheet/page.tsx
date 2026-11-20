'use client';

import { useState } from 'react';
import { Can } from '@/components/auth/can';
import BalanceSheetReport from '../../accounting/reports/components/BalanceSheetReport';
import { ReportPageShell } from '../components/ReportPageShell';

export default function BalanceSheetPage() {
  const [hideZero, setHideZero] = useState(true);
  return (
    <ReportPageShell
      title="Balance Sheet"
      description="As-of balances from posted journal lines. Defaults to the active branch."
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
        action="view-balance-sheet"
        fallback={
          <Can resource="GeneralLedger" action="view-balance-sheet">
            <BalanceSheetReport hideZero={hideZero} />
          </Can>
        }
      >
        <BalanceSheetReport hideZero={hideZero} />
      </Can>
    </ReportPageShell>
  );
}
