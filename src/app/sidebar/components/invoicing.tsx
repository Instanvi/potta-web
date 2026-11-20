import { useContext } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { usePathname } from 'next/navigation';
import { ContextData } from '@potta/components/providers/DataProvider';
import SidebarProfile from './SidebarProfile';
import {
  ChartPie,
  FileText,
  Invoice,
  SquaresFour,
  Ticket,
  Users,
} from '@phosphor-icons/react';
import { SB_ICON, sbClass, sbWeight } from './sidebarPhosphor';

const Sidebarsinvoicing = () => {
  const pathname = usePathname();
  const str = pathname.split('/');
  const context = useContext(ContextData);
  const isActive = (path: string) => pathname.startsWith(path);

  const dashOn = str[1] == 'account_receivables' && str[2] == undefined;
  const invOn = isActive('/account_receivables/invoice');
  const custOn = isActive('/account_receivables/customers');
  const vouchOn = isActive('/account_receivables/vouchers');
  const salesOn = isActive('/account_receivables/sales_receipts');
  const repOn = isActive('/reports');

  return (
    <Sidebar
      backgroundColor="#F9F9F9"
      collapsedWidth="65px"
      width="180px"
      transitionDuration={500}
      collapsed={context?.toggle}
      toggled={true}
      breakPoint="md"
      className="relative z-[100] h-[100vh] !border-none !bg-[#F9F9F9] side"
    >
      <Menu className="relative h-[76vh]" closeOnClick>
        <MenuItem
          className="mt-4"
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
          href="/account_receivables"
          icon={
            <SquaresFour
              size={SB_ICON}
              weight={sbWeight(dashOn)}
              className={sbClass(dashOn)}
            />
          }
        >
          <h3 className="text-md mt-[2px]">Dashboard</h3>
        </MenuItem>
        <MenuItem
          active={invOn}
          className="text-md"
          href="/account_receivables/invoice"
          icon={
            <Invoice
              size={SB_ICON}
              weight={sbWeight(invOn)}
              className={sbClass(invOn)}
            />
          }
        >
          <h3 className="text-lg mt-[2px]">Invoice</h3>
        </MenuItem>

        <MenuItem
          active={custOn}
          className="text-md"
          href="/account_receivables/customers"
          icon={
            <Users
              size={SB_ICON}
              weight={sbWeight(custOn)}
              className={sbClass(custOn)}
            />
          }
        >
          <h3 className="text-lg mt-1.5">Customers</h3>
        </MenuItem>
        <MenuItem
          active={vouchOn}
          className="text-md"
          href="/account_receivables/vouchers"
          icon={
            <Ticket
              size={SB_ICON}
              weight={sbWeight(vouchOn)}
              className={sbClass(vouchOn)}
            />
          }
        >
          <h3 className="text-lg mt-1.5">Vouchers</h3>
        </MenuItem>

        <MenuItem
          active={salesOn}
          className="text-md"
          href="/account_receivables/sales_receipts"
          icon={
            <FileText
              size={SB_ICON}
              weight={sbWeight(salesOn)}
              className={sbClass(salesOn)}
            />
          }
        >
          <h3 className="text-lg mt-1.5">Sales Receipts</h3>
        </MenuItem>

        <MenuItem
          active={repOn}
          className="text-md"
          href="/reports"
          icon={
            <ChartPie
              size={SB_ICON}
              weight={sbWeight(repOn)}
              className={sbClass(repOn)}
            />
          }
        >
          <h3 className="text-lg mt-1.5">Reports</h3>
        </MenuItem>
      </Menu>
      <SidebarProfile context={context} />
    </Sidebar>
  );
};
export default Sidebarsinvoicing;
