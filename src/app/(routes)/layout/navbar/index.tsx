'use client';

import React, { useContext } from 'react';
import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import PosCustomersBox from './boxes/PosCustomersBox';
import PosSalesBox from './boxes/PosSalesBox';
import VendorsBox from './boxes/PosVendorsBox';
import InvoiceBox from './boxes/InvoiceBox';
import VouchersBox from '../../account_receivables/vouchers/components/boxVouchers';
import { ContextData } from '../../../../components/providers/DataProvider';
import AppLauncher from '../../../../components/AppLauncher';
import { LocationSwitcher } from '@potta/components/shell/location-switcher';
import { InstanviAppsMenu } from '@potta/components/shell/instanvi-apps-menu';
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

/** Summary boxes shown under the title on list pages. */
const BOXES: { path: string; component: React.ComponentType }[] = [
  { path: '/pos/sales', component: PosSalesBox },
  { path: '/pos/customers', component: PosCustomersBox },
  { path: '/account_receivables/customers', component: PosCustomersBox },
  { path: '/pos/vendors', component: VendorsBox },
  { path: '/account_payables/vendors', component: VendorsBox },
  { path: '/account_receivables/invoice', component: InvoiceBox },
  { path: '/account_receivables/vouchers', component: VouchersBox },
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

export default function Navbar({ showChatAI = false }: { showChatAI?: boolean }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const context = useContext(ContextData);

  if (context?.layoutMode !== 'sidebar') return null;

  const Box = BOXES.find((b) => pathname === b.path)?.component;
  const initials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <nav className={`sticky top-0 z-20 w-full border-b border-black/10 ${Box ? 'bg-blue-50' : 'bg-white'}`}>
      <div className="flex h-16 items-center justify-between">
        <h1 className="ml-16 text-start text-xl font-medium capitalize text-black">{getTitle(pathname)}</h1>

        <div className="flex items-center gap-2 pr-6">
          <NotificationBell />
          <LocationSwitcher />
          <div className="mx-1 h-6 w-px bg-gray-200" />
          <AppLauncher />
          <InstanviAppsMenu />
          <div
            className="ml-1 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-green-800 text-sm font-medium text-white"
            title={session?.user?.email ?? undefined}
          >
            {initials || <User size={20} />}
          </div>
        </div>
      </div>

      {Box && (
        <div className={`${showChatAI ? 'ml-5' : 'ml-14'} pb-10`}>
          <Box />
        </div>
      )}
    </nav>
  );
}
