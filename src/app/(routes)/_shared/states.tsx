import { ReactNode } from 'react';
import { InlineLoader } from '@potta/components/ui/loaders';
import { cn } from '@potta/lib/utils';

export const LoadingState = ({ label = 'Loading…' }: { label?: string }) => <InlineLoader label={label} />;

/** Page canvas used by every books page (payroll DashboardPage). */
export const PageContainer = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('min-h-full bg-main-bg p-4 md:p-5', className)}>{children}</div>
);

/**
 * List page toolbar: search/filters on the left, actions (lime Export, green primary) on the right.
 * Pass a DynamicFilter with className="p-0" as `children`.
 */
export const ListToolbar = ({
  children,
  actions,
  className,
}: {
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) => (
  <div className={cn('mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between', className)}>
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">{children}</div>
    {actions && <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">{actions}</div>}
  </div>
);

/** White content block (payroll DashboardPanel). */
export const Panel = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('dashboard-panel', className)}>{children}</div>
);

/** KPI card: small label over a large tabular value. */
export const StatCard = ({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: 'default' | 'success' | 'destructive';
}) => (
  <div className="dashboard-panel p-4">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p
      className={cn(
        'mt-1 text-2xl font-medium tabular-nums',
        tone === 'success' && 'text-success',
        tone === 'destructive' && 'text-destructive'
      )}
    >
      {value}
    </p>
    {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);

export const EmptyState = ({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) => (
  <div className="dashboard-panel flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
    <p className="text-base font-medium text-foreground">{title}</p>
    {description && <p className="text-sm text-muted-foreground">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export const ErrorState = ({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) => {
  const err = error as any;
  const raw = err?.response?.data?.message ?? err?.message;
  const message = Array.isArray(raw) ? raw.join(', ') : raw || 'Something went wrong';
  return (
    <div className="dashboard-panel flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <p className="text-base font-medium text-destructive">Could not load data</p>
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="h-9 rounded-[2px] border border-input bg-background px-4 text-sm font-medium text-foreground hover:bg-accent"
        >
          Retry
        </button>
      )}
    </div>
  );
};

/** Page title row; the top bar already names the page, so the description carries the context. */
export const PageHeader = ({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) => (
  <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
    <div>
      <h2 className="text-lg font-medium text-foreground">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);

/** Segmented control (payroll segmented-control). */
export const Tabs = <T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) => (
  <div className="mb-5 flex w-fit gap-1 rounded-[2px] bg-brand-subtle p-1">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        onClick={() => onChange(tab.id)}
        className={cn(
          'h-9 rounded-[2px] px-4 text-sm font-medium transition-colors',
          value === tab.id
            ? 'bg-background text-primary shadow-sm'
            : 'text-muted-foreground hover:text-primary'
        )}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

const STATUS_TONES: Record<string, string> = {
  success: 'border-success/60 bg-background text-success',
  danger: 'border-destructive bg-destructive text-white',
  warning: 'border-warning/60 bg-background text-warning',
  neutral: 'border-transparent bg-muted text-muted-foreground',
};

/** Square status badge (payroll status-badge). */
export const StatusBadge = ({
  tone = 'neutral',
  children,
}: {
  tone?: keyof typeof STATUS_TONES;
  children: ReactNode;
}) => (
  <span
    className={cn(
      'inline-flex h-7 items-center gap-1.5 rounded-[2px] border px-2 text-xs font-medium',
      STATUS_TONES[tone]
    )}
  >
    {children}
  </span>
);
