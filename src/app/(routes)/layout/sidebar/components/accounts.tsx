import { ContextData } from '../../../../../components/providers/DataProvider';
import { useContext } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import Icon from '../../../../../components/icon_fonts/icon';
import { usePathname } from 'next/navigation';
import { PiBuildingApartmentLight } from 'react-icons/pi';
import { Home, ScrollText, Menu as MenuIcon, Briefcase } from 'lucide-react';
import { MdManageAccounts } from 'react-icons/md';
import SidebarProfile from './SidebarProfile';

const SidebarsAccounts = () => {
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
      className=" relative bg-blue-500 !border-none  h-[100vh] z-30  side "
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
        {/* Dashboard */}
        <MenuItem
          active={isActive('/accounting') && pathParts.length === 2}
          className="mt-8"
          href="/accounting"
          icon={
            <MdManageAccounts
              className={`h-6 w-6 ${
                isActive('/accounting') && pathParts.length === 2
                  ? 'text-white'
                  : 'text-gray-500'
              }`}
            />
          }
        >
          <h3 className="text-lg mt-[2px]">Accounts</h3>
        </MenuItem>

        {/* Journal */}
        <MenuItem
          active={isActive('/accounting/journals')}
          className=""
          href="/accounting/journals"
          icon={
            <ScrollText
              className={`h-6 w-6 ${
                isActive('/accounting/journals')
                  ? 'text-white'
                  : 'text-gray-500'
              }`}
            />
          }
        >
          <h3 className="text-lg mt-[2px]">Journals</h3>
        </MenuItem>
        {/* Assets */}
        <MenuItem
          active={isActive('/accounting/assets')}
          className=""
          href="/accounting/assets"
          icon={
            <PiBuildingApartmentLight
              className={`h-6 w-6 ${
                isActive('/accounting/assets') ? 'text-white' : 'text-gray-500'
              }`}
            />
          }
        >
          <h3 className="text-lg mt-[2px]">Assets</h3>
        </MenuItem>
      </Menu>
      <SidebarProfile context={context} />
    </Sidebar>
  );
};
export default SidebarsAccounts;
