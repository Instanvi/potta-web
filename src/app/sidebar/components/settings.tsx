import { useContext } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { usePathname } from 'next/navigation';
import { FileText, SquaresFour } from '@phosphor-icons/react';
import { ContextData } from '@potta/components/providers/DataProvider';
import SidebarProfile from './SidebarProfile';
import { SB_ICON, sbClass, sbWeight } from './sidebarPhosphor';

const settingsRoutes = [
  { value: '', label: 'Config', Icon: SquaresFour },
  { value: '/policies', label: 'Policies', Icon: FileText },
] as const;

const SidebarsSettings = () => {
  const pathname = usePathname();
  const str = pathname.split('/');
  const context = useContext(ContextData);

  return (
    <Sidebar
      backgroundColor="#F9F9F9"
      collapsedWidth="65px"
      width="180px"
      transitionDuration={500}
      collapsed={context?.toggle}
      toggled={true}
      breakPoint="md"
      className="relative z-30 h-[100vh] !border-none side"
    >
      <Menu className="relative h-[76vh]" closeOnClick>
        <MenuItem
          className="font-normal"
          href="/"
          icon={
            <img src="/icons/Potta.svg" className="mt-2 h-16 w-16" alt="logo" />
          }
        >
          {' '}
        </MenuItem>
        {settingsRoutes.map((item, index) => {
          const IconComponent = item.Icon;
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
                <IconComponent
                  size={SB_ICON}
                  weight={sbWeight(isActive)}
                  className={sbClass(isActive)}
                />
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
