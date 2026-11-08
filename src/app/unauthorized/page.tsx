'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowClockwise, House } from '@phosphor-icons/react';
import { StateScreen } from '@potta/components/ui/state-screen';

const ERRORS: Record<string, { title: string; description: string }> = {
  sync_failed: {
    title: 'Session sync failed',
    description:
      "We couldn't synchronize your session. Your sign-in has probably expired or the authentication token was invalid.",
  },
  missing_token: {
    title: 'Authentication required',
    description: 'No valid sign-in was provided. Sign in through the Instanvi portal to continue.',
  },
};

const DEFAULT_ERROR = {
  title: 'Access denied',
  description:
    "You don't have the permissions needed for this page. Sign in again or ask your organization administrator for access.",
};

export default function UnauthorizedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = ERRORS[searchParams.get('error') || ''] || DEFAULT_ERROR;

  const signInAgain = () => {
    const superAppUrl = process.env.NEXT_PUBLIC_SUPER_APP_URL || 'https://auth.instanvi.com';
    const callbackUrl = `${window.location.origin}/auth-callback?callbackUrl=/`;
    window.location.href = `${superAppUrl}/login?callbackUrl=${encodeURIComponent(callbackUrl)}&desktop=true`;
  };

  return (
    <StateScreen
      variant="forbidden"
      eyebrow="Unauthorized"
      title={current.title}
      description={current.description}
      secondaryAction={{ label: 'Go home', onClick: () => router.push('/'), icon: <House size={16} /> }}
      primaryAction={{ label: 'Sign in again', onClick: signInAgain, icon: <ArrowClockwise size={16} /> }}
      footer="If this keeps happening, contact your system administrator."
    />
  );
}
