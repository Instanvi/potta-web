import type { Icon } from '@phosphor-icons/react';
import {
  ArrowsClockwise,
  Bank,
  BookOpen,
  Books,
  ChartLineUp,
  ChartPieSlice,
  Coins,
  FileText,
  Gift,
  House,
  Invoice,
  Notebook,
  Package,
  Percent,
  Receipt,
  ReceiptX,
  Repeat,
  ShoppingCart,
  Storefront,
  Tray,
  Users,
} from '@phosphor-icons/react';

export interface NavItem {
  title: string;
  href: string;
  icon: Icon;
  /** Exact match only (module home links). */
  exact?: boolean;
}

export interface NavModule {
  id: string;
  title: string;
  /** First path segment(s) that activate this module. */
  matchPrefixes: string[];
  items: NavItem[];
}

/** Potta POS + Books navigation. Items are filtered by src/lib/route-permissions.ts. */
export const NAV_MODULES: NavModule[] = [
  {
    id: 'pos',
    title: 'POS',
    matchPrefixes: ['/pos'],
    items: [
      { title: 'Register', href: '/pos', icon: House, exact: true },
      { title: 'Inventory', href: '/pos/inventory', icon: Package },
      { title: 'Sales', href: '/pos/sales', icon: ShoppingCart },
      { title: 'Customers', href: '/pos/customers', icon: Users },
      { title: 'Vendors', href: '/pos/vendors', icon: Storefront },
      { title: 'Desktop sync', href: '/pos/sync', icon: ArrowsClockwise },
    ],
  },
  {
    id: 'books',
    title: 'Books',
    matchPrefixes: ['/accounting'],
    items: [
      { title: 'Accounts', href: '/accounting', icon: Books, exact: true },
      { title: 'Journals', href: '/accounting/journals', icon: Notebook },
      { title: 'Ledger', href: '/accounting/ledger', icon: BookOpen },
      { title: 'Reports', href: '/accounting/reports', icon: ChartLineUp },
      { title: 'Cashbook', href: '/accounting/cashbook', icon: Coins },
      { title: 'Taxes', href: '/accounting/taxes', icon: Percent },
    ],
  },
  {
    id: 'ar',
    title: 'Account Receivables',
    matchPrefixes: ['/account_receivables', '/customers'],
    items: [
      { title: 'Dashboard', href: '/account_receivables', icon: ChartPieSlice, exact: true },
      { title: 'Invoices', href: '/account_receivables/invoice', icon: FileText },
      { title: 'Recurring', href: '/account_receivables/recurring', icon: Repeat },
      { title: 'Sales receipts', href: '/account_receivables/sales_receipts', icon: Receipt },
      { title: 'Credit notes', href: '/account_receivables/credit', icon: Tray },
      { title: 'Vouchers', href: '/account_receivables/vouchers', icon: Gift },
      { title: 'Customers', href: '/account_receivables/customers', icon: Users },
    ],
  },
  {
    id: 'ap',
    title: 'Account Payables',
    matchPrefixes: ['/account_payables', '/vendors'],
    items: [
      { title: 'Dashboard', href: '/account_payables', icon: ChartPieSlice, exact: true },
      { title: 'Bills', href: '/account_payables/bills', icon: Invoice },
      { title: 'Purchase orders', href: '/account_payables/purchase', icon: ShoppingCart },
      { title: 'Vendor credit notes', href: '/account_payables/credit-notes', icon: ReceiptX },
      { title: 'Vendors', href: '/account_payables/vendors', icon: Storefront },
    ],
  },
  {
    id: 'treasury',
    title: 'Treasury',
    matchPrefixes: ['/treasury'],
    items: [{ title: 'Bank accounts', href: '/treasury/bank-accounts', icon: Bank }],
  },
];

export function getActiveModule(pathname: string): NavModule | null {
  return (
    NAV_MODULES.find((m) => m.matchPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))) ?? null
  );
}

export function isNavActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
