'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RootLayout from '@/app/(routes)/layout';
import { PageContainer, Panel } from '@/app/(routes)/_shared/states';

export default function Page() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/accounting');
  }, [router]);

  return (
    <RootLayout>
      <PageContainer>
        <Panel className="px-6 py-16 text-center text-sm text-muted-foreground">
          My accountant has been removed. Redirecting to Accounts…
        </Panel>
      </PageContainer>
    </RootLayout>
  );
}
