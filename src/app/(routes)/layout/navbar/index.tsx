'use client';

import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Bell, Inbox } from 'lucide-react'; // Import the icons
import PosCustomersBox from './boxes/PosCustomersBox';
import PosSalesBox from './boxes/PosSalesBox';
import { ContextData } from '../../../../components/providers/DataProvider';
import VouchersBox from '../../account_receivables/vouchers/components/boxVouchers';
import InvoiceBox from './boxes/InvoiceBox';
import VendorsBox from './boxes/PosVendorsBox';
import ProformaInvoiceBox from '../../account_payables/proforma-invoices/components/ProformaInvoiceBox';
import AppLauncher from '../../../../components/AppLauncher';
import GlobalSearch from '../../../../components/GlobalSearch';

const urlRouters = [
  {
    value: '',
    label: 'Home',
  },
  {
    value: 'account_payables',
    label: 'Payables',
  },
  {
    value: 'account_receivables',
    label: 'Receivables',
  },
  {
    value: 'payroll',
    label: 'Payroll',
  },
  {
    value: 'pos',
    label: 'POS',
  },
  // {
  //   value: 'taxation',
  //   label: 'Tax',
  // },
  // {
  //   value: 'treasury',
  //   label: 'Treasury',
  // },

  {
    value: 'accounting',
    label: 'Accounting',
  },
  {
    value: 'reports',
    label: 'FP & A',
  },
  {
    value: 'settings',
    label: 'Settings',
  },
];

// Routes where Box component should be displayed with their specific box component
const routesWithBox = [
  { main: 'payments', sub: '', component: '' },
  { main: 'account_payables', sub: '', component: '' },
  {
    main: 'account_payables',
    sub: 'proforma-invoices',
    component: ProformaInvoiceBox,
  },
  { main: 'pos', sub: 'vendors', component: VendorsBox },
  { main: 'account_receivables', sub: 'vouchers', component: VouchersBox },
  { main: 'accounting', sub: '', component: '' },
  { main: 'account_receivables', sub: 'invoice', component: InvoiceBox },
  { main: 'pos', sub: 'sales', component: PosSalesBox },
  { main: 'invoice', sub: 'purchase', component: '' },
  { main: 'invoice', sub: 'recurring', component: '' },
];

// Routes with specific sub-routes where Box should NOT be displayed
const routesWithoutBox = [
  { main: 'invoice', sub: 'new' },
  { main: 'invoice', sub: 'credit/new' },
  { main: 'invoice', sub: 'purchase/new' },
  { main: 'invoice', sub: 'recurring/new' },
  { main: 'pos', sub: 'sales/new' },

  // Add other specific routes where Box should not appear
];

// Routes that should not have the blue background
const routesWithoutBlueBackground = [
  { main: 'payroll' }, // Exclude all payroll pages
  { main: 'pos' },
  { main: 'files' },
  { main: 'payments' },
  { main: 'organigrammer' },
  { main: 'account_payables' },
  { main: 'treasury' },
  { main: 'account_receivables' },
  { main: 'reports' },
  { main: 'settings' },
  { main: 'accounting' },
  { main: 'invoice', sub: 'new' },
  { main: 'account_receivables', sub: 'invoice' },
  { main: 'account_payables', sub: 'proforma-invoices' },
  { main: 'bank-accounts' },
  { main: 'pos', sub: 'files' },
  { main: 'pos', sub: 'inventory' },
  { main: 'invoice', sub: 'recurring' },
  { main: 'invoice', sub: 'purchase' },
  { main: 'expenses', sub: 'budget' },
  { main: 'invoice', sub: 'paynow' },
  // Add more routes here that don't need the blue background
];

export default function Navbar({
  showChatAI = false,
}: {
  showChatAI?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const context = useContext(ContextData);
  const isReports = pathname.startsWith('/reports');
  const string = pathname;
  const str = string.split('/');
  const isHome = pathname === '/';

  // Check if str[1] is one of the valid route values
  const isValidRoute =
    str[1] && urlRouters.some((route) => route.value === str[1]);

  const [selected, setSelected] = useState(
    isHome ? '' : isValidRoute ? str[1] : 'payments'
  );

  // Get the current route and sub-route
  const currentMainRoute = str[1] || '';
  const currentSubRoute = str.slice(2).join('/');

  // Check if the current path contains "customers"
  const pathContainsCustomers = pathname.includes('customers');
  const pathContainsVendors = pathname.includes('vendors');
  // Get the appropriate box component for the current route
  const getBoxComponent = () => {
    // If the path contains "customers", return the PosCustomersBox
    if (pathContainsCustomers) {
      return PosCustomersBox;
    }
    // If the path contains "vendors", return the PosVendorsBox
    else if (pathContainsVendors) {
      return VendorsBox;
    }

    // Otherwise, find the component based on the route
    const routeConfig = routesWithBox.find(
      (route) =>
        route.main === currentMainRoute &&
        (route.sub === currentSubRoute ||
          (route.sub === '' && currentSubRoute === ''))
    );

    return routeConfig?.component || null;
  };

  // Check if Box component should be displayed for the current route
  const shouldShowBox = () => {
    // If the path contains "customers", always show the box
    if (pathContainsCustomers) {
      return true;
    }

    // First check if the route is in the exclusion list
    const isExcluded = routesWithoutBox.some(
      (route) =>
        route.main === currentMainRoute &&
        (route.sub === currentSubRoute ||
          (route.sub === '' && currentSubRoute === ''))
    );

    if (isExcluded) {
      return false;
    }

    // Then check if the route is in the inclusion list
    return routesWithBox.some(
      (route) =>
        route.main === currentMainRoute &&
        (route.sub === currentSubRoute ||
          (route.sub === '' && currentSubRoute === ''))
    );
  };

  // Check if the current route should have the blue background
  const shouldHaveBlueBackground = () => {
    // Home page should NOT have blue background
    if (pathname === '/') return false;
    if (
      (str[1] === 'pos' || str[1] === 'account_receivables') &&
      str[2] === 'customers'
    )
      return true;

    if (
      str[1] === 'account_receivables' &&
      str[2] === 'invoice' &&
      str[3] === 'new'
    ) {
      return false;
    }

    if (
      str[1] === 'account_receivables' &&
      str[2] === 'vouchers' &&
      str[3] === 'new'
    ) {
      return false;
    }
    if (
      str[1] === 'pos' &&
      str[2] === 'vendors' 
    ) {
      return true;
    }
    if (str[1] === 'account_receivables' && str[2] === 'vouchers') {
      return true;
    }
    if (str[1] === 'pos' && str[2] === 'sales' && str[3] === 'new') {
      return false;
    }
    if (str[1] === 'pos' && str[2] === 'sales') return true;
    if (str[1] === 'account_receivables' && str[2] === 'invoice') {
      return true;
    }
    if (str[1] === 'account_payables' && str[2] === 'proforma-invoices') {
      return true;
    }

    // Check if the route is in the exclusion list for blue background
    return !routesWithoutBlueBackground.some((route) => {
      if (route.main && !route.sub) {
        // Exclude all subroutes under this main route
        return currentMainRoute === route.main;
      }

      if (route.main && route.sub) {
        // Exclude only this specific subroute or its children
        return (
          currentMainRoute === route.main &&
          (currentSubRoute === route.sub ||
            currentSubRoute.startsWith(route.sub + '/'))
        );
      }
      return false;
    });
  };

  // Get the background color class based on the current route
  const getBackgroundColorClass = () => {
    return shouldHaveBlueBackground() ? 'bg-blue-50' : 'bg-white';
  };

  const handleSelect = (value: string) => {
    if (value === '') {
      router.push('/');
      setSelected('');
    } else {
      router.push(`/${value}`);
      setSelected(value);
    }
  };

  // If the current route is 'pos', don't render the navbar
  // Home page logic is now handled by isHome

  // Only render the minimal top bar if layoutMode is 'sidebar' or if on /reports
  if (context?.layoutMode !== 'sidebar' && !isReports) {
    return null;
  }

  // Determine the title to display
  const getTitle = () => {
    if (isHome) {
      return 'Home';
    }
    if (str[1] === 'files') {
      return 'File Manager';
    }
    if (str[1] === 'bank-accounts' && str[2] && str[2].length > 20) {
      return 'Bank Account';
    }
    // Special case for /pos/new route
    if (str[1] === 'pos' && str[2] === 'sales' && str[3] === 'new') {
      return 'New Sales ';
    }
    if (
      str[1] === 'account_receivables' &&
      str[2] === 'sales_receipts' &&
      str[3] === 'new'
    ) {
      return 'New Sales Receipt';
    }
    if (str[1] === 'expenses' && str[2] === 'bills' && str[3] === 'new') {
      return 'New Bill';
    }
    if (str[1] === 'pos' && str[2] === 'sales_receipts') {
      return 'Sales Receipts';
    }
    if (str[1] === 'account_payables' && str[2] === undefined) {
      return 'AP';
    }
    if (str[1] === 'treasury' && str[2] === 'account_payables') {
      return 'AP Management • Treasury';
    }
    if (str[1] === 'treasury' && str[2] === 'account_receivables') {
      return 'AR Management • Treasury';
    }
    if (str[1] === 'pos' && str[2] === undefined) {
      return 'POS';
    }
    if (str[1] === 'account_receivables' && str[2] === undefined) {
      return 'AR';
    }
    if (str[1] === 'account_receivables' && str[2] === 'sales_receipts') {
      return 'Sales Receipts';
    }
    if (
      str[1] === 'account_receivables' &&
      str[2] === 'invoice' &&
      str[3] === 'new'
    ) {
      return 'New Invoice';
    }
    if (
      str[1] === 'account_receivables' &&
      str[2] === 'vouchers' &&
      str[3] === 'new'
    ) {
      return 'New Voucher';
    }
    
    if (str[1] === 'reports' && str[2] === undefined) {
      return 'FP & A';
    }
    if (str[1] === 'payroll' && str[2] === 'people') {
      return 'Employees';
    }
    if (str[1] === 'account_receivables' && str[2] === 'invoice') {
      return 'Invoice Overview';
    }
    if (str[1] === 'account_payables' && str[2] === 'proforma-invoices') {
      return 'Proforma Invoices';
    }
    if (
      str[1] === 'account_receivables' &&
      str[2] === 'invoice' &&
      str[3] === 'credit' &&
      str[4] === 'new'
    ) {
      return 'New Credit Note';
    }

    if (
      str[1] === 'account_payables' &&
      str[2] === 'purchase' &&
      str[3] === 'new'
    ) {
      return 'New Purchase Order';
    }
    if (
      str[1] === 'account_payables' &&
      str[2] === 'purchase' &&
      str[3] === undefined
    ) {
      return 'Purchase Order';
    }

    if (
      str[1] === 'invoice' &&
      str[2] === 'recurring' &&
      str[3] === undefined
    ) {
      return 'Recurring Invoice';
    }
    if (str[1] === 'invoice' && str[2] === 'recurring' && str[3] === 'new') {
      return 'New Recurring Invoice';
    }
    if (str[1] === 'reports' && str[2] === 'dashboard') {
      return 'Executive Dashboard';
    }
    if (str[1] === 'pos' && str[2] === 'files') {
      return 'File Manager';
    }
    if (str[1] === 'vouchers' && str[2] === 'new') {
      return 'New Voucher';
    }
    if (str[1] === 'expenses' && str[2] === 'budget') {
      return 'Budget Planning';
    }
    // Default behavior
    return str[2] == undefined ? str[1] : str[2];
  };

  // Render the appropriate box component
  const BoxComponent = getBoxComponent();

  // Get the background color class
  const bgColorClass = getBackgroundColorClass();

  return (
    <nav
      className={`w-full sticky z-20 top-0 ${
        pathname.includes('reports') ? 'border-b border-gray-300' : ''
      } ${bgColorClass}  space-y-10`}
    >
      <div className={`flex justify-between items-center ${bgColorClass}`}>
        <div className={`flex ml-16 items-center gap-20 py-4`}>
          <h1 className="font-medium text-3xl text-start capitalize">
            {getTitle()}
          </h1>
        </div>

        {/* Global Search - Centered */}
        <div className="flex-1 max-w-2xl mx-8">
          <GlobalSearch />
        </div>

        <div className="flex items-center gap-4 px-4">
          {/* Inbox Icon */}
          <button className="p-2 rounded-full transition-colors">
            <Inbox size={20} className="text-gray-600 hover:text-gray-800" />
          </button>
          {/* Notification Icon */}
          <button className="p-2 rounded-full transition-colors">
            <Bell size={20} className="text-gray-600 hover:text-gray-800" />
          </button>

          {/* App Launcher */}
          <AppLauncher />
        </div>
      </div>

      {/* Render the route-specific box component */}
      {shouldShowBox() && BoxComponent && (
        <div className={`${showChatAI ? 'ml-5' : 'ml-14'} pb-10`}>
          <BoxComponent />
        </div>
      )}
    </nav>
  );
}
