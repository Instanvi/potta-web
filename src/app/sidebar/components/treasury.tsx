import { useContext } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { usePathname } from 'next/navigation';
import {
  Bank,
  CurrencyDollar,
  SquaresFour,
  TrendUp,
  Wallet,
} from '@phosphor-icons/react';
import { ContextData } from '@potta/components/providers/DataProvider';
import SidebarProfile from './SidebarProfile';
import { SB_ICON, sbClass, sbWeight } from './sidebarPhosphor';

const SidebarsTreasury = () => {
  const pathname = usePathname();
  const str = pathname.split('/');
  const context = useContext(ContextData);
  const isActive = (path: string) => pathname.startsWith(path);

  const dashOn = str[1] == 'treasury' && (str[2] == undefined || str[2] === '');
  const bankOn = isActive('/treasury/bank-accounts');
  const cashOn = isActive('/treasury/cashflow');
  const apOn = isActive('/treasury/account_payables');
  const arOn = str[1] == 'treasury' && str[2] == 'account_receivables';

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
          active={dashOn}
          className="mt-8"
          href="/treasury"
          icon={
            <SquaresFour
              size={SB_ICON}
              weight={sbWeight(dashOn)}
              className={sbClass(dashOn)}
            />
          }
        >
          <h3 className="text-md">Treasury</h3>
        </MenuItem>

        <MenuItem
          active={bankOn}
          className=""
          href="/treasury/bank-accounts"
          icon={
            <Bank
              size={SB_ICON}
              weight={sbWeight(bankOn)}
              className={sbClass(bankOn)}
            />
          }
        >
          <h3 className="text-md">Bank Accounts</h3>
        </MenuItem>

        <MenuItem
          active={cashOn}
          className=""
          href="/treasury/cashflow"
          icon={
            <TrendUp
              size={SB_ICON}
              weight={sbWeight(cashOn)}
              className={sbClass(cashOn)}
            />
          }
        >
          <h3 className="text-md">Cash Flow</h3>
        </MenuItem>

        <MenuItem
          active={apOn}
          className=""
          href="/treasury/account_payables"
          icon={
            <Wallet
              size={SB_ICON}
              weight={sbWeight(apOn)}
              className={sbClass(apOn)}
            />
          }
        >
          <h3 className="text-md">AP</h3>
        </MenuItem>

        <MenuItem
          active={arOn}
          className=""
          href="/treasury/account_receivables"
          icon={
            <CurrencyDollar
              size={SB_ICON}
              weight={sbWeight(arOn)}
              className={sbClass(arOn)}
            />
          }
        >
          <h3 className="text-md">AR</h3>
        </MenuItem>
      </Menu>
      <SidebarProfile context={context} />
    </Sidebar>
  );
};

export default SidebarsTreasury;
