import { useContext, useState } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { usePathname } from 'next/navigation';
import Icon from '@potta/components/icon_fonts/icon';
import { IoMdCard } from 'react-icons/io';
import { ContextData } from '@potta/components/providers/DataProvider';
import { svgIcons } from '@potta/components/svg_icons/IconsSvg';
import SidebarProfile from './SidebarProfile';
const SidebarsPayment = () => {
  const pathname = usePathname();
  const string = pathname;
  const str = string.split('/');
  const context = useContext(ContextData);
  console.log(str[1]);

  return (
    <Sidebar
      collapsedWidth="65px"
      width="180px"
      transitionDuration={500}
      collapsed={context?.toggle}
      toggled={true}
      breakPoint="md"
      className=" relative bg-blue-500  h-[100vh] z-30  side "
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
          active={str[1] == 'payments' && str[2] == undefined ? true : false}
          className="mt-8  font-thin"
          href="/payments"
          icon={svgIcons.dashboard(
            str[1] === 'payments' && str[2] == undefined ? 'white' : 'black'
          )}
        >
          {' '}
          <h3 className="text-md mt-[2px]">Payments</h3>{' '}
        </MenuItem>
        <MenuItem
          active={str[2] == 'transactions' ? true : false}
          className=" font-thin"
          href="/payments/transactions"
          icon={
            <IoMdCard
              size={21}
              color={str[2] == 'transactions' ? 'white' : 'black'}
            />
          }
        >
          <h3 className="text-md mt-1.5">Transactions</h3>
        </MenuItem>
        <MenuItem
          active={str[2] == 'terminals' ? true : false}
          className=" font-thin"
          href="/payments/terminals"
          icon={
            str[2] == 'terminals' ? (
              <img src="/images/sideExpensesIcons/white/flow.svg" />
            ) : (
              <img src="/images/sideExpensesIcons/flow.svg" />
            )
          }
        >
          <h3 className="text-md mt-1.5">Terminals</h3>
        </MenuItem>

        <MenuItem
          active={str[1] == 'inbox' ? true : false}
          className=" font-thin"
          href="/reports"
          icon={
            str[2] == 'reports' ? (
              <img src="/images/sideExpensesIcons/white/2.svg" />
            ) : (
              <img src="/images/sideDashboardIcons/dahsboard.svg" />
            )
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
