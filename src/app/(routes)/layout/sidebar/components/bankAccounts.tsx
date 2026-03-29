import { useContext } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import Icon from '../../../../../components/icon_fonts/icon';
import { usePathname } from 'next/navigation';
import { CreditCard, BarChart2 } from 'lucide-react';
import { ContextData } from '@potta/components/providers/DataProvider';
import { svgIcons } from '@potta/components/svg_icons/IconsSvg';
import SidebarProfile from './SidebarProfile';

const SidebarsBankAccounts = () => {
  const pathname = usePathname();
  const str = pathname.split('/');
  const context = useContext(ContextData);
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <Sidebar
      collapsedWidth="65px"
      width="200px"
      transitionDuration={500}
      collapsed={context?.toggle}
      toggled={true}
      breakPoint="md"
      className="relative !border-none bg-blue-500 h-[100vh] z-30 side"
    >
      <Menu className="relative h-[76vh]" closeOnClick>
        <MenuItem
          className="mt-4 font-thin"
          href="/"
          icon={
            <img src="/icons/Potta.svg" className="h-16 w-16 mt-2" alt="logo" />
          }
        >
          {' '}
        </MenuItem>
        {/* Dashboard */}
        <MenuItem
          active={
            str[1] == 'bank-accounts' && (str[2] == undefined || str[2] === '')
          }
          className="mt-8"
          href="/bank-accounts"
          icon={svgIcons.courthouse(
            str[1] == 'bank-accounts' && (str[2] == undefined || str[2] === '')
              ? 'white'
              : 'black'
          )}
        >
          <h3 className="text-md">Bank Accounts</h3>
        </MenuItem>
        {/* Transactions */}
        <MenuItem
          active={isActive('/bank-accounts/transactions')}
          className=""
          href="/bank-accounts/transactions"
          icon={
            <CreditCard
              className={`h-6 w-6 ${
                isActive('/bank-accounts/transactions')
                  ? 'text-white'
                  : 'text-gray-500'
              }`}
            />
          }
        >
          <h3 className="text-md">Transactions</h3>
        </MenuItem>
        {/* Reports */}
        <MenuItem
          active={isActive('/reports')}
          className=""
          href="/reports"
          icon={
            str[2] == 'reports' ? (
              <img src="/images/sideExpensesIcons/white/2.svg" />
            ) : (
              <img src="/images/sideDashboardIcons/dahsboard.svg" />
            )
          }
        >
          <h3 className="text-md">Reports</h3>
        </MenuItem>
      </Menu>
      <SidebarProfile context={context} />
    </Sidebar>
  );
};
export default SidebarsBankAccounts;
