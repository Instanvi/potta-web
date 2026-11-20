'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Reports moved to the standalone /reports hub. */
export default function AccountingReportsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/reports');
  }, [router]);
  return null;
}
