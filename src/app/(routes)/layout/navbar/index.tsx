'use client';

import React, { useContext } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ContextData } from '../../../../components/providers/DataProvider';
import { LocationSwitcher } from '@potta/components/shell/location-switcher';
import { NotificationBell } from '@potta/components/shell/notification-bell';
import { getActiveModule, getActiveNavItem } from '@/lib/navigation';

const TITLE_OVERRIDES: { path: string; title: string }[] = [
  { path: '/pos/sales/new', title: 'New Sale' },
  { path: '/account_receivables/invoice/new', title: 'New Invoice' },
  { path: '/account_receivables/recurring/new', title: 'New Recurring Invoice' },
  { path: '/account_receivables/credit/new', title: 'New Credit Note' },
  { path: '/account_receivables/sales_receipts/new', title: 'New Sales Receipt' },
  { path: '/account_receivables/vouchers/new', title: 'New Voucher' },
  { path: '/account_payables/purchase/new', title: 'New Purchase Order' },
  { path: '/settings', title: 'Settings' },
  { path: '/settings/audit-logs', title: 'Audit log · Settings' },
  { path: '/notifications', title: 'Notifications' },
];

function getTitle(pathname: string, search: string): string {
  const override = TITLE_OVERRIDES.find((t) => pathname === t.path);
  if (override) return override.title;
  const module = getActiveModule(pathname);
  if (!module) return pathname.split('/')[1]?.replace(/[_-]/g, ' ') ?? '';
  const item = getActiveNavItem(pathname, module.items, search);
  return item ? `${item.title} · ${module.title}` : module.title;
}

/** Top bar (payroll dashboard-header): page title on the left, location and notifications on the right. */
export default function Navbar() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const context = useContext(ContextData);

  if (context?.layoutMode !== 'sidebar') return null;

  return (
    <nav className="sticky top-0 z-20 w-full border-b border-black/[0.06] bg-background font-sans">
      <div className="flex h-16 items-center justify-between px-3 md:px-4">
        <h1 className="ml-4 text-start text-lg font-medium capitalize text-foreground">
          {getTitle(pathname, search)}
        </h1>

        <div className="flex items-center gap-2">
          <LocationSwitcher />
          <NotificationBell />
        </div>
      </div>
    </nav>
  );
}
