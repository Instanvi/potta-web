import { useContext, useState } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { usePathname } from 'next/navigation';
import SidebarsPayment from './components/payments';
import SidebarsExpenses from './components/expenses';
import Sidebarsinvoicing from './components/invoicing';
import SidebarsPOS from './components/POS';
import SidebarsTaxation from './components/taxation';
import SidebarsPayroll from './components/payroll';
import { ContextData } from '@potta/components/providers/DataProvider';
import SidebarsAccounts from './components/accounts';
import SidebarsHome from './components/home';
import SidebarsVoucher from './components/voucher';
import SidebarsBankAccounts from './components/bankAccounts';
import SidebarsSettings from './components/settings';
import SidebarsReports from './components/reports';
import SidebarsTreasury from './components/treasury';
import SidebarsFiles from './components/files';
const Sidebars = () => {
  const pathname = usePathname();
  const string = pathname;
  const str = string.split('/');
  const context = useContext(ContextData);
  console.log(str[1]);
  return (
    <>
      {str[1] == '' && <SidebarsHome />}
      {str[1] == undefined && <SidebarsPayment />}
      {str[1] == 'payments' && <SidebarsPayment />}
      {str[1] == 'account_payables' && <SidebarsExpenses />}
      {str[1] == 'account_receivables' && <Sidebarsinvoicing />}
      {str[1] == 'POS' || (str[1] == 'pos' && <SidebarsPOS />)}
      {str[1] == 'taxation' && <SidebarsTaxation />}
      {str[1] == 'files' && <SidebarsFiles />}
      {str[1] == 'vouchers' && <SidebarsVoucher />}
      {str[1] == 'vendors' && <SidebarsVoucher />}
      {str[1] == 'payroll' && <SidebarsPayroll />}
      {str[1] == 'accounting' && <SidebarsAccounts />}
      {str[1] == 'reports' && <SidebarsReports />}
      {str[1] == 'bank-accounts' && <SidebarsBankAccounts />}
      {str[1] == 'treasury' && <SidebarsTreasury />}
      {str[1] == 'settings' && <SidebarsSettings />}
    </>
  );
};
export default Sidebars;
