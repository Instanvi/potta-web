import { useContext, useState } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { usePathname } from 'next/navigation';
import { ContextData } from '@potta/components/providers/DataProvider';
import Icon from '@potta/components/icon_fonts/icon';
import SidebarProfile from './SidebarProfile';
import {
  ChartPie,
  CircleDollarSign,
  Inbox,
  RefreshCw,
  Users,
} from 'lucide-react';
import { LuTicket } from 'react-icons/lu';
import { FileText } from 'lucide-react';
import { svgIcons } from '@potta/components/svg_icons/IconsSvg';
const Sidebarsinvoicing = () => {
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
      className=" relative !bg-white !border-none  h-[100vh] z-[100]  side "
    >
      <Menu className="relative h-[76vh]" closeOnClick>
        <MenuItem
          className="mt-4 "
          href="/"
          icon={
            <img src="/icons/Potta.svg" className="h-16 w-16 mt-2" alt="logo" />
          }
        >
          {' '}
        </MenuItem>
        <MenuItem
          active={
            str[1] == 'account_receivables' && str[2] == undefined
              ? true
              : false
          }
          className="mt-8  "
          href="/account_receivables"
          icon={svgIcons.dashboard(
            str[1] == 'account_receivables' && str[2] == undefined
              ? 'white'
              : '#6b7280'
          )}
        >
          {' '}
          <h3 className="text-md mt-[2px]">Dashboard</h3>{' '}
        </MenuItem>
        <MenuItem
          active={isActive('/account_receivables/invoice')}
          className="text-md"
          href="/account_receivables/invoice"
          icon={
            <Icon
              icon="file-invoice-dollar"
              size={23}
              color={
                isActive('/account_receivables/invoice') ? 'white' : '#6b7280'
              }
            />
          }
        >
          {' '}
          <h3 className="text-lg mt-[2px]">Invoice</h3>{' '}
        </MenuItem>
        {/* <MenuItem
          active={isActive('/account_receivables/estimates')}
          className="text-md"
          href="/account_receivables/estimates"
          icon={
            <CircleDollarSign
              className={`h-6 w-6 ${
                isActive('/account_receivables/estimates') ? 'text-white' : 'text-gray-900'
              }`}
            />
          }
        >
          <h3 className="text-lg mt-1.5">Estimates</h3>
        </MenuItem> */}

        <MenuItem
          active={isActive('/account_receivables/customers')}
          className="text-md"
          href="/account_receivables/customers"
          icon={svgIcons.people(
            isActive('/account_receivables/customers') ? 'white' : '#6b7280'
          )}
        >
          <h3 className="text-lg mt-1.5">Customers</h3>
        </MenuItem>
        <MenuItem
          active={isActive('/account_receivables/vouchers')}
          className="text-md"
          href="/account_receivables/vouchers"
          icon={svgIcons.ticket(
            isActive('/account_receivables/vouchers') ? 'white' : '#6b7280'
          )}
        >
          <h3 className="text-lg mt-1.5">Vouchers</h3>
        </MenuItem>

        {/* <MenuItem
          active={isActive('/account_receivables/payments')}
          className="text-md"
          href="/account_receivables/payments"
          icon={
            <CircleDollarSign
              className={`h-6 w-6 ${
                isActive('/account_receivables/payments')
                  ? 'text-white'
                  : 'text-gray-900'
              }`}
            />
          }
        >
          <h3 className="text-lg mt-1.5">Payments</h3>
        </MenuItem> */}
        <MenuItem
          active={isActive('/account_receivables/sales_receipts')}
          className="text-md"
          href="/account_receivables/sales_receipts"
          icon={
            <FileText
              size={23}
              color={
                isActive('/account_receivables/sales_receipts')
                  ? 'white'
                  : '#6b7280'
              }
            />
          }
        >
          <h3 className="text-lg mt-1.5">Sales Receipts</h3>
        </MenuItem>

        {/* Inbox */}
        {/* <MenuItem
          active={isActive('/account_receivables/inbox')}
          className="text-md"
          href="/account_receivables/inbox"
          icon={
            <Inbox
              className={`h-6 w-6 ${
                isActive('/account_receivables/inbox') ? 'text-white' : 'text-gray-900'
              }`}
            />
          }
        >
          <h3 className="text-lg mt-1.5">Inbox</h3>
        </MenuItem> */}
        <MenuItem
          active={isActive('/reports')}
          className="text-md"
          href="/reports"
          icon={svgIcons.reports(isActive('/reports') ? 'white' : '#6b7280')}
        >
          <h3 className="text-lg mt-1.5">Reports</h3>
        </MenuItem>
      </Menu>
      <SidebarProfile context={context} />
    </Sidebar>
  );
};
export default Sidebarsinvoicing;
