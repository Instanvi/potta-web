'use client';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeApi } from '../../utils/api';
import TableSkeleton from './TableSkeleton';
import Search from '@potta/components/search';
import axios from 'config/axios.config';

const PayrollTable = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch employees
  const { data: employeesResponse, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      try {
        const response = await employeeApi.filterEmployees({
          limit: 100,
          sortBy: ['createdAt:DESC'],
        });
        console.log('Employee API response:', response);
        console.log('Employee API response.data:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching employees:', error);
        return { data: [] };
      }
    },
  });

  // Fetch roles to map role IDs to names
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      try {
        // Use axios directly to ensure we're using the correct endpoint
        const response = await axios.post('/roles/filter', {
          limit: 100,
          sortBy: ['name:ASC'],
        });
        console.log('Roles data fetched:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching roles:', error);
        return { data: [] };
      }
    },
  });

  // Fetch timesheet data for current month to get actual hours worked
  const { data: timesheetData, isLoading: isLoadingTimesheets } = useQuery({
    queryKey: ['timesheets-current-month'],
    queryFn: async () => {
      try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date();
        endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        const response = await axios.post('/timesheets/filter', {
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString(),
          limit: 1000,
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching timesheets:', error);
        return { data: [] };
      }
    },
  });

  // Create a map of role IDs to role names
  const roleMap = React.useMemo(() => {
    const map = new Map();
    if (rolesData?.data) {
      rolesData.data.forEach((role) => {
        map.set(role.uuid, role.name);
      });
    }
    return map;
  }, [rolesData]);

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Helper function to calculate hours from shift (for shift-based calculations)
  const calculateHoursFromShift = (shift) => {
    if (!shift.start_time || !shift.end_time) return 8; // Default to 8 hours

    // Parse hours from time strings (format: "HH:MM:SS")
    const startParts = shift.start_time.split(':');
    const endParts = shift.end_time.split(':');

    const startHour = parseInt(startParts[0]);
    const startMinute = parseInt(startParts[1]);
    const endHour = parseInt(endParts[0]);
    const endMinute = parseInt(endParts[1]);

    // Calculate total hours
    let hours = endHour - startHour;
    let minutes = endMinute - startMinute;

    // Adjust for minutes
    if (minutes < 0) {
      hours--;
      minutes += 60;
    }

    // Subtract break time if available
    const breakHours = shift.break_minutes ? shift.break_minutes / 60 : 0;

    return hours + minutes / 60 - breakHours;
  };

  // Helper function to calculate regular hours (8 hours max per day)
  const calculateRegularHours = (totalHours: number): number => {
    return totalHours > 8 ? 8 : totalHours;
  };

  // Helper function to calculate overtime hours
  const calculateOvertime = (totalHours: number): number => {
    return totalHours > 8 ? totalHours - 8 : 0;
  };

  // Process employee data for the table
  const processedData = React.useMemo(() => {
    console.log('Employees response:', employeesResponse);
    console.log('Employees data:', employeesResponse?.data);

    if (!employeesResponse?.data || employeesResponse.data.length === 0) {
      console.log('No employees data found');
      return [];
    }

    return employeesResponse.data.map((employee) => {
      // Calculate today's pay based on hourly rate or base pay
      const hourlyRate = parseFloat(employee.hourly_rate || '0');
      const basePay = parseFloat(employee.base_pay || '0');
      const monthlySalary = parseFloat(employee.salary || '0');

      // Calculate daily rate based on available values
      let dailyRate = 0;
      if (hourlyRate > 0) {
        dailyRate = hourlyRate * 8; // 8 hours per day
      } else if (basePay > 0) {
        dailyRate = basePay / 22; // Assuming 22 working days per month
      } else if (monthlySalary > 0) {
        dailyRate = monthlySalary / 22;
      }

      const todayPay = dailyRate;

      // Get bank account info
      const bankAccount =
        employee.bank_accounts && employee.bank_accounts.length > 0
          ? employee.bank_accounts.find((acc) => acc.is_primary) ||
            employee.bank_accounts[0]
          : null;

      // Calculate actual hours from timesheet data
      let actualTotalHours = 0;
      let actualRegularHours = 0;
      let actualOvertimeHours = 0;

      if (timesheetData?.data) {
        const employeeTimesheets = timesheetData.data.filter(
          (timesheet) => timesheet.employee?.uuid === employee.uuid
        );

        employeeTimesheets.forEach((timesheet) => {
          let totalHours = 0;

          if (timesheet.total_hours && parseFloat(timesheet.total_hours) > 0) {
            totalHours = parseFloat(timesheet.total_hours);
          } else if (timesheet.check_in_time && timesheet.check_out_time) {
            const checkIn = new Date(timesheet.check_in_time);
            const checkOut = new Date(timesheet.check_out_time);
            const diffMs = checkOut.getTime() - checkIn.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            const breakHours = timesheet.break_minutes
              ? timesheet.break_minutes / 60
              : 0;
            totalHours = diffHours - breakHours;
          }

          actualTotalHours += totalHours;
          actualRegularHours += calculateRegularHours(totalHours);
          actualOvertimeHours += calculateOvertime(totalHours);
        });
      }

      // Fallback to shift-based calculations if no timesheet data
      let shiftBasedRegularHours = 0;
      let shiftBasedOvertimeHours = 0;
      let shiftTimeInfo = 'No shifts';

      if (employee.shifts && employee.shifts.length > 0) {
        // Track shift durations and count occurrences
        const shiftDurations = {};

        // Calculate hours for each shift and find the most common duration
        employee.shifts.forEach((shift) => {
          if (shift.start_time && shift.end_time) {
            const duration = calculateHoursFromShift(shift);
            const durationKey = duration.toFixed(1);

            if (!shiftDurations[durationKey]) {
              shiftDurations[durationKey] = {
                count: 0,
                timeInfo: `${shift.start_time.substring(
                  0,
                  5
                )} - ${shift.end_time.substring(0, 5)}`,
                duration: duration,
              };
            }

            shiftDurations[durationKey].count++;
          }
        });

        // Find the most common shift duration
        let maxCount = 0;
        let mostCommonDuration = null;

        for (const [durationKey, info] of Object.entries(shiftDurations)) {
          if (info.count > maxCount) {
            maxCount = info.count;
            mostCommonDuration = info;
            shiftBasedRegularHours = parseFloat(durationKey);
            shiftTimeInfo = info.timeInfo;
          }
        }

        // Calculate overtime based on shifts
        if (employee.eligible_for_overtime) {
          employee.shifts.forEach((shift) => {
            const hoursPerShift = calculateHoursFromShift(shift);
            const overtimePerShift = Math.max(0, hoursPerShift - 8);
            shiftBasedOvertimeHours += overtimePerShift;
          });
        }
      }

      // Use actual timesheet data if available, otherwise use shift-based calculations
      const regularHours =
        actualTotalHours > 0 ? actualRegularHours : shiftBasedRegularHours;
      const overtimeHours =
        actualTotalHours > 0 ? actualOvertimeHours : shiftBasedOvertimeHours;

      // Calculate PTO hours
      let ptoHours = 0;

      if (employee.paid_time_off && employee.paid_time_off.length > 0) {
        employee.paid_time_off.forEach((pto) => {
          if (pto.days_used) {
            ptoHours += parseFloat(pto.days_used) * 8; // 8 hours per day
          }
        });
      }

      // Calculate benefits value
      let benefitsValue = 0;

      if (employee.benefits && employee.benefits.length > 0) {
        employee.benefits.forEach((benefit) => {
          if (benefit.value && parseFloat(benefit.value) > 0) {
            benefitsValue += parseFloat(benefit.value);
          } else if (benefit.rate && basePay > 0) {
            // Calculate benefit based on rate and base pay
            const rate = parseFloat(benefit.rate);
            benefitsValue += basePay * rate;
          }
        });
      }

      // Determine pay rate display
      let rateDisplay = '';
      if (hourlyRate > 0) {
        rateDisplay = `XAF ${hourlyRate.toLocaleString()}/hr`;
      } else if (basePay > 0) {
        rateDisplay = `XAF ${basePay.toLocaleString()}/mo`;
      } else if (monthlySalary > 0) {
        rateDisplay = `XAF ${monthlySalary.toLocaleString()}/mo`;
      } else {
        rateDisplay = 'Not set';
      }

      // Get role name from the role map
      const roleId = employee.role_id;
      const roleName = roleMap.get(roleId) || 'Staff';

      // Get employee name and initials
      const employeeName = `${employee.firstName} ${employee.lastName}`;
      const initials = getInitials(employeeName);

      return {
        id: employee.uuid,
        employee: {
          name: employeeName,
          initials: initials,
          email: employee.email,
        },
        todayPay: `XAF ${todayPay.toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })}`,
        rate: rateDisplay,
        regularHours: regularHours.toFixed(1),
        shiftTimeInfo: shiftTimeInfo,
        overtime: overtimeHours.toFixed(1),
        ptoHours: ptoHours.toFixed(1),
        benefits: `XAF ${benefitsValue.toLocaleString()}`,
        paymentMethod: bankAccount
          ? `${bankAccount.bank_name} (${bankAccount.account_number.slice(
              -4
            )}...)`
          : 'Not set',
        role: roleName,
        roleId: roleId,
        hasTimesheetData: actualTotalHours > 0,
      };
    });

    console.log('Processed data length:', processedData.length);
    return processedData;
  }, [employeesResponse, roleMap, timesheetData]);

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    console.log('Filtered data length:', processedData.length);
    if (!searchQuery.trim()) return processedData;

    const query = searchQuery.toLowerCase();
    return processedData.filter((employee) => {
      return (
        employee.employee.name.toLowerCase().includes(query) ||
        employee.role.toLowerCase().includes(query) ||
        employee.rate.toLowerCase().includes(query) ||
        employee.paymentMethod.toLowerCase().includes(query) ||
        employee.todayPay.toLowerCase().includes(query) ||
        employee.benefits.toLowerCase().includes(query)
      );
    });
  }, [processedData, searchQuery]);

  const columns = [
    {
      accessorKey: 'employee',
      header: 'Employee',
      cell: ({ row }: { row: { original: any } }) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-sm flex-shrink-0">
            {row.original.employee.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {row.original.employee.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {row.original.employee.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'todayPay',
      header: 'Today Pay',
      cell: ({ row }: { row: { original: any } }) => (
        <div>{row.original.todayPay}</div>
      ),
    },
    {
      accessorKey: 'rate',
      header: 'Rate',
      cell: ({ row }: { row: { original: any } }) => (
        <div>{row.original.rate}</div>
      ),
    },
    {
      accessorKey: 'regularHours',
      header: 'Regular hrs',
      cell: ({ row }: { row: { original: any } }) => (
        <div
          title={`${
            row.original.hasTimesheetData ? 'From timesheets' : 'From shifts'
          } | ${row.original.shiftTimeInfo}`}
          className={
            row.original.hasTimesheetData ? 'text-green-600 font-medium' : ''
          }
        >
          {row.original.regularHours}
        </div>
      ),
    },
    {
      accessorKey: 'overtime',
      header: 'Overtime',
      cell: ({ row }: { row: { original: any } }) => (
        <div
          className={
            row.original.hasTimesheetData ? 'text-green-600 font-medium' : ''
          }
        >
          {row.original.overtime}
        </div>
      ),
    },
    {
      accessorKey: 'ptoHours',
      header: 'PTO hrs',
      cell: ({ row }: { row: { original: any } }) => (
        <div>{row.original.ptoHours}</div>
      ),
    },
    {
      accessorKey: 'benefits',
      header: 'Benefits',
      cell: ({ row }: { row: { original: any } }) => (
        <div>{row.original.benefits}</div>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Payment Method',
      cell: ({ row }: { row: { original: any } }) => (
        <div>{row.original.paymentMethod}</div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }: { row: { original: any } }) => (
        <div title={`Role ID: ${row.original.roleId}`}>{row.original.role}</div>
      ),
    },
  ];

  const isLoading = isLoadingEmployees || isLoadingRoles || isLoadingTimesheets;

  return (
    <div className="mt-10">
      {/* Search Section */}
      <div className="mb-6">
        <div className="max-w-md">
          <Search
            placeholder="Search employees, roles, rates..."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            value={searchQuery}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataGrid data={filteredData} columns={columns} loading={false}/>
      )}
    </div>
  );
};

export default PayrollTable;
