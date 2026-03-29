import { useContext } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { usePathname } from 'next/navigation';
import { CreditCard, BarChart2, Wallet } from 'lucide-react';
import { ContextData } from '@potta/components/providers/DataProvider';
import { svgIcons } from '@potta/components/svg_icons/IconsSvg';
import SidebarProfile from './SidebarProfile';
import { GiReceiveMoney } from 'react-icons/gi';
import { SlWallet } from 'react-icons/sl';

const SidebarsTreasury = () => {
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

        {/* Treasury Dashboard */}
        <MenuItem
          active={
            str[1] == 'treasury' && (str[2] == undefined || str[2] === '')
          }
          className="mt-8"
          href="/treasury"
          icon={svgIcons.dashboard(
            str[1] === 'treasury' && str[2] == undefined ? 'white' : '#374151'
          )}
        >
          <h3 className="text-md">Treasury</h3>
        </MenuItem>

        {/* Bank Accounts */}
        <MenuItem
          active={isActive('/treasury/bank-accounts')}
          className=""
          href="/treasury/bank-accounts"
          icon={svgIcons.courthouse(
            isActive('/treasury/bank-accounts') ? 'white' : '#374151'
          )}
        >
          <h3 className="text-md">Bank Accounts</h3>
        </MenuItem>

        {/* Cash Flow Forecast */}
        <MenuItem
          active={isActive('/treasury/cashflow')}
          className=""
          href="/treasury/cashflow"
          icon={
            <svg
              className={`h-6 w-6 ${
                isActive('/treasury/cashflow') ? 'text-white' : 'text-gray-700'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
        >
          <h3 className="text-md">Cash Flow</h3>
        </MenuItem>

        {/* Bank Account Transactions */}
        <MenuItem
          active={isActive('/treasury/account_payables')}
          className=""
          href="/treasury/account_payables"
          icon={
            <SlWallet
              className={`h-6 w-6 ${
                isActive('/treasury/account_payables')
                  ? 'text-white'
                  : 'text-gray-700'
              }`}
            />
          }
        >
          <h3 className="text-md">AP</h3>
        </MenuItem>

        {/* account_receivables */}
        <MenuItem
          active={str[1] == 'treasury' && str[2] == 'account_receivables'}
          className=""
          href="/treasury/account_receivables"
          icon={
            <GiReceiveMoney
              className={`h-6 w-6 ${
                str[1] == 'treasury' && str[2] == 'account_receivables'
                  ? 'text-white'
                  : 'text-gray-700'
              }`}
            />
          }
        >
          <h3 className="text-md">AR</h3>
        </MenuItem>

        {/* Payment Transactions */}
        {/* <MenuItem
          active={str[2] == 'transactions' && str[1] == 'treasury'}
          className=""
          href="/treasury/payments/transactions"
          icon={
            <CreditCard
              className={`h-6 w-6 ${
                str[2] == 'transactions' && str[1] == 'payments'
                  ? 'text-white'
                  : 'text-gray-700'
              }`}
            />
          }
        >
          <h3 className="text-md">Payment Transactions</h3>
        </MenuItem> */}

        {/* Payment Terminals */}
        {/* <MenuItem
          active={str[2] == 'terminals' && str[1] == 'treasury'}
          className=""
          href="/treasury/payments/terminals"
          icon={
            str[2] == 'terminals' && str[1] == 'treasury' ? (
              <img src="/images/sideExpensesIcons/white/flow.svg" />
            ) : (
              <img src="/images/sideExpensesIcons/flow.svg" />
            )
          }
        >
          <h3 className="text-md">Terminals</h3>
        </MenuItem> */}

        {/* Reports */}
        <MenuItem
          active={isActive('/reports')}
          className=""
          href="/reports"
          icon={svgIcons.reports(isActive('/reports') ? 'white' : '#6b7280')}
        >
          <h3 className="text-md">Reports</h3>
        </MenuItem>
      </Menu>
      <SidebarProfile context={context} />
    </Sidebar>
  );
};

export default SidebarsTreasury;
