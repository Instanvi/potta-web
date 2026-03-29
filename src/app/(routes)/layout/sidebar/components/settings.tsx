import { useContext } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { usePathname } from 'next/navigation';
import { ContextData } from '@potta/components/providers/DataProvider';
import SidebarProfile from './SidebarProfile';
import { AiOutlineFileProtect } from 'react-icons/ai';

import { FiLayout } from 'react-icons/fi';

const settingsRoutes = [
  { value: '', label: 'Config', icon: FiLayout },
  { value: '/policies', label: 'Policies', icon: AiOutlineFileProtect },
];

const SidebarsSettings = () => {
  const pathname = usePathname();
  const str = pathname.split('/');
  const context = useContext(ContextData);

  return (
    <Sidebar
      collapsedWidth="65px"
      width="180px"
      transitionDuration={500}
      collapsed={context?.toggle}
      toggled={true}
      breakPoint="md"
      className="relative !border-none bg-blue-500 h-[100vh] z-30 side"
    >
      <Menu className="relative h-[76vh]" closeOnClick>
        <MenuItem
          className="font-thin"
          href="/"
          icon={
            <img src="/icons/Potta.svg" className="h-16 w-16 mt-2" alt="logo" />
          }
        >
          {' '}
        </MenuItem>
        {settingsRoutes.map((item, index) => {
          const IconComponent = item.icon;
          // For Config (empty value), check if we're at /settings
          // For Policies, check if we're at /settings/policies
          const isActive =
            item.value === ''
              ? str.length === 2 && str[1] === 'settings'
              : str[2] === item.value.replace('/', '');
          return (
            <MenuItem
              key={item.value}
              active={isActive}
              className={`${index === 0 ? 'mt-10' : 'mt-0'}`}
              href={`/settings${item.value}`}
              icon={
                <IconComponent size={21} color={isActive ? 'white' : '#6b7280'} />
              }
            >
              <h3 className="text-md mt-[2px]">{item.label}</h3>
            </MenuItem>
          );
        })}
      </Menu>
      <SidebarProfile context={context} />
    </Sidebar>
  );
};
export default SidebarsSettings;
