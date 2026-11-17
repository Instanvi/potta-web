import type { Icon } from '@phosphor-icons/react';
import { APP_ICONS } from '@/components/app-icon';
import {
  ArrowUUpLeft,
  ArrowsClockwise,
  Bank,
  BookOpen,
  Books,
  ChartLineUp,
  ChartPieSlice,
  ClockCounterClockwise,
  Coins,
  FileText,
  Gift,
  GearSix,
  House,
  Invoice,
  Notebook,
  Package,
  Percent,
  Plugs,
  Receipt,
  Repeat,
  ShoppingCart,
  Storefront,
  SquaresFour,
  Tray,
  Tag,
  Users,
  SlidersHorizontal,
} from '@phosphor-icons/react';

export interface NavItem {
  title: string;
  href: string;
  icon: Icon;
  /** Payroll-expense SVG (APP_ICONS) shown in the sidebar; falls back to `icon`. */
  appIcon?: string;
  /** Exact match only (module home links). */
  exact?: boolean;
}

export interface NavModule {
  id: string;
  title: string;
  /** One line under the module title in the sidebar panel. */
  description: string;
  icon: Icon;
  /** Rail position: modules first, utility modules (Settings) pinned to the bottom. */
  placement?: 'top' | 'bottom';
  /** First path segment(s) that activate this module. */
  matchPrefixes: string[];
  items: NavItem[];
}

/** Restored Potta rail (POS → Inventory → Books → AR → AP → Treasury → Reports → Settings). */
export const NAV_MODULES: NavModule[] = [
  {
    id: 'pos',
    title: 'POS',
    description: 'Ring up sales, contacts and the desktop till.',
    icon: Storefront,
    matchPrefixes: ['/pos'],
    items: [
      { title: 'Register', href: '/pos', icon: House, appIcon: APP_ICONS.shoppingCart, exact: true },
      { title: 'Sales', href: '/pos/sales', icon: ShoppingCart, appIcon: APP_ICONS.transactions },
      { title: 'Contacts', href: '/pos/contacts', icon: Users, appIcon: APP_ICONS.people },
      { title: 'Desktop sync', href: '/pos/sync', icon: ArrowsClockwise },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory',
    description: 'Products, categories, attributes, units, modifiers, stock adjustments and returns.',
    icon: Package,
    matchPrefixes: ['/inventory', '/pos/inventory'],
    items: [
      { title: 'Products', href: '/inventory', icon: Package, exact: true },
      { title: 'Categories', href: '/inventory/categories', icon: Tag },
      { title: 'Attributes', href: '/inventory/attributes', icon: SquaresFour },
      { title: 'Units', href: '/inventory/units', icon: Package },
      { title: 'Modifiers', href: '/inventory/modifiers', icon: Percent },
      { title: 'Stock adjustments', href: '/inventory/adjustments', icon: SlidersHorizontal },
      { title: 'Returns', href: '/inventory/returns', icon: ArrowUUpLeft },
    ],
  },
  {
    id: 'books',
    title: 'Books',
    description: 'Chart of accounts, journals, ledger, cashbook and taxes.',
    icon: Books,
    matchPrefixes: ['/accounting'],
    items: [
      { title: 'Accounts', href: '/accounting', icon: Books, appIcon: APP_ICONS.budget, exact: true },
      { title: 'Journals', href: '/accounting/journals', icon: Notebook },
      { title: 'Ledger', href: '/accounting/ledger', icon: BookOpen },
      { title: 'Cashbook', href: '/accounting/cashbook', icon: Coins, appIcon: APP_ICONS.money },
      { title: 'Taxes', href: '/accounting/taxes', icon: Percent, appIcon: APP_ICONS.taxes },
      { title: 'Integration transactions', href: '/accounting/integration-transactions', icon: Plugs },
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
      { title: 'Contacts', href: '/account_receivables/contacts', icon: Users, appIcon: APP_ICONS.people },
    ],
  },
  {
    id: 'ap',
    title: 'Account Payables',
    description: 'Record vendor bills and purchase orders, approve and pay them.',
    icon: Invoice,
    matchPrefixes: ['/account_payables', '/vendors'],
    items: [
      { title: 'Dashboard', href: '/account_payables', icon: ChartPieSlice, appIcon: APP_ICONS.analytics, exact: true },
      { title: 'Bills', href: '/account_payables/bills', icon: Invoice, appIcon: APP_ICONS.bills },
      { title: 'Purchase orders', href: '/account_payables/purchase', icon: ShoppingCart, appIcon: APP_ICONS.shoppingCart },
      { title: 'Contacts', href: '/account_payables/contacts', icon: Users, appIcon: APP_ICONS.people },
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
  {
    id: 'reports',
    title: 'Reports',
    description: 'Financial and operational reports for the branch or organization.',
    icon: ChartLineUp,
    matchPrefixes: ['/reports'],
    items: [
      { title: 'All reports', href: '/reports', icon: ChartLineUp, appIcon: APP_ICONS.report, exact: true },
      { title: 'Favourites', href: '/reports?tab=favourites', icon: ChartLineUp },
      { title: 'Balance Sheet', href: '/reports/balance-sheet', icon: Books },
      { title: 'Profit and Loss', href: '/reports/profit-and-loss', icon: ChartLineUp },
      { title: 'AR ageing', href: '/reports/ar-ageing', icon: FileText },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Organization configuration and the audit log.',
    icon: GearSix,
    placement: 'bottom',
    matchPrefixes: ['/settings'],
    items: [
      { title: 'Config', href: '/settings', icon: SquaresFour, exact: true },
      { title: 'Audit log', href: '/settings/audit-logs', icon: ClockCounterClockwise },
    ],
  },
];

export function getActiveModule(pathname: string): NavModule | null {
  let best: { module: NavModule; len: number } | null = null;
  for (const m of NAV_MODULES) {
    for (const p of m.matchPrefixes) {
      if (pathname === p || pathname.startsWith(`${p}/`)) {
        if (!best || p.length > best.len) best = { module: m, len: p.length };
      }
    }
  }
  return best?.module ?? null;
}

export function isNavActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  const hrefPath = item.href.split('?')[0];
  return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
}
