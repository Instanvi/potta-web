import { ContextData } from '../../../../../components/providers/DataProvider';
import { useContext } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import Icon from '../../../../../components/icon_fonts/icon';
import { usePathname } from 'next/navigation';
import SidebarProfile from './SidebarProfile';
import {
  Home,
  FileText,
  Package,
  ShoppingCart,
  Users,
  Inbox,
  Menu as MenuIcon,
  User,
  BookUser,
} from 'lucide-react';
const SidebarsExpenses = () => {
  const pathname = usePathname();
  const string = pathname;
  const pathParts = pathname.split('/');
  const context = useContext(ContextData);
  const isActive = (path: any) => {
    return pathname.startsWith(path);
  };

  return (
    <Sidebar
      collapsedWidth="65px"
      width="200px"
      transitionDuration={500}
      collapsed={context?.toggle}
      toggled={true}
      breakPoint="md"
      className=" relative !border-none bg-blue-500  h-[100vh] z-30  side "
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
        {/* Dashboard */}
        <MenuItem
          active={isActive('/pos') && pathParts.length === 2}
          className="mt-8"
          href="/pos"
          icon={
            <Home
              className={`h-6 w-6 ${
                isActive('/pos') && pathParts.length === 2
                  ? 'text-white'
                  : 'text-gray-500'
              }`}
            />
          }
        >
          <h3 className="text-lg mt-[2px]">Dashboard</h3>
        </MenuItem>

        {/* Files */}
        {/* <MenuItem
          active={isActive('/pos/files')}
          className=""
          href="/pos/files"
          icon={
            <FileText
              className={`h-6 w-6 ${
                isActive('/pos/files') ? 'text-white' : 'text-gray-500'
              }`}
            />
          }
        >
          <h3 className="text-lg mt-1.5">Files</h3>
        </MenuItem> */}

        {/* Inventory */}
        <MenuItem
          active={isActive('/pos/inventory')}
          className=""
          href="/pos/inventory"
          icon={
            <Package
              className={`h-6 w-6 ${
                isActive('/pos/inventory') ? 'text-white' : 'text-gray-500'
              }`}
            />
          }
        >
          <h3 className="text-lg mt-1.5">Inventory</h3>
        </MenuItem>

        {/* Sales */}
        <MenuItem
          active={isActive('/pos/sales')}
          className=""
          href="/pos/sales"
          icon={
            <ShoppingCart
              className={`h-6 w-6 ${
                isActive('/pos/sales') ? 'text-white' : 'text-gray-500'
              }`}
            />
          }
        >
          <h3 className="text-lg mt-1.5">Sales</h3>
        </MenuItem>

        {/* Customers */}
        <MenuItem
          active={isActive('/pos/customers')}
          className=""
          href="/pos/customers"
          icon={
            <Users
              className={`h-6 w-6 ${
                isActive('/pos/customers') ? 'text-white' : 'text-gray-500'
              }`}
            />
          }
        >
          <h3 className="text-lg mt-1.5">Customers</h3>
        </MenuItem>
        <MenuItem
          active={isActive('/pos/vendor')}
          className=""
          href="/pos/vendors"
          icon={
            <BookUser
              className={`h-6 w-6 ${
                isActive('/pos/vendors') ? 'text-white' : 'text-gray-500'
              }`}
            />
          }
        >
          <h3 className="text-lg mt-1.5">Vendors</h3>
        </MenuItem>

        {/* Inbox */}
        {/* <MenuItem
          active={isActive('/pos/inbox')}
          className=""
          href="/pos/inbox"
          icon={
            <Inbox
              className={`h-6 w-6 ${
                isActive('/pos/inbox') ? 'text-white' : 'text-gray-500'
              }`}
            />
          }
        >
          <h3 className="text-lg mt-1.5">Inbox</h3>
        </MenuItem> */}
      </Menu>
      <SidebarProfile context={context} />
    </Sidebar>
  );
};
export default SidebarsExpenses;
