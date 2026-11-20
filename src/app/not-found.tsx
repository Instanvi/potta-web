'use client';

import { ArrowLeft, House } from '@phosphor-icons/react';
import { StateScreen } from '@potta/components/ui/state-screen';

export default function NotFound() {
  return (
    <StateScreen
      variant="not-found"
      eyebrow="404"
      title="Page not found"
      description="The page you're looking for doesn't exist, was moved, or you don't have access to it."
      secondaryAction={{
        label: 'Go back',
        onClick: () => window.history.back(),
        icon: <ArrowLeft size={16} />,
      }}
      primaryAction={{ label: 'Go home', href: '/', icon: <House size={16} /> }}
    />
  );
}
