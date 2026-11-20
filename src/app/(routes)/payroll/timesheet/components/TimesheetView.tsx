'use client';
import React, { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import TimesheetTable from './table';
import Button from '@potta/components/button';
import CustomLoader from '@potta/components/loader';
import Search from '@potta/components/search';
import { useTimesheets } from '../hooks/useTimesheets';
import { Timesheet } from '../../people/utils/types';

interface TimesheetViewProps {
  dateRange: { start: Date; end: Date };
  buttonClick: () => void;
  setSelectedEmployeeId?: (id: string) => void;
}

const TimesheetView: React.FC<TimesheetViewProps> = ({
  dateRange,
  buttonClick,
  setSelectedEmployeeId,
}) => {
  const queryClient = useQueryClient();

  // Use the custom hook for timesheets
  const { data: filteredTimesheets, isLoading } = useTimesheets(dateRange);

  // Format time for display (e.g., "08:00")
  const formatTime = (timeString: string | null | undefined): string => {
    if (!timeString) return '';
    try {
      const date = new Date(timeString);
      return format(date, 'HH:mm');
    } catch (error) {
      return timeString || '';
    }
  };

  // Calculate regular hours (assuming 8-hour workday)
  const calculateRegularHours = (totalHours: number | string): number => {
    const hours = parseFloat(totalHours as string);
    return isNaN(hours) ? 0 : hours > 8 ? 8 : hours;
  };

  // Calculate overtime hours
  const calculateOvertime = (totalHours: number | string): string | number => {
    const hours = parseFloat(totalHours as string);
    return isNaN(hours) ? 0 : hours > 8 ? (hours - 8).toFixed(1) : 0;
  };

  // Handle timesheet status change
  const handleTimesheetStatusChange = (
    timesheetId: string,
    newStatus: string
  ) => {
    queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    queryClient.invalidateQueries({ queryKey: ['timesheets-summary'] });
  };

  // Handle adding hours for a specific employee
  const handleAddHours = (userId: string) => {
    if (setSelectedEmployeeId) {
      setSelectedEmployeeId(userId);
    }
  };

  // Process timesheet data for the table
  const processedData = useMemo(() => {
    if (!filteredTimesheets) return [];
    return filteredTimesheets.map((timesheet: Timesheet) => {
      let totalHours = 0;
      let checkInTime = timesheet.check_in_time || '';
      let checkOutTime = timesheet.check_out_time || '';
      const employee = timesheet.employee || ({} as any);
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
      const breakMinutes = timesheet.break_minutes || 0;
      const formatBreakTime = (minutes: number): string => {
        if (minutes === 0) return '0 min';
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (remainingMinutes === 0) return `${hours}h`;
        return `${hours}h ${remainingMinutes}m`;
      };
      return {
        id: employee.uuid,
        timesheetId: timesheet.uuid,
        employee: `${employee.firstName || ''} ${employee.lastName || ''}`,
        totalHours: totalHours.toFixed(1),
        breakTime: formatBreakTime(breakMinutes),
        breakDown: `${formatTime(checkInTime)} - ${formatTime(checkOutTime)}`,
        regularHours: calculateRegularHours(totalHours),
        overTime: calculateOvertime(totalHours),
        status: timesheet.status || 'Pending',
      };
    });
  }, [filteredTimesheets]);

  return (
    <div className="mt-10">
      {/* Search and action buttons - always visible */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-96">
          <Search placeholder="Search People" />
        </div>
        <div className="flex space-x-2">
          <Button
            type="button"
            icon={<i className="ri-file-add-line"></i>}
            text="New Time Entry"
            onClick={buttonClick}
          />
        </div>
      </div>
      {/* Table or loading/empty states */}
      {isLoading ? (
        <div className="mt-4">
          <CustomLoader />
        </div>
      ) : (
        <TimesheetTable
          data={processedData}
          onTimesheetStatusChange={handleTimesheetStatusChange}
          showControls={false}
          buttonClick={buttonClick}
          onAddHours={handleAddHours}
        />
      )}
    </div>
  );
};

export default TimesheetView;
