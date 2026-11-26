'use client';

import { PageContainer, PageHeader } from '../../_shared/states';
import { DocumentLetterheadControls } from '@/components/DocumentLetterheadControls';
import { DocumentTemplateSamples } from '@/components/documents/document-template-samples';

export default function DocumentAppearancePage() {
  return (
    <PageContainer>
      <PageHeader title="Document appearance" />
      <div className="mx-auto w-full max-w-5xl">
        <p className="mb-4 text-sm text-muted-foreground">
          Choose the logo, accent, and layout used on invoices, bills, purchase orders,
          and the page a customer opens from a link. Changes are saved in this browser.
        </p>
        <DocumentLetterheadControls />
        <DocumentTemplateSamples />
      </div>
    </PageContainer>
  );
}
