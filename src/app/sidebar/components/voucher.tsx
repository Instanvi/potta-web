import { useContext } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { usePathname } from 'next/navigation';
import { ContextData } from '@potta/components/providers/DataProvider';
import SidebarProfile from './SidebarProfile';
import { ChartPie, Percent, Ticket, Users } from '@phosphor-icons/react';
import { SB_ICON, sbClass, sbWeight } from './sidebarPhosphor';

const SidebarsVoucher = () => {
  const pathname = usePathname();
  const str = pathname.split('/');
  const context = useContext(ContextData);
  const isActive = (path: string) => pathname.startsWith(path);

  const vOn = str[1] == 'vouchers';
  const tOn = isActive('/vouchers/tickets');
  const cOn = isActive('/vouchers/customers');
  const rOn = isActive('/vouchers/reports');

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
          active={vOn}
          className="mt-8 font-normal"
          href="/vouchers"
          icon={
            <Percent
              size={SB_ICON}
              weight={sbWeight(vOn)}
              className={sbClass(vOn)}
            />
          }
        >
          <h3 className="text-lg mt-[2px]">Vouchers</h3>
        </MenuItem>
        <MenuItem
          active={tOn}
          className="font-normal"
          href="/vouchers/tickets"
          icon={
            <Ticket
              size={SB_ICON}
              weight={sbWeight(tOn)}
              className={sbClass(tOn)}
            />
          }
        >
          <h3 className="text-lg">Tickets</h3>
        </MenuItem>

        <MenuItem
          active={cOn}
          className=""
          href="/vouchers/customers"
          icon={
            <Users
              size={SB_ICON}
              weight={sbWeight(cOn)}
              className={sbClass(cOn)}
            />
          }
        >
          <h3 className="text-lg">Customers</h3>
        </MenuItem>
        <MenuItem
          active={rOn}
          className=""
          href="/vouchers/reports"
          icon={
            <ChartPie
              size={SB_ICON}
              weight={sbWeight(rOn)}
              className={sbClass(rOn)}
            />
          }
        >
          <h3 className="text-lg">Reports</h3>
        </MenuItem>
      </Menu>
      <SidebarProfile context={context} />
    </Sidebar>
  );
};
export default SidebarsVoucher;
