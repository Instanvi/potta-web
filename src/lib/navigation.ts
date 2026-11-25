import type { Icon } from '@phosphor-icons/react';
import { APP_ICONS } from '@/components/app-icon';
import {
  ArrowUUpLeft,
  ArrowsClockwise,
  Bank,
  Bell,
  BookOpen,
  Books,
  Buildings,
  ChartLineUp,
  ChartPieSlice,
  CheckCircle,
  ClockCounterClockwise,
  Coins,
  FileText,
  Gift,
  GearSix,
  Handshake,
  House,
  Invoice,
  ListBullets,
  Lock,
  Notebook,
  Package,
  Percent,
  Plugs,
  Receipt,
  Repeat,
  Scales,
  ShoppingCart,
  Storefront,
  SquaresFour,
  Tray,
  Tag,
  Target,
  Truck,
  Users,
  SlidersHorizontal,
  SealCheck,
  Wallet,
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

/**
 * Rail order from accounting docs (blue column-1 groups) plus operational modules:
 * Dashboards → POS → AR → AP → Trade → Core Ledger → Tax → Treasury → FB&A → Settings.
 * My accountant is intentionally omitted (out of scope).
 */
export const NAV_MODULES: NavModule[] = [
  {
    id: 'dashboards',
    title: 'Dashboards',
    description: 'Built-in books metrics and custom KPI layouts you can edit.',
    icon: ChartPieSlice,
    matchPrefixes: ['/dashboards', '/home'],
    items: [
      { title: 'Home', href: '/home', icon: House, appIcon: APP_ICONS.analytics, exact: true },
      { title: 'All dashboards', href: '/dashboards', icon: ChartPieSlice },
    ],
  },
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
    id: 'ar',
    title: 'Accounts Receivable',
    description: 'Sales documents, customers, and what is owed.',
    icon: FileText,
    matchPrefixes: ['/account_receivables', '/customers'],
    items: [
      {
        title: 'Overview',
        href: '/account_receivables',
        icon: ChartPieSlice,
        appIcon: APP_ICONS.analytics,
        exact: true,
      },
      {
        title: 'Sales transactions',
        href: '/account_receivables/transactions',
        icon: ListBullets,
        appIcon: APP_ICONS.transactions,
      },
      { title: 'Invoices', href: '/account_receivables/invoice', icon: FileText },
      { title: 'Recurring', href: '/account_receivables/recurring', icon: Repeat, appIcon: APP_ICONS.clock },
      { title: 'Sales receipts', href: '/account_receivables/sales_receipts', icon: Receipt },
      { title: 'Payments received', href: '/account_receivables/payments', icon: Wallet },
      { title: 'Credit notes', href: '/account_receivables/credit', icon: Tray, appIcon: APP_ICONS.reimbursement },
      { title: 'Vouchers', href: '/account_receivables/vouchers', icon: Gift },
      { title: 'Estimates', href: '/account_receivables/estimates', icon: FileText },
      { title: 'Sales orders', href: '/account_receivables/sales-orders', icon: ShoppingCart },
      {
        title: 'Customers and leads',
        href: '/account_receivables/contacts',
        icon: Users,
        appIcon: APP_ICONS.people,
      },
      { title: 'Opportunities', href: '/account_receivables/opportunities', icon: Target },
      { title: 'Proposals', href: '/account_receivables/proposals', icon: Notebook },
      { title: 'Contracts', href: '/account_receivables/contracts', icon: Handshake },
    ],
  },
  {
    id: 'ap',
    title: 'Accounts Payable',
    description: 'Purchase documents, suppliers, and what you owe.',
    icon: Invoice,
    matchPrefixes: ['/account_payables', '/vendors'],
    items: [
      {
        title: 'Overview',
        href: '/account_payables',
        icon: ChartPieSlice,
        appIcon: APP_ICONS.analytics,
        exact: true,
      },
      {
        title: 'Expense transactions',
        href: '/account_payables/transactions',
        icon: ListBullets,
        appIcon: APP_ICONS.transactions,
      },
      { title: 'Bills', href: '/account_payables/bills', icon: Invoice, appIcon: APP_ICONS.bills },
      { title: 'Bill payments', href: '/account_payables/payments', icon: Wallet },
      { title: 'Expenses', href: '/account_payables/expenses', icon: Receipt },
      { title: 'Supplier credits', href: '/account_payables/credits', icon: Tray },
      {
        title: 'Suppliers',
        href: '/account_payables/contacts',
        icon: Users,
        appIcon: APP_ICONS.people,
      },
    ],
  },
  {
    id: 'trade',
    title: 'Trade (Inventory)',
    description: 'Products, stock, purchase orders and receipts.',
    icon: Package,
    matchPrefixes: ['/inventory', '/pos/inventory', '/account_payables/purchase'],
    items: [
      { title: 'Products and services', href: '/inventory', icon: Package, exact: true },
      { title: 'Categories', href: '/inventory/categories', icon: Tag },
      { title: 'Attributes', href: '/inventory/attributes', icon: SquaresFour },
      { title: 'Units', href: '/inventory/units', icon: Package },
      { title: 'Modifiers', href: '/inventory/modifiers', icon: Percent },
      { title: 'Stock adjustments', href: '/inventory/adjustments', icon: SlidersHorizontal },
      { title: 'Returns', href: '/inventory/returns', icon: ArrowUUpLeft },
      {
        title: 'Purchase orders',
        href: '/account_payables/purchase',
        icon: ShoppingCart,
        appIcon: APP_ICONS.shoppingCart,
      },
      { title: 'Item receipts', href: '/inventory/receipts', icon: Tray },
      { title: 'Shipments', href: '/inventory/shipments', icon: Truck },
      { title: 'Sales orders', href: '/account_receivables/sales-orders', icon: ShoppingCart },
    ],
  },
  {
    id: 'core-ledger',
    title: 'Core Ledger',
    description: 'Chart of accounts, journals, ledger and cashbook.',
    icon: Books,
    matchPrefixes: ['/accounting'],
    items: [
      { title: 'Accounts', href: '/accounting', icon: Books, appIcon: APP_ICONS.budget, exact: true },
      { title: 'Journals', href: '/accounting/journals', icon: Notebook },
      { title: 'Ledger', href: '/accounting/ledger', icon: BookOpen },
      { title: 'Cashbook', href: '/accounting/cashbook', icon: Coins, appIcon: APP_ICONS.money },
      { title: 'Bank transactions', href: '/accounting/bank-transactions', icon: Bank },
      { title: 'Integration transactions', href: '/accounting/integration-transactions', icon: Plugs },
      { title: 'Reconcile', href: '/accounting/reconcile', icon: Scales },
      { title: 'Rules', href: '/accounting/rules', icon: CheckCircle },
      { title: 'Recurring transactions', href: '/accounting/recurring', icon: Repeat },
      { title: 'Opening balances', href: '/accounting/opening-balances', icon: Coins },
      { title: 'Period close', href: '/accounting/period-close', icon: Lock },
      { title: 'Employees', href: '/accounting/employees', icon: Users, appIcon: APP_ICONS.people },
      { title: 'Projects', href: '/accounting/projects', icon: Target },
      { title: 'Fixed assets', href: '/accounting/assets', icon: Buildings },
    ],
  },
  {
    id: 'tax',
    title: 'Tax',
    description: 'Tax rates, codes and filings.',
    icon: Percent,
    matchPrefixes: ['/accounting/taxes', '/accounting/payment-methods', '/tax'],
    items: [
      {
        title: 'Tax rates and codes',
        href: '/accounting/taxes',
        icon: Percent,
        appIcon: APP_ICONS.taxes,
        exact: true,
      },
      {
        title: 'Payment methods',
        href: '/accounting/payment-methods',
        icon: Coins,
      },
      { title: 'Filings: prepare', href: '/tax/filings/prepare', icon: FileText },
      { title: 'Filings: submit and pay', href: '/tax/filings/submit', icon: SealCheck },
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
    title: 'FB&A (Reports)',
    description: 'Financial and operational reports over posted journals.',
    icon: ChartLineUp,
    matchPrefixes: ['/reports'],
    items: [
      {
        title: 'All reports',
        href: '/reports',
        icon: ChartLineUp,
        appIcon: APP_ICONS.report,
        exact: true,
      },
      { title: 'Favourites', href: '/reports?tab=favourites', icon: ChartLineUp, exact: true },
      { title: 'Balance Sheet', href: '/reports', icon: Books },
      { title: 'Profit and Loss', href: '/reports', icon: ChartLineUp },
      { title: 'AR ageing', href: '/reports', icon: FileText },
      { title: 'AR ageing detail', href: '/reports', icon: FileText },
      { title: 'AP ageing', href: '/reports', icon: FileText },
      { title: 'AP ageing detail', href: '/reports', icon: FileText },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Organization configuration and the audit log.',
    icon: GearSix,
    placement: 'bottom',
    matchPrefixes: ['/settings', '/notifications'],
    items: [
      { title: 'Config', href: '/settings', icon: SquaresFour, exact: true },
      { title: 'Document appearance', href: '/settings/document-appearance', icon: FileText },
      { title: 'Notifications', href: '/notifications', icon: Bell },
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

/**
 * Whether `item` matches the current location. Query-bearing hrefs (e.g.
 * `/reports?tab=favourites`) only match when those params are present — they
 * must not light up for every child under the same path.
 */
export function isNavActive(
  pathname: string,
  item: NavItem,
  search: string = '',
): boolean {
  const [hrefPath, hrefQuery = ''] = item.href.split('?');
  const rawSearch = search.startsWith('?') ? search.slice(1) : search;
  const actual = new URLSearchParams(rawSearch);

  if (item.exact || hrefQuery) {
    if (pathname !== hrefPath) return false;
    if (!hrefQuery) {
      // Exact path with no query requirement — inactive when a tab query is set
      // so e.g. All reports ≠ Favourites.
      return !actual.toString();
    }
    const required = new URLSearchParams(hrefQuery);
    for (const [key, value] of required.entries()) {
      if (actual.get(key) !== value) return false;
    }
    return true;
  }

  return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
}

/** Most specific matching item in a module (longest path, then query hrefs). */
export function getActiveNavItem(
  pathname: string,
  items: NavItem[],
  search: string = '',
): NavItem | null {
  const matches = items.filter((item) => isNavActive(pathname, item, search));
  if (!matches.length) return null;
  return [...matches].sort((a, b) => {
    const aPath = a.href.split('?')[0].length;
    const bPath = b.href.split('?')[0].length;
    if (bPath !== aPath) return bPath - aPath;
    return (b.href.includes('?') ? 1 : 0) - (a.href.includes('?') ? 1 : 0);
  })[0];
}
