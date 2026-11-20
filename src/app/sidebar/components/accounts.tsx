import { ContextData } from '@potta/components/providers/DataProvider';
import { useContext } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { usePathname } from 'next/navigation';
import { Article, Buildings, UsersThree } from '@phosphor-icons/react';
import SidebarProfile from './SidebarProfile';
import { SB_ICON, sbClass, sbWeight } from './sidebarPhosphor';

const SidebarsAccounts = () => {
  const pathname = usePathname();
  const pathParts = pathname.split('/');
  const context = useContext(ContextData);
  const isActive = (path: string) => pathname.startsWith(path);

  const accOn = isActive('/accounting') && pathParts.length === 2;
  const jourOn = isActive('/accounting/journals');
  const assetOn = isActive('/accounting/assets');

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
          className="font-normal"
          href="/"
          icon={
            <img src="/icons/Potta.svg" className="mt-2 h-16 w-16" alt="logo" />
          }
        >
          {' '}
        </MenuItem>
        <MenuItem
          active={accOn}
          className="mt-8"
          href="/accounting"
          icon={
            <UsersThree
              size={SB_ICON}
              weight={sbWeight(accOn)}
              className={sbClass(accOn)}
            />
          }
        >
          <h3 className="text-lg mt-[2px]">Accounts</h3>
        </MenuItem>

        <MenuItem
          active={jourOn}
          className=""
          href="/accounting/journals"
          icon={
            <Article
              size={SB_ICON}
              weight={sbWeight(jourOn)}
              className={sbClass(jourOn)}
            />
          }
        >
          <h3 className="text-lg mt-[2px]">Journals</h3>
        </MenuItem>
        <MenuItem
          active={assetOn}
          className=""
          href="/accounting/assets"
          icon={
            <Buildings
              size={SB_ICON}
              weight={sbWeight(assetOn)}
              className={sbClass(assetOn)}
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
