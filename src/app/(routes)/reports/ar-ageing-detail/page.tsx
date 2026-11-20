'use client';

import { ReportRunner } from '../components/ReportRunner';

export default function ArAgeingDetailPage() {
  return (
    <ReportRunner
      reportId="ar-ageing-detail"
      title="Accounts receivable ageing detail"
      description="Open invoices by due-date ageing bucket. Scoped to the active branch unless you have org-wide access."
      mode="asOf"
    />
  );
}
