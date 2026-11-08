import React from 'react';
import { AppSpinner } from '@potta/components/ui/loaders';

type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';

interface PottaLoaderProps {
  size?: LoaderSize;
  className?: string;
}

const SIZES: Record<Exclude<LoaderSize, 'custom'>, number> = { xs: 16, sm: 20, md: 28, lg: 36, xl: 48 };

/** Centered brand spinner; same ring as the other Instanvi apps. */
const PottaLoader: React.FC<PottaLoaderProps> = ({ size = 'md', className = '' }) => (
  <div role="status" aria-live="polite" aria-busy="true" className="flex h-full w-full items-center justify-center">
    <AppSpinner size={size === 'custom' ? 28 : SIZES[size]} className={className} />
    <span className="sr-only">Loading…</span>
  </div>
);

export default PottaLoader;
