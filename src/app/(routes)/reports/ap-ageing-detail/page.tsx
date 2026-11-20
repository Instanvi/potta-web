'use client';

import { ReportRunner } from '../components/ReportRunner';

export default function ApAgeingDetailPage() {
  return (
    <ReportRunner
      reportId="ap-ageing-detail"
      title="Accounts payable ageing detail"
      description="Open bills by due-date ageing bucket. Scoped to the active branch unless you have org-wide access."
      mode="asOf"
    />
  );
}
