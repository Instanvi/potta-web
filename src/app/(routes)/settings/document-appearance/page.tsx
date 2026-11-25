'use client';

import { PageContainer, PageHeader } from '../../_shared/states';
import { DocumentLetterheadControls } from '@/components/DocumentLetterheadControls';

export default function DocumentAppearancePage() {
  return (
    <PageContainer>
      <PageHeader title="Document appearance" />
      <div className="mx-auto w-full max-w-3xl">
        <p className="mb-4 text-sm text-muted-foreground">
          Choose the default logo, tagline, and accent used on invoices, bills,
          and other documents. Changes are saved in this browser.
        </p>
        <DocumentLetterheadControls />
      </div>
    </PageContainer>
  );
}
