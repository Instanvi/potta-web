import * as React from 'react';
import Image from 'next/image';
import { cn } from '@potta/lib/utils';

export type StateVariant = 'not-found' | 'error' | 'forbidden';

/** Small brand-coloured illustrations (document + magnifier, broken card, lock). */
function Illustration({ variant }: { variant: StateVariant }) {
  const common = { width: 168, height: 128, viewBox: '0 0 168 128', fill: 'none', 'aria-hidden': true } as const;
  if (variant === 'not-found') {
    return (
      <svg {...common}>
        <ellipse cx="84" cy="116" rx="56" ry="6" fill="#237804" opacity="0.08" />
        <rect x="38" y="14" width="72" height="92" rx="4" fill="#f1faf7" stroke="#237804" strokeOpacity="0.25" />
        <rect x="50" y="30" width="40" height="6" rx="3" fill="#237804" opacity="0.35" />
        <rect x="50" y="44" width="48" height="5" rx="2.5" fill="#237804" opacity="0.15" />
        <rect x="50" y="56" width="34" height="5" rx="2.5" fill="#237804" opacity="0.15" />
        <rect x="50" y="68" width="42" height="5" rx="2.5" fill="#237804" opacity="0.15" />
        <circle cx="108" cy="76" r="20" fill="#ffffff" stroke="#237804" strokeWidth="5" />
        <path d="M122.5 90.5 136 104" stroke="#237804" strokeWidth="7" strokeLinecap="round" />
        <path d="M101 70l14 12M115 70l-14 12" stroke="#a0e86f" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }
  if (variant === 'forbidden') {
    return (
      <svg {...common}>
        <ellipse cx="84" cy="116" rx="52" ry="6" fill="#237804" opacity="0.08" />
        <path d="M64 54V42a20 20 0 0 1 40 0v12" stroke="#237804" strokeOpacity="0.45" strokeWidth="8" strokeLinecap="round" />
        <rect x="48" y="52" width="72" height="56" rx="6" fill="#f1faf7" stroke="#237804" strokeOpacity="0.3" />
        <circle cx="84" cy="76" r="8" fill="#237804" />
        <rect x="81" y="80" width="6" height="14" rx="3" fill="#237804" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <ellipse cx="84" cy="116" rx="56" ry="6" fill="#237804" opacity="0.08" />
      <path d="M36 28h44l-8 26 10 10-10 42H36a4 4 0 0 1-4-4V32a4 4 0 0 1 4-4Z" fill="#f1faf7" stroke="#237804" strokeOpacity="0.25" />
      <path d="M90 28h42a4 4 0 0 1 4 4v70a4 4 0 0 1-4 4H86l10-38-10-10 4-30Z" fill="#f1faf7" stroke="#237804" strokeOpacity="0.25" />
      <rect x="44" y="42" width="24" height="5" rx="2.5" fill="#237804" opacity="0.3" />
      <rect x="100" y="42" width="24" height="5" rx="2.5" fill="#237804" opacity="0.3" />
      <circle cx="122" cy="26" r="16" fill="#fff7e6" stroke="#f59e0b" strokeWidth="3" />
      <path d="M122 18v10" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="122" cy="34" r="2.2" fill="#f59e0b" />
    </svg>
  );
}

export interface StateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
}

function ActionButton({ action, primary }: { action: StateAction; primary?: boolean }) {
  const className = cn(
    'flex h-11 w-full items-center justify-center gap-2 px-6 text-sm transition-colors sm:w-auto',
    primary
      ? 'bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]'
      : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
  );
  if (action.href) {
    return (
      <a href={action.href} className={className}>
        {action.icon}
        {action.label}
      </a>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={className}>
      {action.icon}
      {action.label}
    </button>
  );
}

/** Full-page (or embedded) state screen: not found, error, forbidden. Same layout as the other Instanvi apps. */
export function StateScreen({
  variant,
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  footer,
  children,
  embedded = false,
  className,
}: {
  variant: StateVariant;
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  primaryAction?: StateAction;
  secondaryAction?: StateAction;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  /** Render inside a page (no full-height background). */
  embedded?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-center p-6',
        embedded ? 'min-h-[60vh]' : 'min-h-screen bg-[var(--main-bg)]',
        className,
      )}
    >
      <div className="w-full max-w-md space-y-6 text-center">
        {!embedded && (
          <div className="flex justify-center">
            <Image src="/potta.svg" alt="Potta" width={49} height={51} className="h-9 w-auto opacity-90" priority />
          </div>
        )}
        <div className="flex justify-center">
          <Illustration variant={variant} />
        </div>
        <div className="space-y-2">
          {eyebrow && <p className="text-xs font-medium uppercase tracking-widest text-gray-400">{eyebrow}</p>}
          <h1 className="text-2xl font-medium tracking-tight text-gray-900">{title}</h1>
          {description && <div className="mx-auto max-w-sm text-sm leading-relaxed text-gray-500">{description}</div>}
        </div>
        {children}
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
            {secondaryAction && <ActionButton action={secondaryAction} />}
            {primaryAction && <ActionButton action={primaryAction} primary />}
          </div>
        )}
        {footer && <p className="pt-2 text-xs text-gray-400">{footer}</p>}
      </div>
    </div>
  );
}
