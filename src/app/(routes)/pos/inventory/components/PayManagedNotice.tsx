'use client';
import { ArrowsClockwise } from '@phosphor-icons/react';
import { formatDate } from '../../../_shared/format';

/** Shown on Pay-linked products: payment-service owns their details, Potta only restocks them. */
const PayManagedNotice = ({
  payProductId,
  lastSynced,
  className = '',
}: {
  payProductId: string;
  lastSynced?: string | null;
  className?: string;
}) => (
  <div className={`rounded-[2px] border border-primary/20 bg-brand-subtle p-4 ${className}`}>
    <div className="flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[2px] bg-background text-primary">
        <ArrowsClockwise size={18} />
      </span>
      <div className="min-w-0 space-y-1 text-sm">
        <p className="font-medium text-foreground">Managed in Pay</p>
        <p className="text-muted-foreground">
          Edit this product in Pay (payment-service), then use Sync from Pay. Restocking stays available here.
        </p>
        <p className="text-xs text-muted-foreground">
          Pay product ID <span className="font-mono text-foreground">{payProductId}</span>
          {lastSynced ? <> · last synced {formatDate(lastSynced)}</> : null}
        </p>
      </div>
    </div>
  </div>
);

export default PayManagedNotice;
