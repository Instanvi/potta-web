'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@potta/components/ui/loaders';
import { NAV_MODULES } from '@/lib/navigation';
import { useCanOpenRoute } from '@/lib/use-can-open-route';
import { useAuthContextStore } from '@/store/use-auth-context-store';

/** No landing page: open the first module page the user can access (the sidebar rail switches modules). */
export default function RootRedirect() {
  const router = useRouter();
  const canOpen = useCanOpenRoute();
  const permissionsReady = useAuthContextStore(
    (s) => Object.keys(s.permissions ?? {}).length > 0 || (s.roleNames?.length ?? 0) > 0
  );
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setWaited(true), 1500);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!permissionsReady && !waited) return;
    const first = NAV_MODULES.flatMap((m) => m.items).find((item) => canOpen(item.href));
    router.replace(first?.href ?? '/pos');
  }, [permissionsReady, waited, canOpen, router]);

  return <PageLoader />;
}
