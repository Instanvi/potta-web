import type { Icon } from '@phosphor-icons/react';
import { APP_ICONS } from '@/components/app-icon';
import {
  ArrowUUpLeft,
  ArrowsClockwise,
  Bank,
  BookOpen,
  Books,
  Buildings,
  ChartLineUp,
  ChartPieSlice,
  CheckCircle,
  ClockCounterClockwise,
  Coins,
  FileText,
  Funnel,
  Gift,
  GearSix,
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
  Users,
  UserCircle,
  SlidersHorizontal,
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
 * Potta rail — each blue Accounting-services topic is its own main menu module.
 * Order: Core Ledger → AR → AP → Trade → Tax → Reports → POS → Settings.
 */
export const NAV_MODULES: NavModule[] = [
  {
    id: 'core-ledger',
    title: 'Core Ledger',
    description: 'Chart of accounts, journals, bank lines and period close.',
    icon: Books,
    matchPrefixes: ['/accounting', '/treasury'],
    items: [
      { title: 'Chart of accounts', href: '/accounting', icon: Books, appIcon: APP_ICONS.budget, exact: true },
      { title: 'Journal entry', href: '/accounting/journals', icon: Notebook },
      { title: 'General ledger', href: '/accounting/ledger', icon: BookOpen },
      { title: 'Cashbook', href: '/accounting/cashbook', icon: Coins, appIcon: APP_ICONS.money },
      { title: 'Bank accounts', href: '/treasury/bank-accounts', icon: Bank, appIcon: APP_ICONS.piggyBank },
      { title: 'Bank transactions', href: '/accounting/bank-transactions', icon: ListBullets },
      { title: 'Integration transactions', href: '/accounting/integration-transactions', icon: Plugs },
      { title: 'Reconcile', href: '/accounting/reconcile', icon: CheckCircle },
      { title: 'Rules', href: '/accounting/rules', icon: Funnel },
      { title: 'Recurring transactions', href: '/accounting/recurring', icon: Repeat },
      { title: 'Opening balances', href: '/accounting/opening-balances', icon: Scales },
      { title: 'Period close', href: '/accounting/period-close', icon: Lock },
      { title: 'Projects', href: '/accounting/projects', icon: Buildings },
      { title: 'Employees', href: '/accounting/employees', icon: Users },
      { title: 'My accountant', href: '/accounting/my-accountant', icon: UserCircle },
    ],
  },
  {
    id: 'ar',
    title: 'Accounts Receivable',
    description: 'Invoices, receipts, credit notes and what customers owe.',
    icon: FileText,
    matchPrefixes: ['/account_receivables', '/customers'],
    items: [
      { title: 'Overview', href: '/account_receivables', icon: ChartPieSlice, appIcon: APP_ICONS.analytics, exact: true },
      { title: 'Sales transactions', href: '/account_receivables/transactions', icon: ListBullets },
      { title: 'Invoices', href: '/account_receivables/invoice', icon: FileText },
      { title: 'Recurring', href: '/account_receivables/recurring', icon: Repeat, appIcon: APP_ICONS.clock },
      { title: 'Sales receipts', href: '/account_receivables/sales_receipts', icon: Receipt },
      { title: 'Payments received', href: '/account_receivables/payments', icon: Wallet },
      { title: 'Credit notes / Refunds', href: '/account_receivables/credit', icon: Tray, appIcon: APP_ICONS.reimbursement },
      { title: 'Estimates', href: '/account_receivables/estimates', icon: FileText },
      { title: 'Sales orders', href: '/account_receivables/sales-orders', icon: ShoppingCart },
      { title: 'Vouchers', href: '/account_receivables/vouchers', icon: Gift },
      { title: 'Customers and leads', href: '/account_receivables/contacts', icon: Users, appIcon: APP_ICONS.people },
      { title: 'General ledger', href: '/accounting/ledger', icon: BookOpen },
    ],
  },
  {
    id: 'ap',
    title: 'Accounts Payable',
    description: 'Bills, expenses, purchase orders and supplier balances.',
    icon: Invoice,
    matchPrefixes: ['/account_payables', '/vendors'],
    items: [
      { title: 'Overview', href: '/account_payables', icon: ChartPieSlice, appIcon: APP_ICONS.analytics, exact: true },
      { title: 'Expense transactions', href: '/account_payables/transactions', icon: ListBullets },
      { title: 'Bills', href: '/account_payables/bills', icon: Invoice, appIcon: APP_ICONS.bills },
      { title: 'Bill payments', href: '/account_payables/payments', icon: Wallet },
      { title: 'Supplier credits', href: '/account_payables/credits', icon: Tray },
      { title: 'Purchase orders', href: '/account_payables/purchase', icon: ShoppingCart, appIcon: APP_ICONS.shoppingCart },
      { title: 'Expenses', href: '/account_payables/expenses', icon: Receipt },
      { title: 'Suppliers', href: '/account_payables/contacts', icon: Users, appIcon: APP_ICONS.people },
      { title: 'General ledger', href: '/accounting/ledger', icon: BookOpen },
    ],
  },
  {
    id: 'trade',
    title: 'Trade',
    description: 'Products, inventory, purchase orders and item receipts.',
    icon: Package,
    matchPrefixes: ['/inventory', '/pos/inventory'],
    items: [
      { title: 'Overview', href: '/inventory/overview', icon: ChartPieSlice, appIcon: APP_ICONS.analytics },
      { title: 'Products and services', href: '/inventory', icon: Package, exact: true },
      { title: 'Categories', href: '/inventory/categories', icon: Tag },
      { title: 'Attributes', href: '/inventory/attributes', icon: SquaresFour },
      { title: 'Units', href: '/inventory/units', icon: Package },
      { title: 'Modifiers', href: '/inventory/modifiers', icon: Percent },
      { title: 'Inventory', href: '/inventory/adjustments', icon: SlidersHorizontal },
      { title: 'Purchase orders', href: '/account_payables/purchase', icon: ShoppingCart, appIcon: APP_ICONS.shoppingCart },
      { title: 'Item receipts', href: '/inventory/receipts', icon: Tray },
      { title: 'Returns', href: '/inventory/returns', icon: ArrowUUpLeft },
    ],
  },
  {
    id: 'tax',
    title: 'Tax',
    description: 'Tax rates, filings and settlements.',
    icon: Percent,
    matchPrefixes: ['/accounting/taxes', '/tax'],
    items: [
      { title: 'Tax rates and codes', href: '/accounting/taxes', icon: Percent, appIcon: APP_ICONS.taxes, exact: true },
      { title: 'Filings: prepare', href: '/tax/filings/prepare', icon: FileText },
      { title: 'Filings: submit and pay', href: '/tax/filings/submit', icon: CheckCircle },
    ],
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
      { title: 'Balance Sheet', href: '/reports/balance-sheet', icon: Scales },
      { title: 'Profit and Loss', href: '/reports/profit-and-loss', icon: ChartLineUp },
      { title: 'AR ageing', href: '/reports/ar-ageing', icon: FileText },
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
