import { ContextData } from '@potta/components/providers/DataProvider';
import { useContext } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { usePathname } from 'next/navigation';
import { FileText } from '@phosphor-icons/react';
import SidebarProfile from './SidebarProfile';
import { SB_ICON, sbClass, sbWeight } from './sidebarPhosphor';

const SidebarsFiles = () => {
  const pathname = usePathname();
  const context = useContext(ContextData);
  const isActive = (path: string) => pathname.startsWith(path);

  const filesOn = isActive('/files');

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
            <img src="/icons/Potta.svg" className="mt-2 h-16 w-16" alt="logo" />
          }
        >
          {' '}
        </MenuItem>
        <MenuItem
          active={filesOn}
          className="mt-8"
          href="/files"
          icon={
            <FileText
              size={SB_ICON}
              weight={sbWeight(filesOn)}
              className={sbClass(filesOn)}
            />
          }
        >
          <h3 className="text-lg mt-1.5">Files</h3>
        </MenuItem>
      </Menu>
      <SidebarProfile context={context} />
    </Sidebar>
  );
};
export default SidebarsFiles;
