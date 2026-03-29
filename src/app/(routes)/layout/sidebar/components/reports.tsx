import { useContext } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '@potta/components/icon_fonts/icon';
import { ContextData } from '@potta/components/providers/DataProvider';
import { SiDatabricks } from 'react-icons/si';
import { svgIcons } from '@potta/components/svg_icons/IconsSvg';
import SidebarProfile from './SidebarProfile';
import { LuChartPie } from 'react-icons/lu';
import { PiCubeFocusLight } from 'react-icons/pi';

const SidebarsReports = () => {
  const pathname = usePathname();
  const router = useRouter();
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
        <MenuItem
          active={str[2] == 'dashboard' ? true : false}
          className="mt-8"
          href="/reports/dashboard"
          icon={svgIcons.dashboard(str[2] == 'dashboard' ? 'white' : '#6b7280')}
        >
          {' '}
          <h3 className="text-md mt-[2px]">Dashboard</h3>{' '}
        </MenuItem>
        <MenuItem
          active={str[1] === 'reports' && !str[2]}
          className=""
          href="/reports"
          icon={
            <LuChartPie
              size={21}
              color={str[1] == 'reports' && !str[2] ? 'white' : 'black'}
            />
          }
        >
          <h3 className="text-md mt-[2px]">Reports</h3>
        </MenuItem>
        <MenuItem
          active={str[1] === 'reports' && str[2] === 'models'}
          className=""
          href="/reports/models"
          icon={
            <PiCubeFocusLight
              size={21}
              color={
                str[1] == 'reports' && str[2] === 'models' ? 'white' : 'black'
              }
            />
          }
        >
          <h3 className="text-md mt-1.5">Models</h3>
        </MenuItem>
        <MenuItem
          active={str[1] === 'reports' && str[2] === 'data'}
          className=""
          href="/reports/data"
          icon={
            <SiDatabricks
              size={21}
              color={
                str[1] == 'reports' && str[2] == 'data' ? 'white' : 'black'
              }
            />
          }
        >
          <h3 className="text-md mt-1.5">Data Tables</h3>
        </MenuItem>
      </Menu>
      <SidebarProfile context={context} />
    </Sidebar>
  );
};

export default SidebarsReports;
