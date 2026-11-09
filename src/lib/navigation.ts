import type { Icon } from '@phosphor-icons/react';
import { APP_ICONS } from '@/components/app-icon';
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
  /** Payroll-expense SVG (APP_ICONS) shown on the home tiles; falls back to `icon`. */
  appIcon?: string;
  /** Exact match only (module home links). */
  exact?: boolean;
}

export interface NavModule {
  id: string;
  title: string;
  /** One line shown on the home control card. */
  description: string;
  icon: Icon;
  /** First path segment(s) that activate this module. */
  matchPrefixes: string[];
  items: NavItem[];
}

/** Potta POS + Books navigation. Items are filtered by src/lib/route-permissions.ts. */
export const NAV_MODULES: NavModule[] = [
  {
    id: 'pos',
    title: 'POS',
    description: 'Ring up sales, manage stock and keep the desktop till in sync.',
    icon: Storefront,
    matchPrefixes: ['/pos'],
    items: [
      { title: 'Register', href: '/pos', icon: House, appIcon: APP_ICONS.shoppingCart, exact: true },
      { title: 'Inventory', href: '/pos/inventory', icon: Package },
      { title: 'Sales', href: '/pos/sales', icon: ShoppingCart, appIcon: APP_ICONS.transactions },
      { title: 'Customers', href: '/pos/customers', icon: Users, appIcon: APP_ICONS.people },
      { title: 'Vendors', href: '/pos/vendors', icon: Storefront },
      { title: 'Desktop sync', href: '/pos/sync', icon: ArrowsClockwise },
    ],
  },
  {
    id: 'books',
    title: 'Books',
    description: 'Chart of accounts, journals, ledger, cashbook and financial reports.',
    icon: Books,
    matchPrefixes: ['/accounting'],
    items: [
      { title: 'Accounts', href: '/accounting', icon: Books, appIcon: APP_ICONS.budget, exact: true },
      { title: 'Journals', href: '/accounting/journals', icon: Notebook },
      { title: 'Ledger', href: '/accounting/ledger', icon: BookOpen },
      { title: 'Reports', href: '/accounting/reports', icon: ChartLineUp, appIcon: APP_ICONS.report },
      { title: 'Cashbook', href: '/accounting/cashbook', icon: Coins, appIcon: APP_ICONS.money },
      { title: 'Taxes', href: '/accounting/taxes', icon: Percent, appIcon: APP_ICONS.taxes },
    ],
  },
  {
    id: 'ar',
    title: 'Account Receivables',
    description: 'Invoice customers, issue receipts and credit notes, track what is owed.',
    icon: FileText,
    matchPrefixes: ['/account_receivables', '/customers'],
    items: [
      { title: 'Dashboard', href: '/account_receivables', icon: ChartPieSlice, appIcon: APP_ICONS.analytics, exact: true },
      { title: 'Invoices', href: '/account_receivables/invoice', icon: FileText },
      { title: 'Recurring', href: '/account_receivables/recurring', icon: Repeat, appIcon: APP_ICONS.clock },
      { title: 'Sales receipts', href: '/account_receivables/sales_receipts', icon: Receipt },
      { title: 'Credit notes', href: '/account_receivables/credit', icon: Tray, appIcon: APP_ICONS.reimbursement },
      { title: 'Vouchers', href: '/account_receivables/vouchers', icon: Gift },
      { title: 'Customers', href: '/account_receivables/customers', icon: Users, appIcon: APP_ICONS.people },
    ],
  },
  {
    id: 'ap',
    title: 'Account Payables',
    description: 'Record vendor bills and purchase orders, approve and pay them.',
    icon: Invoice,
    matchPrefixes: ['/account_payables', '/vendors'],
    items: [
      { title: 'Bills', href: '/account_payables/bills', icon: Invoice, appIcon: APP_ICONS.bills },
      { title: 'Purchase orders', href: '/account_payables/purchase', icon: ShoppingCart, appIcon: APP_ICONS.shoppingCart },
      { title: 'Vendors', href: '/account_payables/vendors', icon: Storefront },
    ],
  },
  {
    id: 'treasury',
    title: 'Treasury',
    description: 'Bank accounts and their balances.',
    icon: Bank,
    matchPrefixes: ['/treasury'],
    items: [{ title: 'Bank accounts', href: '/treasury/bank-accounts', icon: Bank, appIcon: APP_ICONS.piggyBank }],
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
