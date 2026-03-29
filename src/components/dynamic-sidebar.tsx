'use client';
import React, { useContext } from 'react';
import { usePathname } from 'next/navigation';
import { ContextData } from './providers/DataProvider';
import SidebarsPayment from '../app/(routes)/layout/sidebar/components/payments';
import SidebarsExpenses from '../app/(routes)/layout/sidebar/components/expenses';
import Sidebarsinvoicing from '../app/(routes)/layout/sidebar/components/invoicing';
import SidebarsPOS from '../app/(routes)/layout/sidebar/components/POS';
import SidebarsTaxation from '../app/(routes)/layout/sidebar/components/taxation';
import SidebarsPayroll from '../app/(routes)/layout/sidebar/components/payroll';
import SidebarsAccounts from '../app/(routes)/layout/sidebar/components/accounts';
import SidebarsHome from '../app/(routes)/layout/sidebar/components/home';
import SidebarsVoucher from '../app/(routes)/layout/sidebar/components/voucher';
import SidebarsBankAccounts from '../app/(routes)/layout/sidebar/components/bankAccounts';

const DynamicSidebar = () => {
  const pathname = usePathname();
  const context = useContext(ContextData);
  const isHome = pathname === '/';

  // If we're on the home page, don't show sidebar
  if (isHome) {
    return null;
  }

  // Get the current route
  const pathSegments = pathname.split('/').filter(Boolean);
  const currentRoute = pathSegments[0] || '';

  // Determine which sidebar to show based on activeSidebar or current route
  const getSidebarComponent = () => {
    const activeSidebar = context?.activeSidebar || 'default';

    // If a specific sidebar is selected, use that
    if (activeSidebar !== 'default') {
      switch (activeSidebar) {
        case 'payments':
          return <SidebarsPayment />;
        case 'expenses':
          return <SidebarsExpenses />;
        case 'invoice':
          return <Sidebarsinvoicing />;
        case 'pos':
          return <SidebarsPOS />;
        case 'payroll':
          return <SidebarsPayroll />;
        case 'accounts':
          return <SidebarsAccounts />;
        case 'reports':
          return <SidebarsVoucher />;
        default:
          break;
      }
    }

    // Otherwise, use route-based sidebar selection
    switch (currentRoute) {
      case 'payments':
        return <SidebarsPayment />;
      case 'expenses':
        return <SidebarsExpenses />;
      case 'invoice':
        return <Sidebarsinvoicing />;
      case 'pos':
        return <SidebarsPOS />;
      case 'taxation':
        return <SidebarsTaxation />;
      case 'vouchers':
        return <SidebarsVoucher />;
      case 'vendors':
        return <SidebarsVoucher />;
      case 'payroll':
        return <SidebarsPayroll />;
      case 'accounts':
        return <SidebarsAccounts />;
      case 'reports':
        return <SidebarsVoucher />;
      case 'bank-accounts':
        return <SidebarsBankAccounts />;
      default:
        return <SidebarsHome />;
    }
  };

  const SidebarComponent = getSidebarComponent();

  return <div className="fixed z-50">{SidebarComponent}</div>;
};

export default DynamicSidebar;
