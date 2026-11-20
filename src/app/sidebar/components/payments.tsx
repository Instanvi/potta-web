import { useContext } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { usePathname } from 'next/navigation';
import {
  ChartPie,
  CreditCard,
  PlugsConnected,
  SquaresFour,
} from '@phosphor-icons/react';
import { ContextData } from '@potta/components/providers/DataProvider';
import SidebarProfile from './SidebarProfile';
import { SB_ICON, sbClass, sbWeight } from './sidebarPhosphor';

const SidebarsPayment = () => {
  const pathname = usePathname();
  const str = pathname.split('/');
  const context = useContext(ContextData);

  const payDash = str[1] == 'payments' && str[2] == undefined;
  const txOn = str[2] == 'transactions';
  const termOn = str[2] == 'terminals';
  const repOn = str[2] == 'reports';

  return (
    <Sidebar
      backgroundColor="#F9F9F9"
      collapsedWidth="65px"
      width="180px"
      transitionDuration={500}
      collapsed={context?.toggle}
      toggled={true}
      breakPoint="md"
      className="relative z-30 h-[100vh] side"
    >
      <Menu className="relative h-[76vh]" closeOnClick>
        <MenuItem
          className="font-normal"
          href="/"
          icon={
            <img src="/icons/Potta.svg" className="mt-2 h-16 w-16" alt="logo" />
          }
        >
          {' '}
        </MenuItem>
        <MenuItem
          active={payDash}
          className="mt-8 font-normal"
          href="/payments"
          icon={
            <SquaresFour
              size={SB_ICON}
              weight={sbWeight(payDash)}
              className={sbClass(payDash)}
            />
          }
        >
          <h3 className="text-md mt-[2px]">Payments</h3>
        </MenuItem>
        <MenuItem
          active={txOn}
          className="font-normal"
          href="/payments/transactions"
          icon={
            <CreditCard
              size={SB_ICON}
              weight={sbWeight(txOn)}
              className={sbClass(txOn)}
            />
          }
        >
          <h3 className="text-md mt-1.5">Transactions</h3>
        </MenuItem>
        <MenuItem
          active={termOn}
          className="font-normal"
          href="/payments/terminals"
          icon={
            <PlugsConnected
              size={SB_ICON}
              weight={sbWeight(termOn)}
              className={sbClass(termOn)}
            />
          }
        >
          <h3 className="text-md mt-1.5">Terminals</h3>
        </MenuItem>

        <MenuItem
          active={str[1] == 'inbox'}
          className="font-normal"
          href="/reports"
          icon={
            <ChartPie
              size={SB_ICON}
              weight={sbWeight(repOn)}
              className={sbClass(repOn)}
            />
          }
        >
          <h3 className="text-md mt-1.5">Reports</h3>
        </MenuItem>
      </Menu>
      <SidebarProfile context={context} />
    </Sidebar>
  );
};
export default SidebarsPayment;
