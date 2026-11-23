'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import RootLayout from '../../layout';
import ContactsContent, { readContactType } from '../../../../components/shared/ContactsContent';
import { PageContainer } from '../../_shared/states';

function PayableContactsBody() {
  const searchParams = useSearchParams();
  return <ContactsContent initialType={readContactType(searchParams.get('type'))} />;
}

export default function PayableContactsPage() {
  return (
    <RootLayout>
      <PageContainer>
        <Suspense fallback={null}>
          <PayableContactsBody />
        </Suspense>
      </PageContainer>
    </RootLayout>
  );
}
