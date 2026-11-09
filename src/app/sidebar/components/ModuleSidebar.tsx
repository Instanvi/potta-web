import { useContext } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { usePathname } from 'next/navigation';
import { ContextData } from '@potta/components/providers/DataProvider';
import { isNavActive, type NavModule } from '@/lib/navigation';
import { useCanOpenRoute } from '@/lib/use-can-open-route';
import SidebarProfile from './SidebarProfile';
import { SB_ICON, sbClass, sbWeight } from './sidebarPhosphor';

/** One sidebar for every module; items the user cannot open are hidden. */
const ModuleSidebar = ({ module }: { module: NavModule }) => {
  const pathname = usePathname();
  const context = useContext(ContextData);
  const canOpen = useCanOpenRoute();

  const items = module.items.filter((item) => canOpen(item.href));

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
          icon={<img src="/icons/Potta.svg" className="mt-2 h-18 w-18" alt="Potta" />}
        >
          {' '}
        </MenuItem>
        {items.map((item, index) => {
          const active = isNavActive(pathname, item);
          const ItemIcon = item.icon;
          return (
            <MenuItem
              key={item.href}
              active={active}
              className={index === 0 ? 'mt-8' : ''}
              href={item.href}
              icon={<ItemIcon size={SB_ICON} weight={sbWeight(active)} className={sbClass(active)} />}
            >
              <span className="text-[0.9375rem] font-medium leading-snug">{item.title}</span>
            </MenuItem>
          );
        })}
      </Menu>
      <SidebarProfile context={context} />
    </Sidebar>
  );
};

export default ModuleSidebar;
