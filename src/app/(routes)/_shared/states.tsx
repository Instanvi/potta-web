import { ReactNode } from 'react';
import { InlineLoader } from '@potta/components/ui/loaders';

export const LoadingState = ({ label = 'Loading…' }: { label?: string }) => <InlineLoader label={label} />;

export const EmptyState = ({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-gray-300 py-16 text-center">
    <p className="font-medium text-gray-800">{title}</p>
    {description && <p className="text-sm text-gray-500">{description}</p>}
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
    <div className="flex flex-col items-center justify-center gap-3 border border-red-200 bg-red-50 py-12 text-center">
      <p className="font-medium text-red-700">Could not load data</p>
      <p className="text-sm text-red-600">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="border border-red-300 bg-white px-4 py-1.5 text-sm text-red-700 hover:bg-red-100"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export const PageHeader = ({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) => (
  <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl font-medium text-gray-900">{title}</h1>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

export const Tabs = <T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) => (
  <div className="flex w-fit bg-green-50 mb-6">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        onClick={() => onChange(tab.id)}
        className={`px-4 py-2.5 text-sm transition-colors ${
          value === tab.id
            ? 'border-b-2 border-green-700 text-green-700 font-medium'
            : 'text-gray-600 hover:text-green-700'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);
