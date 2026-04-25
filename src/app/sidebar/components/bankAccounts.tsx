import { useContext } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { usePathname } from 'next/navigation';
import { Bank, ChartPie, CreditCard } from '@phosphor-icons/react';
import { ContextData } from '@potta/components/providers/DataProvider';
import SidebarProfile from './SidebarProfile';
import { SB_ICON, sbClass, sbWeight } from './sidebarPhosphor';

const SidebarsBankAccounts = () => {
  const pathname = usePathname();
  const str = pathname.split('/');
  const context = useContext(ContextData);
  const isActive = (path: string) => pathname.startsWith(path);

  const listOn = str[1] == 'bank-accounts' && (str[2] == undefined || str[2] === '');
  const txOn = isActive('/bank-accounts/transactions');
  const repOn = isActive('/reports');

  return (
    <Sidebar
      backgroundColor="#F9F9F9"
      collapsedWidth="65px"
      width="200px"
      transitionDuration={500}
      collapsed={context?.toggle}
      toggled={true}
      breakPoint="md"
      className="relative z-30 h-[100vh] !border-none side"
    >
      <Menu className="relative h-[76vh]" closeOnClick>
        <MenuItem
          className="mt-4 font-normal"
          href="/"
          icon={
            <img src="/icons/Potta.svg" className="mt-2 h-16 w-16" alt="logo" />
          }
        >
          {' '}
        </MenuItem>
        <MenuItem
          active={listOn}
          className="mt-8"
          href="/bank-accounts"
          icon={
            <Bank
              size={SB_ICON}
              weight={sbWeight(listOn)}
              className={sbClass(listOn)}
            />
          }
        >
          <h3 className="text-md">Bank Accounts</h3>
        </MenuItem>
        <MenuItem
          active={txOn}
          className=""
          href="/bank-accounts/transactions"
          icon={
            <CreditCard
              size={SB_ICON}
              weight={sbWeight(txOn)}
              className={sbClass(txOn)}
            />
          }
        >
          <h3 className="text-md">Transactions</h3>
        </MenuItem>
        <MenuItem
          active={repOn}
          className=""
          href="/reports"
          icon={
            <ChartPie
              size={SB_ICON}
              weight={sbWeight(repOn)}
              className={sbClass(repOn)}
            />
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
