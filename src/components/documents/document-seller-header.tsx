'use client';

import { Skeleton } from '@/components/shadcn/skeleton';
import {
  formatOrgAddress,
  orgDisplayName,
  useOrganizationProfile,
} from '@/hooks/use-organization-profile';
import { cn } from '@/lib/utils';
import type { OrganizationProfile } from '@/types/auth';

function SellerBlock({
  org,
  className,
  compact,
}: {
  org: OrganizationProfile;
  className?: string;
  compact?: boolean;
}) {
  const name = orgDisplayName(org);
  const address = formatOrgAddress(org);
  const email = org.businessEmail;
  const phone = org.businessPhone;
  const reg = org.registrationNumber;
  const tax = org.taxIdentificationNumber;

  return (
    <div className={cn('flex gap-3 text-sm', className)}>
      {org.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={org.logo}
          alt={name || 'Organization logo'}
          className={cn(
            'shrink-0 object-contain',
            compact ? 'h-10 w-10' : 'h-14 w-14',
          )}
        />
      ) : null}
      <div className="min-w-0 space-y-0.5 text-muted-foreground">
        {name ? <p className="font-medium text-foreground">{name}</p> : null}
        {email ? <p>{email}</p> : null}
        {phone ? <p>{phone}</p> : null}
        {address.map((line) => (
          <p key={line}>{line}</p>
        ))}
        {reg ? <p>Reg. {reg}</p> : null}
        {tax ? <p>Tax ID {tax}</p> : null}
      </div>
    </div>
  );
}

/** Seller / From block for invoice and other document previews — Auth org only. */
export function DocumentSellerHeader({
  label = 'From',
  className,
  compact,
}: {
  label?: string;
  className?: string;
  compact?: boolean;
}) {
  const { data: org, isLoading, isError } = useOrganizationProfile();

  if (isLoading) {
    return (
      <div className={cn('min-w-[140px] flex-1 space-y-2', className)}>
        {label ? <p className="mb-1 font-medium text-foreground">{label}</p> : null}
        <div className="flex gap-3">
          <Skeleton className="h-14 w-14 shrink-0 rounded-[2px]" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !org) {
    return (
      <div className={cn('min-w-[140px] flex-1', className)}>
        {label ? <p className="mb-1 font-medium text-foreground">{label}</p> : null}
        <p className="text-sm text-muted-foreground">Organization details unavailable</p>
      </div>
    );
  }

  return (
    <div className={cn('min-w-[140px] flex-1', className)}>
      {label ? <p className="mb-1 font-medium text-foreground">{label}</p> : null}
      <SellerBlock org={org} compact={compact} />
    </div>
  );
}

export function DocumentSellerBlockFromProfile({
  org,
  label = 'From',
  className,
  compact,
}: {
  org: OrganizationProfile;
  label?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn('min-w-[140px] flex-1', className)}>
      {label ? <p className="mb-1 font-medium text-foreground">{label}</p> : null}
      <SellerBlock org={org} compact={compact} />
    </div>
  );
}
