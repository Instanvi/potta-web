'use client';

import AgingTab from '../../accounting/ledger/components/AgingTab';
import { ReportPageShell } from '../components/ReportPageShell';

export default function ApAgeingPage() {
  return (
    <ReportPageShell
      title="Accounts payable ageing"
      description="Vendor balances by ageing bucket. Scoped to the active branch unless you have org-wide access."
    >
      <AgingTab type="AP" />
    </ReportPageShell>
  );
}
