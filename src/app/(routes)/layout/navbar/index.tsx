'use client';

import React, { useContext } from 'react';
import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { ContextData } from '../../../../components/providers/DataProvider';
import { LocationSwitcher } from '@potta/components/shell/location-switcher';
import { NotificationBell } from '@potta/components/shell/notification-bell';
import { getActiveModule, isNavActive } from '@/lib/navigation';

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

function getTitle(pathname: string): string {
  if (pathname === '/') return 'Home';
  const override = TITLE_OVERRIDES.find((t) => pathname === t.path);
  if (override) return override.title;
  const module = getActiveModule(pathname);
  if (!module) return pathname.split('/')[1]?.replace(/[_-]/g, ' ') ?? '';
  const item = [...module.items].reverse().find((i) => isNavActive(pathname, i));
  return item ? `${item.title} · ${module.title}` : module.title;
}

/** Top bar (payroll dashboard-header): page title on the left, location, notifications and user on the right. */
export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const context = useContext(ContextData);

  if (context?.layoutMode !== 'sidebar') return null;

  const initials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <nav className="sticky top-0 z-20 w-full border-b border-black/[0.06] bg-background">
      <div className="flex h-16 items-center justify-between px-3 md:px-4">
        <h1 className="ml-4 text-start text-lg font-medium capitalize text-foreground">{getTitle(pathname)}</h1>

        <div className="flex items-center gap-2">
          <LocationSwitcher />
          <NotificationBell />
          <div
            className="ml-1 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-medium text-white"
            title={session?.user?.email ?? undefined}
          >
            {initials || <User size={18} />}
          </div>
        </div>
      </div>
    </nav>
  );
}
