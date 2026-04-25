import { useContext } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { usePathname } from 'next/navigation';
import { ContextData } from '@potta/components/providers/DataProvider';
import SidebarProfile from './SidebarProfile';
import {
  ChartPie,
  Cube,
  Database,
  SquaresFour,
} from '@phosphor-icons/react';
import { SB_ICON, sbClass, sbWeight } from './sidebarPhosphor';

const SidebarsReports = () => {
  const pathname = usePathname();
  const str = pathname.split('/');
  const context = useContext(ContextData);

  const dashOn = str[2] == 'dashboard';
  const repRoot = str[1] === 'reports' && !str[2];
  const modelsOn = str[1] === 'reports' && str[2] === 'models';
  const dataOn = str[1] === 'reports' && str[2] === 'data';

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
        <MenuItem
          active={dashOn}
          className="mt-8"
          href="/reports/dashboard"
          icon={
            <SquaresFour
              size={SB_ICON}
              weight={sbWeight(dashOn)}
              className={sbClass(dashOn)}
            />
          }
        >
          <h3 className="text-md mt-[2px]">Dashboard</h3>
        </MenuItem>
        <MenuItem
          active={repRoot}
          className=""
          href="/reports"
          icon={
            <ChartPie
              size={SB_ICON}
              weight={sbWeight(repRoot)}
              className={sbClass(repRoot)}
            />
          }
        >
          <h3 className="text-md mt-[2px]">Reports</h3>
        </MenuItem>
        <MenuItem
          active={modelsOn}
          className=""
          href="/reports/models"
          icon={
            <Cube
              size={SB_ICON}
              weight={sbWeight(modelsOn)}
              className={sbClass(modelsOn)}
            />
          }
        >
          <h3 className="text-md mt-1.5">Models</h3>
        </MenuItem>
        <MenuItem
          active={dataOn}
          className=""
          href="/reports/data"
          icon={
            <Database
              size={SB_ICON}
              weight={sbWeight(dataOn)}
              className={sbClass(dataOn)}
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
