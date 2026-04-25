'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'config/axios.config';
import { toast } from 'react-hot-toast';
import Search from '@potta/components/search';
import SearchableSelect from '@potta/components/searchableSelect';
import {
  ArrowUpFromLine,
  Download,
  Plus,
  ChevronRight,
  ChevronLeft,
  Filter,
  Calendar,
  Users,
  Clock,
  MoreHorizontal,
} from 'lucide-react';
import { peopleApi } from '../../people/utils/api';
import Button from '@potta/components/button';
import {
  differenceInMinutes,
  format,
  startOfWeek,
  addDays,
  parseISO,
  isSameDay,
  isToday,
  addWeeks,
  subWeeks,
} from 'date-fns';
import NewShiftModal from './NewShiftModal';
import PottaLoader from '@potta/components/pottaloader';

// Types
interface ShiftRecurrencePattern {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

interface OvertimePolicy {
  grace_period: number;
  multiplier: number;
}

interface Shift {
  id?: string;
  uuid?: string;
  person_id?: string;
  employeeId?: string;
  name: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  recurrence_pattern: ShiftRecurrencePattern;
  overtime_policy: OvertimePolicy | null;
  applies_to_roles: string[];
  applies_to_departments: string[] | null;
  role?: string;
  color?: string; // New color field
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  initials?: string;
  email?: string;
  department?: string;
}

interface WeekDate {
  day: string;
  date: string;
  fullDate: Date;
  dayIndex: number;
  isoDate: string;
  dayName: keyof ShiftRecurrencePattern;
}

interface Role {
  uuid: string;
  name: string;
}

// Constants
const ITEMS_PER_PAGE = 10;
const SHIFT_COLORS = {
  morning: '#34A853',
  afternoon: '#2196F3',
  night: '#9C27B0',
  unavailable: '#9E9E9E',
  custom: '#FF9800',
};

const ShiftView: React.FC = () => {
  // State
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roleNames, setRoleNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewShiftModal, setShowNewShiftModal] = useState(false);
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<WeekDate | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [filters, setFilters] = useState({
    department: '',
    role: '',
    status: 'all',
  });

  // Memoized values

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const fullName =
        `${employee.first_name} ${employee.last_name}`.toLowerCase();
      const matchesSearch = fullName.includes(searchQuery.toLowerCase());
      const matchesDepartment =
        !filters.department || employee.department === filters.department;

      // Role filter: check if employee has any shifts that apply to the selected role
      const matchesRole =
        !filters.role ||
        shifts.some(
          (shift) =>
            (shift.person_id === employee.id ||
              shift.employeeId === employee.id) &&
            shift.applies_to_roles &&
            shift.applies_to_roles.includes(filters.role)
        );

      return matchesSearch && matchesDepartment && matchesRole;
    });
  }, [employees, searchQuery, filters.department, filters.role, shifts]);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEmployees, currentPage]);

  const totalPages = useMemo(
    () => Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE),
    [filteredEmployees.length]
  );

  // Effects
  useEffect(() => {
    fetchEmployeesAndShifts();
    fetchRoles();
  }, []);

  // Utility functions
  const getCurrentWeekDates = (weekStart: Date): WeekDate[] => {
    const startOfCurrentWeek = startOfWeek(weekStart, { weekStartsOn: 0 });
    const weekDates: WeekDate[] = [];
    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];

    for (let i = 0; i < 7; i++) {
      const date = addDays(startOfCurrentWeek, i);
      weekDates.push({
        day: format(date, 'EEE'),
        date: format(date, 'd'),
        fullDate: date,
        dayIndex: i,
        isoDate: format(date, 'yyyy-MM-dd'),
        dayName: dayNames[i] as keyof ShiftRecurrencePattern,
      });
    }
    return weekDates;
  };
  const weekDates = useMemo(
    () => getCurrentWeekDates(currentWeek),
    [currentWeek]
  );

  const getInitials = (firstName: string): string => {
    return firstName && firstName.length > 0 ? firstName[0].toUpperCase() : '';
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    try {
      if (timeString.length <= 8 && timeString.includes(':')) {
        return timeString.substring(0, 5);
      }
      return format(parseISO(timeString), 'HH:mm');
    } catch (error) {
      console.error('Error formatting time:', error);
      return '08:00';
    }
  };

  const formatHours = (hours: number): string => {
    return hours === 0 ? '0 hrs' : `${hours} hrs`;
  };

  const getRoleName = (roleId: string): string => {
    return roleNames[roleId] || 'Staff';
  };

  const calculateShiftHours = (shift: Shift): number => {
    if (shift.name === 'Unavailable') return 0;
    if (!shift.start_time || !shift.end_time) return 0;

    try {
      if (
        shift.start_time.length <= 8 &&
        shift.start_time.includes(':') &&
        shift.end_time.length <= 8 &&
        shift.end_time.includes(':')
      ) {
        const [startHours, startMinutes] = shift.start_time
          .split(':')
          .map(Number);
        const [endHours, endMinutes] = shift.end_time.split(':').map(Number);
        let totalMinutes =
          endHours * 60 + endMinutes - (startHours * 60 + startMinutes);

        if (totalMinutes < 0) {
          totalMinutes += 24 * 60;
        }

        totalMinutes -= shift.break_minutes || 0;
        return Math.max(0, Math.round((totalMinutes / 60) * 10) / 10);
      }

      const start = parseISO(shift.start_time);
      const end = parseISO(shift.end_time);
      const totalMinutes =
        differenceInMinutes(end, start) - (shift.break_minutes || 0);
      return Math.max(0, Math.round((totalMinutes / 60) * 10) / 10);
    } catch (error) {
      console.error('Error calculating shift hours:', error);
      return 0;
    }
  };

  const getEmployeeShiftForDay = (
    employeeId: string,
    dayName: keyof ShiftRecurrencePattern
  ) => {
    return shifts.find(
      (shift) =>
        (shift.person_id === employeeId || shift.employeeId === employeeId) &&
        shift.recurrence_pattern &&
        shift.recurrence_pattern[dayName]
    );
  };

  const calculateEmployeeTotalHours = (employeeId: string): number => {
    return weekDates.reduce((total, date) => {
      const shift = getEmployeeShiftForDay(employeeId, date.dayName);
      if (shift && shift.name !== 'Unavailable') {
        total += calculateShiftHours(shift);
      }
      return total;
    }, 0);
  };

  const calculateDayHours = (
    employeeId: string,
    dayName: keyof ShiftRecurrencePattern
  ): number => {
    const shift = getEmployeeShiftForDay(employeeId, dayName);
    if (!shift || shift.name === 'Unavailable') return 0;
    return calculateShiftHours(shift);
  };

  const calculateTotalDayHours = (
    dayName: keyof ShiftRecurrencePattern
  ): number => {
    return filteredEmployees.reduce((total, employee) => {
      return total + calculateDayHours(employee.id, dayName);
    }, 0);
  };

  const calculateTotalHours = (): number => {
    return filteredEmployees.reduce((total, employee) => {
      return total + calculateEmployeeTotalHours(employee.id);
    }, 0);
  };

  const getShiftColor = (shift: Shift, isToday: boolean): string => {
    if (shift.color) {
      // Use the custom color from the shift data
      return '';
    }

    if (shift.name === 'Unavailable') {
      return 'bg-gray-200';
    }

    if (shift.name.includes('Afternoon')) {
      return isToday ? 'bg-blue-600' : 'bg-blue-500';
    }

    if (shift.name.includes('Night')) {
      return isToday ? 'bg-purple-700' : 'bg-purple-600';
    }

    return isToday ? 'bg-green-600' : 'bg-green-500';
  };

  // API functions
  const fetchRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const rolesResponse = await axios.post('/roles/filter', {
        page: 1,
        limit: 100,
      });

      if (rolesResponse?.data?.data) {
        const rolesMap: Record<string, string> = {};
        const rolesForSelect: { value: string; label: string }[] = [];

        rolesResponse.data.data.forEach((role: Role) => {
          if (role.uuid && role.name) {
            rolesMap[role.uuid] = role.name;
            rolesForSelect.push({
              value: role.uuid,
              label: role.name,
            });
          }
        });

        setRoleNames(rolesMap);
        setRoles(rolesForSelect);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const fetchEmployeesAndShifts = async () => {
    setLoading(true);
    try {
      const employeesResponse = await axios.post('/employees/filter', {
        page: 1,
        limit: 100,
        status: 'active',
      });

      let employeeData: Employee[] = [];

      if (employeesResponse?.data?.data?.length > 0) {
        employeeData = employeesResponse.data.data.map((emp: any) => {
          const firstName = emp.first_name || emp.firstName || '';
          const lastName = emp.last_name || emp.lastName || '';
          const initials = getInitials(firstName);

          return {
            id: emp.uuid || emp.id || emp._id,
            first_name: firstName,
            last_name: lastName,
            avatar: emp.avatar,
            initials: initials,
            email: emp.email,
            department: emp.department,
          };
        });
      }

      setEmployees(employeeData);

      try {
        const shiftsResponse = await axios.post('/shifts/filter', {});
        if (shiftsResponse?.data?.data) {
          const shiftsData = shiftsResponse.data.data.map(
            (shift: any, index: number) => {
              const employeeIndex = index % employeeData.length;
              const assignedEmployeeId = employeeData[employeeIndex]?.id;

              return {
                id: shift.uuid || shift.id,
                uuid: shift.uuid,
                person_id: assignedEmployeeId,
                employeeId: assignedEmployeeId,
                name: shift.name,
                start_time: shift.start_time,
                end_time: shift.end_time,
                break_minutes: shift.break_minutes || 30,
                color: shift.color || SHIFT_COLORS.morning,
                recurrence_pattern: shift.recurrence_pattern || {
                  monday: true,
                  tuesday: false,
                  wednesday: false,
                  thursday: true,
                  friday: false,
                  saturday: false,
                  sunday: true,
                },
                overtime_policy: shift.overtime_policy || {
                  grace_period: 15,
                  multiplier: 1.5,
                },
                applies_to_roles: shift.applies_to_roles || [
                  '931d9297-ae7f-4967-9d4b-da37dbd0f077',
                ],
                applies_to_departments: shift.applies_to_departments || [
                  'service',
                ],
                role: 'Staff',
              };
            }
          );

          setShifts(shiftsData);
        } else {
          const sampleShifts = createSampleShifts(employeeData);
          setShifts(sampleShifts);
        }
      } catch (shiftError) {
        console.error('Error fetching shifts:', shiftError);
        const sampleShifts = createSampleShifts(employeeData);
        setShifts(sampleShifts);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      const fallbackEmployees = [
        {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
          initials: 'JD',
          email: 'john.doe@example.com',
          department: 'Engineering',
        },
        {
          id: '2',
          first_name: 'Blessed',
          last_name: 'Nur',
          avatar:
            'https://ui-avatars.com/api/?name=Blessed+Nur&background=random',
          initials: 'BN',
          email: 'blessed.nur@example.com',
          department: 'Sales',
        },
      ];

      setEmployees(fallbackEmployees);
      const sampleShifts = createSampleShifts(fallbackEmployees);
      setShifts(sampleShifts);
    } finally {
      setLoading(false);
    }
  };

  const createSampleShifts = (employeeList: Employee[]): Shift[] => {
    if (!employeeList || employeeList.length === 0) return [];

    const sampleShifts = [];

    if (employeeList.length > 0) {
      sampleShifts.push({
        id: '1',
        person_id: employeeList[0].id,
        name: 'Morning Shift',
        start_time: '08:00:00',
        end_time: '16:00:00',
        break_minutes: 30,
        color: SHIFT_COLORS.morning,
        recurrence_pattern: {
          monday: true,
          tuesday: false,
          wednesday: false,
          thursday: true,
          friday: false,
          saturday: false,
          sunday: true,
        },
        overtime_policy: {
          grace_period: 15,
          multiplier: 1.5,
        },
        applies_to_roles: ['931d9297-ae7f-4967-9d4b-da37dbd0f077'],
        applies_to_departments: ['service'],
        role: 'Staff',
      });
    }

    if (employeeList.length > 1) {
      sampleShifts.push({
        id: '2',
        person_id: employeeList[1].id,
        name: 'Afternoon Shift',
        start_time: '14:00:00',
        end_time: '22:00:00',
        break_minutes: 30,
        color: SHIFT_COLORS.afternoon,
        recurrence_pattern: {
          monday: true,
          tuesday: true,
          wednesday: false,
          thursday: true,
          friday: false,
          saturday: false,
          sunday: true,
        },
        overtime_policy: {
          grace_period: 15,
          multiplier: 1.5,
        },
        applies_to_roles: ['931d9297-ae7f-4967-9d4b-da37dbd0f077'],
        applies_to_departments: ['service'],
        role: 'Staff',
      });
    }

    return sampleShifts;
  };

  // Event handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleClearFilters = () => {
    setFilters({
      department: '',
      role: '',
      status: 'all',
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleWeekChange = (direction: 'next' | 'prev') => {
    setCurrentWeek((prev) =>
      direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1)
    );
  };

  const toggleNewShiftModal = (dateInfo?: WeekDate, employeeId?: string) => {
    if (dateInfo) {
      setSelectedDate(dateInfo);
    } else {
      setSelectedDate(null);
    }
    if (employeeId) {
      setSelectedEmployeeId(employeeId);
    } else {
      setSelectedEmployeeId(null);
    }
    setShowNewShiftModal(!showNewShiftModal);
  };

  const handleShiftCreated = () => {
    setShowNewShiftModal(false);
    fetchEmployeesAndShifts();
    toast.success('Shift added successfully!');
  };

  const refreshData = useCallback(() => {
    fetchEmployeesAndShifts();
  }, []);

  // Render functions
  const renderEmployeeAvatar = (employee: Employee) => {
    return (
      <div className="flex-shrink-0 h-10 w-10 relative">
        {employee.avatar ? (
          <img
            className="h-10 w-10 rounded-full object-cover"
            src={employee.avatar}
            alt={`${employee.first_name} ${employee.last_name}`}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const initialsDiv = parent.querySelector('.initials-fallback');
                if (initialsDiv) {
                  (initialsDiv as HTMLElement).style.display = 'flex';
                }
              }
            }}
          />
        ) : null}

        <div
          className="initials-fallback h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium"
          style={{ display: employee.avatar ? 'none' : 'flex' }}
        >
          {employee.initials || employee.first_name.charAt(0)}
        </div>
      </div>
    );
  };

  const renderShiftCell = (employeeId: string, dateInfo: WeekDate) => {
    const shift = getEmployeeShiftForDay(employeeId, dateInfo.dayName);
    const isTodayCell = isToday(dateInfo.fullDate);

    if (!shift) {
      return (
        <div className="h-full flex items-center justify-center">
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => toggleNewShiftModal(dateInfo, employeeId)}
          >
            <Plus size={20} />
          </button>
        </div>
      );
    }

    if (shift.name === 'Unavailable') {
      return (
        <div className="bg-gray-200 h-full flex items-center justify-center">
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className="text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 12 12 22 22 12 12 2z" />
                </svg>
              </div>
              <div className="text-gray-600 text-xs">Unavailable</div>
            </div>
          </div>
        </div>
      );
    }

    const bgColor = getShiftColor(shift, isTodayCell);
    const roleDisplay =
      shift.applies_to_roles && shift.applies_to_roles.length > 0
        ? getRoleName(shift.applies_to_roles[0])
        : 'Staff';

    // Use custom color if available, otherwise use CSS classes
    const customStyle = shift.color
      ? {
          backgroundColor: shift.color,
          opacity: isTodayCell ? 0.9 : 1,
        }
      : {};

    return (
      <div
        className={`${bgColor} h-full p-2 text-sm rounded-sm`}
        style={customStyle}
      >
        <div className="text-white">
          <div className="font-medium">
            {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
          </div>
          <div className="text-xs opacity-90">{roleDisplay}</div>
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t">
        <div className="text-sm text-gray-700">
          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredEmployees.length)} of{' '}
          {filteredEmployees.length} employees
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="bg-white border p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <h1 className="text-2xl font-medium text-gray-900">
                Shift Management
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{format(weekDates[0].fullDate, 'MMM d')}</span>
              <span>-</span>
              <span>{format(weekDates[6].fullDate, 'MMM d, yyyy')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              text="New Shift"
              icon={<Plus size={16} />}
              onClick={() => toggleNewShiftModal()}
            />
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => handleWeekChange('prev')}
            className="flex items-center gap-2 px-3 py-2 text-sm border  hover:bg-gray-50"
          >
            <ChevronLeft size={16} />
            Previous Week
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">
                {filteredEmployees.length} employees
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">
                {formatHours(calculateTotalHours())} total
              </span>
            </div>
          </div>

          <button
            onClick={() => handleWeekChange('next')}
            className="flex items-center gap-2 px-3 py-2 text-sm border  hover:bg-gray-50"
          >
            Next Week
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col items-center lg:flex-row gap-4">
        <div className="flex-1">
          <Search
            placeholder="Search employees..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="flex gap-3">
          <div className="w-48">
            <SearchableSelect
              // label="Filter by Role"
              options={[
                { value: '', label: 'All Roles' },
                ...roles.map((role) => ({
                  value: role.value,
                  label: role.label,
                })),
              ]}
              selectedValue={filters.role}
              onChange={(value) => handleFilterChange('role', value)}
              placeholder="Select role"
            />
          </div>
          {(filters.role || searchQuery) && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 text-sm text-gray-600 border border-gray-300 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <PottaLoader />
        </div>
      ) : (
        <div className="bg-white border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 w-8 border-r">
                    <input type="checkbox" className="h-4 w-4 text-blue-600" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-medium text-gray-700 tracking-wider w-48 border-r"
                  >
                    Employee
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-medium text-gray-700 tracking-wider w-24 border-r"
                  >
                    Total Hours
                  </th>
                  {weekDates.map((date) => (
                    <th
                      key={date.dayIndex}
                      scope="col"
                      className={`px-4 py-4 text-center text-sm font-medium ${
                        isToday(date.fullDate)
                          ? 'text-green-600 font-medium bg-green-50'
                          : 'text-gray-700'
                      } tracking-wider w-28 border-r`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-500">
                          {date.day}
                        </span>
                        <span className="text-lg font-medium">
                          {date.date}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedEmployees.map((employee, index) => (
                  <tr
                    key={employee.id}
                    className={
                      index % 2 === 0
                        ? 'bg-white'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap border-r">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-r">
                      <div className="flex items-center">
                        {renderEmployeeAvatar(employee)}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.first_name} {employee.last_name}
                          </div>
                          {employee.email && (
                            <div className="text-xs text-gray-500">
                              {employee.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r">
                      <div className="font-medium">
                        {formatHours(calculateEmployeeTotalHours(employee.id))}
                      </div>
                    </td>
                    {weekDates.map((date) => (
                      <td
                        key={`${employee.id}-${date.dayIndex}`}
                        className={`px-2 py-4 h-20 border-r ${
                          isToday(date.fullDate) ? 'bg-green-50' : ''
                        }`}
                      >
                        {renderShiftCell(employee.id, date)}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Total row */}
                <tr className="bg-gray-50 border-t-2 border-gray-300">
                  <td className="px-6 py-4 whitespace-nowrap border-r">
                    <div className="flex items-center justify-center">
                      <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-r">
                    <div className="text-sm font-medium text-gray-900">Total</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium border-r">
                    {formatHours(calculateTotalHours())}
                  </td>
                  {weekDates.map((date) => (
                    <td
                      key={`total-${date.dayIndex}`}
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium border-r ${
                        isToday(date.fullDate)
                          ? 'text-green-600'
                          : 'text-gray-700'
                      }`}
                    >
                      {formatHours(calculateTotalDayHours(date.dayName))}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {renderPagination()}
        </div>
      )}

      {/* New Shift Modal */}
      {showNewShiftModal && (
        <NewShiftModal
          onClose={toggleNewShiftModal}
          onSuccess={handleShiftCreated}
          roles={roles}
          isLoadingRoles={isLoadingRoles}
          selectedDate={selectedDate}
          selectedEmployeeId={selectedEmployeeId}
        />
      )}
    </div>
  );
};

export default ShiftView;
