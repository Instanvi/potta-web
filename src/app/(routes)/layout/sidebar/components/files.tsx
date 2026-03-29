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
const SidebarsFiles = () => {
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

        {/* Files */}
        <MenuItem
          active={isActive('/files')}
          className="mt-8"
          href="/files"
          icon={
            <FileText
              className={`h-6 w-6 ${
                isActive('/files') ? 'text-white' : 'text-gray-500'
              }`}
            />
          }
        >
          <h3 className="text-lg mt-1.5">Files</h3>
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
export default SidebarsFiles;
