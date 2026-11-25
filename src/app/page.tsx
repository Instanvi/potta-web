'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NAV_MODULES } from '@/lib/navigation';
import { useCanOpenRoute } from '@/lib/use-can-open-route';
import { useAuthContextStore } from '@/store/use-auth-context-store';

/** Prefer Home metrics; otherwise first module page the user can access. */
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
    if (canOpen('/home')) {
      router.replace('/home');
      return;
    }
    const first = NAV_MODULES.flatMap((m) => m.items).find((item) => canOpen(item.href));
    router.replace(first?.href ?? '/pos');
  }, [permissionsReady, waited, canOpen, router]);

  return <div className="min-h-screen bg-main-bg" aria-busy="true" aria-live="polite" />;
}
