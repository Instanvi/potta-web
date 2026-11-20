'use client';

import AgingTab from '../../accounting/ledger/components/AgingTab';
import { ReportPageShell } from '../components/ReportPageShell';

export default function ArAgeingPage() {
  return (
    <ReportPageShell
      title="Accounts receivable ageing"
      description="Customer balances by ageing bucket. Scoped to the active branch unless you have org-wide access."
    >
      <AgingTab type="AR" />
    </ReportPageShell>
  );
}
