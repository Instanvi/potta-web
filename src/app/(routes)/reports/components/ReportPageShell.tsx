'use client';

import type { ReactNode } from 'react';
import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';

/** Single title + one content frame for live and runner reports. */
export function ReportPageShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader title={title} description={description} actions={actions} />
        <div className="rounded-[2px] border border-black/10 bg-white">
          <div className="p-4 md:p-5">{children}</div>
        </div>
      </PageContainer>
    </RootLayout>
  );
}
