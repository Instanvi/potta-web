'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { clearAccessToken, setAccessToken } from '@/lib/access-token';

/** Keeps the in-memory bearer token used by apiClient/authClient in sync with the next-auth session. */
export function SessionTokenSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      setAccessToken(session?.accessToken || session?.user?.accessToken);
    } else if (status === 'unauthenticated') {
      clearAccessToken();
    }
  }, [status, session?.accessToken, session?.user?.accessToken]);

  return null;
}
