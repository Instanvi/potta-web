'use client';

import { ArrowClockwise, House } from '@phosphor-icons/react';
import { StateScreen } from '@potta/components/ui/state-screen';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <StateScreen
      variant="error"
      eyebrow="Something went wrong"
      title="We couldn't load this page"
      description="An unexpected error occurred. Try again, and if it keeps happening contact your administrator."
      secondaryAction={{ label: 'Go home', href: '/', icon: <House size={16} /> }}
      primaryAction={{ label: 'Try again', onClick: () => reset(), icon: <ArrowClockwise size={16} /> }}
      footer={error.digest ? `Reference: ${error.digest}` : undefined}
    >
      {process.env.NODE_ENV === 'development' && error.message && (
        <details className="mx-auto max-w-sm text-left">
          <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600">Error details (development)</summary>
          <pre className="mt-2 overflow-auto whitespace-pre-wrap bg-gray-100 p-3 text-xs text-gray-700">{error.message}</pre>
        </details>
      )}
    </StateScreen>
  );
}
