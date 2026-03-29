import { useContext, useState } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { usePathname } from 'next/navigation';
import Icon from '@potta/components/icon_fonts/icon';
import { ContextData } from '@potta/components/providers/DataProvider';
import SidebarProfile from './SidebarProfile';
const SidebarsTaxation = () => {
  const pathname = usePathname();
  const string = pathname;
  const str = string.split('/');
  const context = useContext(ContextData);

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
          className="mt-4 font-thin "
          href="/"
          icon={
            <img src="/icons/Potta.svg" className="h-16 w-16 mt-2" alt="logo" />
          }
        >
          {' '}
        </MenuItem>
        <MenuItem
          active={str[1] == 'dashboard' ? true : false}
          className="mt-8  font-thin"
          href="/dashboard"
          icon={
            <Icon
              icon="Pie-Chart-2"
              size={23}
              color={
                str[1] == 'analytics' || str[1] == undefined || str[1] == ''
                  ? 'white'
                  : 'black'
              }
            />
          }
        >
          {' '}
          <h3 className="text-lg mt-[2px]">Payments</h3>{' '}
        </MenuItem>
        <MenuItem
          active={str[1] == 'inbox' ? true : false}
          className="mt-4 font-thin"
          href="/inbox"
          icon={
            <Icon
              icon="Open-Mail"
              size={21}
              color={
                str[1] == 'analytics' || str[1] == undefined || str[1] == ''
                  ? 'white'
                  : 'black'
              }
            />
          }
        >
          <h3 className="text-lg mt-1.5">Cancelled</h3>
        </MenuItem>
        <MenuItem
          active={str[1] == 'inbox' ? true : false}
          className="mt-4 font-thin"
          href="/inbox"
          icon={
            <Icon
              icon="Open-Mail"
              size={21}
              color={
                str[1] == 'analytics' || str[1] == undefined || str[1] == ''
                  ? 'white'
                  : 'black'
              }
            />
          }
        >
          <h3 className="text-lg mt-1.5">Failed</h3>
        </MenuItem>
        <MenuItem
          active={str[1] == 'inbox' ? true : false}
          className="mt-4 font-thin"
          href="/inbox"
          icon={
            <Icon
              icon="Open-Mail"
              size={21}
              color={
                str[1] == 'analytics' || str[1] == undefined || str[1] == ''
                  ? 'white'
                  : 'black'
              }
            />
          }
        >
          <h3 className="text-lg mt-1.5">Terminals</h3>
        </MenuItem>
        <MenuItem
          active={str[1] == 'inbox' ? true : false}
          className="mt-4 font-thin"
          href="/inbox"
          icon={
            <Icon
              icon="Open-Mail"
              size={21}
              color={
                str[1] == 'analytics' || str[1] == undefined || str[1] == ''
                  ? 'white'
                  : 'black'
              }
            />
          }
        >
          <h3 className="text-lg mt-1.5">Report</h3>
        </MenuItem>
      </Menu>
      <SidebarProfile context={context} />
    </Sidebar>
  );
};
export default SidebarsTaxation;
