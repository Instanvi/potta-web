import { ContextData } from '@potta/components/providers/DataProvider';
import { useContext } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { usePathname } from 'next/navigation';
import {
  House,
  Package,
  ShoppingCart,
  Storefront,
  Users,
} from '@phosphor-icons/react';
import SidebarProfile from './SidebarProfile';
import { SB_ICON, sbClass, sbWeight } from './sidebarPhosphor';

const SidebarsPOS = () => {
  const pathname = usePathname();
  const pathParts = pathname.split('/');
  const context = useContext(ContextData);
  const isActive = (path: string) => pathname.startsWith(path);

  const dashOn = isActive('/pos') && pathParts.length === 2;
  const invOn = isActive('/pos/inventory');
  const salesOn = isActive('/pos/sales');
  const custOn = isActive('/pos/customers');
  const vendOn = isActive('/pos/vendors');

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
            <img src="/icons/Potta.svg" className="mt-2 h-18 w-18" alt="logo" />
          }
        >
          {' '}
        </MenuItem>
        <MenuItem
          active={dashOn}
          className="mt-8"
          href="/pos"
          icon={
            <House
              size={SB_ICON}
              weight={sbWeight(dashOn)}
              className={sbClass(dashOn)}
            />
          }
        >
          <span className="text-[0.9375rem] font-medium leading-snug">
            Dashboard
          </span>
        </MenuItem>

        <MenuItem
          active={invOn}
          className=""
          href="/pos/inventory"
          icon={
            <Package
              size={SB_ICON}
              weight={sbWeight(invOn)}
              className={sbClass(invOn)}
            />
          }
        >
          <span className="text-[0.9375rem] font-medium leading-snug">
            Inventory
          </span>
        </MenuItem>

        <MenuItem
          active={salesOn}
          className=""
          href="/pos/sales"
          icon={
            <ShoppingCart
              size={SB_ICON}
              weight={sbWeight(salesOn)}
              className={sbClass(salesOn)}
            />
          }
        >
          <span className="text-[0.9375rem] font-medium leading-snug">
            Sales
          </span>
        </MenuItem>

        <MenuItem
          active={custOn}
          className=""
          href="/pos/customers"
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
          active={vendOn}
          className=""
          href="/pos/vendors"
          icon={
            <Storefront
              size={SB_ICON}
              weight={sbWeight(vendOn)}
              className={sbClass(vendOn)}
            />
          }
        >
          <span className="text-[0.9375rem] font-medium leading-snug">
            Vendors
          </span>
        </MenuItem>
      </Menu>
      <SidebarProfile context={context} />
    </Sidebar>
  );
};
export default SidebarsPOS;
