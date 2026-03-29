import { useContext, useState } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { usePathname } from 'next/navigation';
import Icon from '@potta/components/icon_fonts/icon';
import { ContextData } from '@potta/components/providers/DataProvider';
import SidebarProfile from './SidebarProfile';
import {
  BadgePercent,
  ChartPie,
  Coins,
  Gift,
  Tickets,
  Users,
} from 'lucide-react';
const SidebarsVoucher = () => {
  const pathname = usePathname();
  const string = pathname;
  const str = string.split('/');
  const context = useContext(ContextData);
  const isActive = (path: any) => {
    return pathname.startsWith(path);
  };
  return (
    <Sidebar
      collapsedWidth="65px"
      width="180px"
      transitionDuration={500}
      collapsed={context?.toggle}
      toggled={true}
      breakPoint="md"
      className=" relative h-[100vh] z-30  side "
    >
      <Menu className="relative h-[76vh]" closeOnClick>
        <MenuItem
          className=" font-thin "
          href="/"
          icon={
            <img src="/icons/Potta.svg" className="h-16 w-16 mt-2" alt="logo" />
          }
        >
          {' '}
        </MenuItem>
        <MenuItem
          active={str[1] == 'vouchers' ? true : false}
          className="mt-8  font-thin"
          href="/vouchers"
          icon={
            <BadgePercent
              className={`h-6 w-6 ${
                str[1] == 'vouchers' ? 'text-white' : 'text-black'
              }`}
            />
          }
        >
          {' '}
          <h3 className="text-lg mt-[2px]">Vouchers</h3>{' '}
        </MenuItem>
        <MenuItem
          active={str[1] == 'inbox' ? true : false}
          className=" font-thin"
          href="/vouchers/tickets"
          icon={
            <Tickets
              className={`h-6 w-6 ${
                isActive('/vouchers/tickets') ? 'text-white' : 'text-black'
              }`}
            />
          }
        >
          <h3 className="text-lg">Tickets</h3>
        </MenuItem>

        <MenuItem
          active={isActive('/pos/customers')}
          className=""
          href="/vouchers/customers"
          icon={
            <Users
              className={`h-6 w-6 ${
                isActive('/vouchers/customers') ? 'text-white' : 'text-black'
              }`}
            />
          }
        >
          <h3 className="text-lg ">Customers</h3>
        </MenuItem>
        <MenuItem
          active={isActive('/vouchers/reports')}
          className=""
          href="/vouchers/reports"
          icon={
            <ChartPie
              className={`h-6 w-6 ${
                isActive('/vouchers/reports') ? 'text-white' : 'text-black'
              }`}
            />
          }
        >
          <h3 className="text-lg ">Reports</h3>
        </MenuItem>
      </Menu>
      <SidebarProfile context={context} />
    </Sidebar>
  );
};
export default SidebarsVoucher;
