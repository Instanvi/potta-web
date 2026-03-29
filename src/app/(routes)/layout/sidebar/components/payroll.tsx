import { useContext, useState } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { usePathname } from 'next/navigation';
import Icon from '@potta/components/icon_fonts/icon';
import { ContextData } from '@potta/components/providers/DataProvider';
import { Heart, Clock } from 'lucide-react';
import { GiReceiveMoney } from 'react-icons/gi';
import { svgIcons } from '@potta/components/svg_icons/IconsSvg';
import SidebarProfile from './SidebarProfile';
import { Can } from '@potta/components/auth/can';

const SidebarsPayroll = () => {
  const pathname = usePathname();
  const string = pathname;
  const str = string.split('/');
  console.log(str[1]);

  const context = useContext(ContextData);

  return (
    <Sidebar
      collapsedWidth="65px"
      width="200px"
      transitionDuration={500}
      collapsed={context?.toggle}
      toggled={true}
      breakPoint="md"
      className=" relative !border-none h-[100vh] z-30  "
    >
      <Menu className="relative h-[76vh]" closeOnClick>
        <MenuItem
          className="  "
          href="/"
          icon={
            <img src="/icons/Potta.svg" className="h-16 w-16 mt-2" alt="logo" />
          }
        >
          {/* MdOutlineSpaceDashboard */}
          {' '}
        </MenuItem>

        <MenuItem
          active={str[2] == 'overview' ? true : false}
          className="mt-8"
          href="/payroll/overview"
          icon={svgIcons.dashboard(str[2] == 'overview' ? 'white' : '#6b7280')}
        >
          {' '}
          <h3 className="text-md mt-[2px]">Dashboard</h3>{' '}
        </MenuItem>
        <Can resource="Employee" action="view">
          <MenuItem
            active={str[2] == 'people' ? true : false}
            href="/payroll/people"
            icon={svgIcons.users(str[2] == 'people' ? 'white' : '#6b7280')}
          >
            <h3 className="text-md ">Employees</h3>
          </MenuItem>
        </Can>

        {/* Time Management with submenu */}
        <Can resource="Shift" action="view">
          <SubMenu
            label={<h3 className="text-md">Time Management</h3>}
            icon={svgIcons.clock(
              str[2] == 'timesheet' || str[2] == 'shifts' ? 'white' : '#6b7280'
            )}
            className={` ${
              str[2] == 'timesheet' || str[2] == 'shifts' ? 'active-parent' : ''
            }`}
            defaultOpen={str[2] == 'timesheet' || str[2] == 'shifts'}
          >
            <MenuItem
              active={str[2] == 'timesheet'}
              className="pl-6 "
              href="/payroll/timesheet"
            >
              <h3 className="text-md">Timesheet</h3>
            </MenuItem>
            <MenuItem
              active={str[2] == 'shifts'}
              className="pl-6 "
              href="/payroll/shifts"
            >
              <h3 className="text-md">Shifts</h3>
            </MenuItem>
          </SubMenu>
        </Can>

        <Can resource="Benefit" action="view">
          <MenuItem
            active={str[2] == 'benefit' ? true : false}
            href="/payroll/benefit"
            icon={
              <Heart size={21} color={str[2] == 'benefit' ? 'white' : '#6b7280'} />
            }
          >
            <h3 className="text-md ">Benefit</h3>
          </MenuItem>
        </Can>

        <Can resource="PaidTimeOff" action="view">
          <MenuItem
            active={str[2] == 'pto' ? true : false}
            href="/payroll/pto"
            icon={svgIcons.pto(str[2] == 'pto' ? 'white' : '#6b7280')}
          >
            <h3 className="text-md ">PTO</h3>
          </MenuItem>
        </Can>

        <Can resource="Deduction" action="view">
          <MenuItem
            active={str[2] == 'deductions'}
            className=""
            href="/payroll/deductions"
            icon={svgIcons.dollarcoin(str[2] == 'deductions' ? 'white' : '#6b7280')}
          >
            <h3 className="text-md ">Deductions</h3>
          </MenuItem>
        </Can>
        {/* Payroll Docs (Payslips & Payschedules) submenu */}
        {/* <SubMenu
          label={<h3 className="text-md">Payroll Docs</h3>}
         
          icon={
            str[2] == 'payslips' || str[2] == 'payschedules'? (
              <GiReceiveMoney size={24} className="text-white" />
            ) : (
              <GiReceiveMoney size={24} className="text-gray-600" />
            )
          }
          className={` ${
            str[2] == 'payslips' || str[2] == 'payschedules'
              ? 'active-parent'
              : ''
          }`}
          defaultOpen={str[2] == 'payslips' || str[2] == 'payschedules'}
        >
          <MenuItem
            active={str[2] == 'payslips'}
            className="pl-6 "
            href="/payroll/payslips"
          >
            <h3 className="text-md">Payslips</h3>
          </MenuItem>
          <MenuItem
            active={str[2] == 'payschedules'}
            className="pl-6 "
            href="/payroll/payschedules"
          >
            <h3 className="text-md">Payschedules</h3>
          </MenuItem>
        </SubMenu> */}
        <MenuItem
          active={str[2] == 'reports' ? true : false}
          className=""
          href="/reports"
          icon={svgIcons.piechart(str[2] == 'reports' ? 'white' : '#6b7280')}
        >
          <h3 className="text-md ">Reports</h3>
        </MenuItem>
      </Menu>
      <SidebarProfile context={context} />
    </Sidebar>
  );
};

export default SidebarsPayroll;
