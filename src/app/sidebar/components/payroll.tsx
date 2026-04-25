import { useContext } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { usePathname } from 'next/navigation';
import {
  CalendarPlus,
  ChartPie,
  Clock,
  Coins,
  Heart,
  SquaresFour,
  Users,
} from '@phosphor-icons/react';
import { ContextData } from '@potta/components/providers/DataProvider';
import SidebarProfile from './SidebarProfile';
import { Can } from '@potta/components/auth/can';
import { SB_ICON, sbClass, sbWeight } from './sidebarPhosphor';

const SidebarsPayroll = () => {
  const pathname = usePathname();
  const str = pathname.split('/');
  const context = useContext(ContextData);

  const dashOn = str[2] == 'overview';
  const peopleOn = str[2] == 'people';
  const timeOn = str[2] == 'timesheet' || str[2] == 'shifts';
  const benefitOn = str[2] == 'benefit';
  const ptoOn = str[2] == 'pto';
  const dedOn = str[2] == 'deductions';
  const reportsOn = str[2] == 'reports';

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
          className=""
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
          href="/payroll/overview"
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
        <Can resource="Employee" action="view">
          <MenuItem
            active={peopleOn}
            href="/payroll/people"
            icon={
              <Users
                size={SB_ICON}
                weight={sbWeight(peopleOn)}
                className={sbClass(peopleOn)}
              />
            }
          >
            <h3 className="text-md">Employees</h3>
          </MenuItem>
        </Can>

        <Can resource="Shift" action="view">
          <SubMenu
            label={<h3 className="text-md">Time Management</h3>}
            icon={
              <Clock
                size={SB_ICON}
                weight={sbWeight(timeOn)}
                className={sbClass(timeOn)}
              />
            }
            className={` ${timeOn ? 'active-parent' : ''}`}
            defaultOpen={timeOn}
          >
            <MenuItem active={str[2] == 'timesheet'} className="pl-6" href="/payroll/timesheet">
              <h3 className="text-md">Timesheet</h3>
            </MenuItem>
            <MenuItem active={str[2] == 'shifts'} className="pl-6" href="/payroll/shifts">
              <h3 className="text-md">Shifts</h3>
            </MenuItem>
          </SubMenu>
        </Can>

        <Can resource="Benefit" action="view">
          <MenuItem
            active={benefitOn}
            href="/payroll/benefit"
            icon={
              <Heart
                size={SB_ICON}
                weight={sbWeight(benefitOn)}
                className={sbClass(benefitOn)}
              />
            }
          >
            <h3 className="text-md">Benefit</h3>
          </MenuItem>
        </Can>

        <Can resource="PaidTimeOff" action="view">
          <MenuItem
            active={ptoOn}
            href="/payroll/pto"
            icon={
              <CalendarPlus
                size={SB_ICON}
                weight={sbWeight(ptoOn)}
                className={sbClass(ptoOn)}
              />
            }
          >
            <h3 className="text-md">PTO</h3>
          </MenuItem>
        </Can>

        <Can resource="Deduction" action="view">
          <MenuItem
            active={dedOn}
            className=""
            href="/payroll/deductions"
            icon={
              <Coins
                size={SB_ICON}
                weight={sbWeight(dedOn)}
                className={sbClass(dedOn)}
              />
            }
          >
            <h3 className="text-md">Deductions</h3>
          </MenuItem>
        </Can>
        <MenuItem
          active={reportsOn}
          className=""
          href="/reports"
          icon={
            <ChartPie
              size={SB_ICON}
              weight={sbWeight(reportsOn)}
              className={sbClass(reportsOn)}
            />
          }
        >
          <h3 className="text-md">Reports</h3>
        </MenuItem>
      </Menu>
      <SidebarProfile context={context} />
    </Sidebar>
  );
};

export default SidebarsPayroll;
