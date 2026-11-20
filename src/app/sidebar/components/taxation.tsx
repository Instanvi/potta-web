import { useContext } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { usePathname } from 'next/navigation';
import { ContextData } from '@potta/components/providers/DataProvider';
import SidebarProfile from './SidebarProfile';
import {
  ChartBar,
  ChartPie,
  DeviceMobile,
  EnvelopeOpen,
} from '@phosphor-icons/react';
import { SB_ICON, sbClass, sbWeight } from './sidebarPhosphor';

const SidebarsTaxation = () => {
  const pathname = usePathname();
  const str = pathname.split('/');
  const context = useContext(ContextData);

  const illogicalActive = str[1] == 'dashboard';
  const mailActive = str[1] == 'inbox';

  return (
    <Sidebar
      backgroundColor="#F9F9F9"
      collapsedWidth="65px"
      width="180px"
      transitionDuration={500}
      collapsed={context?.toggle}
      toggled={true}
      breakPoint="md"
      className="relative z-30 h-[100vh] side"
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
          active={illogicalActive}
          className="mt-8 font-normal"
          href="/dashboard"
          icon={
            <ChartPie
              size={SB_ICON}
              weight={sbWeight(illogicalActive)}
              className={sbClass(illogicalActive)}
            />
          }
        >
          <h3 className="text-lg mt-[2px]">Payments</h3>
        </MenuItem>
        <MenuItem
          active={mailActive}
          className="mt-4 font-normal"
          href="/inbox"
          icon={
            <EnvelopeOpen
              size={SB_ICON}
              weight={sbWeight(mailActive)}
              className={sbClass(mailActive)}
            />
          }
        >
          <h3 className="text-lg mt-1.5">Cancelled</h3>
        </MenuItem>
        <MenuItem
          active={mailActive}
          className="mt-4 font-normal"
          href="/inbox"
          icon={
            <EnvelopeOpen
              size={SB_ICON}
              weight={sbWeight(mailActive)}
              className={sbClass(mailActive)}
            />
          }
        >
          <h3 className="text-lg mt-1.5">Failed</h3>
        </MenuItem>
        <MenuItem
          active={mailActive}
          className="mt-4 font-normal"
          href="/inbox"
          icon={
            <DeviceMobile
              size={SB_ICON}
              weight={sbWeight(mailActive)}
              className={sbClass(mailActive)}
            />
          }
        >
          <h3 className="text-lg mt-1.5">Terminals</h3>
        </MenuItem>
        <MenuItem
          active={mailActive}
          className="mt-4 font-normal"
          href="/inbox"
          icon={
            <ChartBar
              size={SB_ICON}
              weight={sbWeight(mailActive)}
              className={sbClass(mailActive)}
            />
          }
        >
          <h3 className="text-lg mt-1.5">Report</h3>
        </MenuItem>
      </Menu>
      <SidebarProfile context={context} />
    </Sidebar>
  );
};
export default SidebarsTaxation;
