import React, { useState } from 'react';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
import { ArrowUpFromLine, CirclePlus, Download, Plus } from 'lucide-react';
import Search from '@potta/components/search';
import Button from '@potta/components/button';
import { toast } from 'react-hot-toast';
import axios from 'config/axios.config';

interface TableProps {
  data: any[];
  buttonClick?: () => void;
  onTimesheetStatusChange?: (timesheetId: string, status: string) => void;
  loadingTimeSheet?: boolean;
  showControls?: boolean;
  onAddHours?: (userId: string) => void; // New prop for handling add hours modal
}

const TimesheetTable = ({
  data = [],
  buttonClick,
  onTimesheetStatusChange,
  loadingTimeSheet,
  showControls = true, // Default to showing controls
  onAddHours,
}: TableProps) => {
  const [loading, setLoading] = useState<Record<string, boolean | string>>({});

  // Function to get initials from name
  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase();
  };

  // Handle timesheet approval
  const handleApprove = async (row: any) => {
    // Get the timesheet ID from the row
    const timesheetId = row.timesheetId;

    if (!timesheetId) {
      toast.error('No timesheet ID found for this entry');
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, [timesheetId]: 'approving' }));

      // Send the timesheet ID in the request body
      const response = await axios.put(`/timesheets/approve/${timesheetId}`, {
        id: timesheetId,
      });

      setLoading((prev) => ({ ...prev, [timesheetId]: false }));
      toast.success('Timesheet approved successfully');

      // Notify parent component that status has changed
      if (onTimesheetStatusChange) {
        onTimesheetStatusChange(timesheetId, 'APPROVED');
      }
    } catch (error) {
      console.error('Error approving timesheet:', error);
      toast.error('Failed to approve timesheet');
      setLoading((prev) => ({ ...prev, [timesheetId]: false }));
    }
  };

  // Handle timesheet rejection
  const handleReject = async (row: any) => {
    // Get the timesheet ID from the row
    const timesheetId = row.timesheetId;

    if (!timesheetId) {
      toast.error('No timesheet ID found for this entry');
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, [timesheetId]: 'rejecting' }));

      // Send the timesheet ID in the request body
      const response = await axios.put(`/timesheets/reject/${timesheetId}`, {
        id: timesheetId,
      });

      setLoading((prev) => ({ ...prev, [timesheetId]: false }));
      toast.success('Timesheet rejected successfully');

      // Notify parent component that status has changed
      if (onTimesheetStatusChange) {
        onTimesheetStatusChange(timesheetId, 'REJECTED');
      }
    } catch (error) {
      console.error('Error rejecting timesheet:', error);
      toast.error('Failed to reject timesheet');
      setLoading((prev) => ({ ...prev, [timesheetId]: false }));
    }
  };

  // Function to handle adding hours - now passes userId to parent component
  const handleAddHours = (e: React.MouseEvent, row: any) => {
    e.stopPropagation();

    // Check if we have a userId in the row
    const userId = row.userId || row.id;

    if (!userId) {
      toast.error('No user ID found for this entry');
      return;
    }

    // First call the parent component's buttonClick to open the modal
    if (buttonClick) {
      buttonClick();
    }

    // Then call the onAddHours function to pass the user ID
    if (onAddHours) {
      onAddHours(userId);
    } else {
      console.log('Add hours for user:', userId);
      // Fallback behavior if no handler is provided
    }
  };

  const columns = [
    {
      accessorKey: 'employee',
      header: 'Employee',
      cell: ({ row }: { row: { original: any } }) => {
        // For the total row, show bold text
        if (row.original.isTotal) {
          return (
            <div className="font-medium text-md">{row.original.employee}</div>
          );
        }

        return (
          <div className="flex items-center">
            {row.original.avatar ? (
              <img
                src={row.original.avatar}
                alt={row.original.employee}
                className="w-8 h-8 rounded-full mr-2"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 text-black flex items-center justify-center mr-2">
                {getInitials(row.original.employee)}
              </div>
            )}
            <div>{row.original.employee}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'totalHours',
      header: 'Total Hours',
      cell: ({ row }: { row: { original: any } }) => (
        <div className={row.original.isTotal ? 'font-medium text-lg' : ''}>
          {row.original.totalHours}
        </div>
      ),
    },
    {
      accessorKey: 'breakTime',
      header: 'Break',
      cell: ({ row }: { row: { original: any } }) => (
        <div className={row.original.isTotal ? 'font-medium text-lg' : ''}>
          {row.original.breakTime || '0 min'}
        </div>
      ),
    },
    {
      accessorKey: 'breakDown',
      header: 'Break down',
      cell: ({ row }: { row: { original: any } }) => {
        if (row.original.isTotal) {
          return null;
        }

        // Parse the breakdown data
        let timeRanges = [];

        // If we have timeRanges array, use it directly
        if (row.original.timeRanges && row.original.timeRanges.length > 0) {
          timeRanges = row.original.timeRanges;
        }
        // If we have a string with format "XX:XX - YY:YY", parse it
        else if (
          typeof row.original.breakDown === 'string' &&
          row.original.breakDown.includes('-')
        ) {
          const times = row.original.breakDown
            .split('-')
            .map((t: string) => t.trim());
          if (times.length === 2) {
            timeRanges = [{ from: times[0], to: times[1] }];
          }
        }

        // If we have time ranges to display
        if (timeRanges.length > 0) {
          return (
            <div className="flex flex-col">
              {timeRanges.map((range: any, idx: number) => (
                <div key={idx} className="flex gap-2 items-center mb-1">
                  <span className="text-sm text-gray-500 w-fit">From</span>
                  <span className="text-sm w-fit bg-[#F3FBFB] p-1">
                    {range.from}
                  </span>
                  <span className="text-sm text-gray-500 w-fit">to</span>
                  <span className="text-sm w-fit bg-[#F3FBFB] p-1">
                    {range.to}
                  </span>
                </div>
              ))}
              <button
                onClick={(e) => handleAddHours(e, row.original)}
                className="flex items-center mx-auto w-fit text-green-600 text-sm"
              >
                <CirclePlus size={16} className="mr-1" />
                Add hours
              </button>
            </div>
          );
        }

        // Default case for empty data
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-500 w-fit">From</span>
              <span className="text-sm w-fit bg-[#F3FBFB] p-1">00:00</span>
              <span className="text-sm text-gray-500 w-fit">to</span>
              <span className="text-sm w-fit bg-[#F3FBFB] p-1">00:00</span>
            </div>
            <button
              onClick={(e) => handleAddHours(e, row.original)}
              className="flex items-center mx-auto w-fit text-green-600 text-sm"
            >
              <CirclePlus size={16} className="mr-1" />
              Add hours
            </button>
          </div>
        );
      },
    },
    {
      accessorKey: 'regularHours',
      header: 'Regular Hrs',
      cell: ({ row }: { row: { original: any } }) => (
        <div className={row.original.isTotal ? 'font-medium text-lg' : ''}>
          {row.original.regularHours}
        </div>
      ),
    },
    {
      accessorKey: 'overTime',
      header: 'Overtime',
      cell: ({ row }: { row: { original: any } }) => (
        <div className={row.original.isTotal ? 'font-medium text-lg' : ''}>
          {row.original.overTime}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: any } }) => {
        if (row.original.isTotal) {
          return null;
        }

        // Define status styling with proper badges
        const getStatusConfig = (status: string) => {
          switch (status) {
            case 'Approved':
            case 'APPROVED':
              return {
                bg: '',
                text: 'text-green-700',
                border: '',
                label: 'Approved',
              };
            case 'Rejected':
            case 'REJECTED':
              return {
                bg: '',
                text: 'text-red-700',
                border: '',
                label: 'Rejected',
              };
            case 'Pending':
            case 'PENDING':
            default:
              return {
                bg: '',
                text: 'text-yellow-600',
                border: '',
                label: 'Pending',
              };
          }
        };

        const config = getStatusConfig(row.original.status);

        return (
          <div className="flex justify-center">
            <div
              className={`inline-flex items-center px-3 py-1  ${config.bg} ${config.text} ${config.border}`}
            >
              <span className="text-sm font-medium rounded-full">
                {config.label}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: any } }) => {
        // Don't show actions for the total row
        if (row.original.isTotal) {
          return null;
        }

        // Check if we have a timesheet ID
        if (!row.original.timesheetId) {
          return (
            <div className="flex justify-center">
              <span className="text-gray-400 text-sm">
                No actions available
              </span>
            </div>
          );
        }

        const isApproved =
          row.original.status === 'Approved' ||
          row.original.status === 'APPROVED';
        const isRejected =
          row.original.status === 'Rejected' ||
          row.original.status === 'REJECTED';
        const isProcessing =
          loading[row.original.timesheetId] === 'approving' ||
          loading[row.original.timesheetId] === 'rejecting';

        return (
          <div className="flex justify-center gap-2">
            <button
              className={`
                inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-colors border
                ${
                  isApproved || isProcessing
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                    : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
                }
              `}
              disabled={isApproved || isProcessing}
              onClick={(e) => {
                e.stopPropagation();
                handleApprove(row.original);
              }}
            >
              {loading[row.original.timesheetId] === 'approving'
                ? 'Processing...'
                : 'Approve'}
            </button>

            <button
              className={`
                inline-flex items-center rounded-full gap-1 px-3 py-1 text-sm font-medium transition-colors border
                ${
                  isRejected || isProcessing
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                    : 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
                }
              `}
              disabled={isRejected || isProcessing}
              onClick={(e) => {
                e.stopPropagation();
                handleReject(row.original);
              }}
            >
              {loading[row.original.timesheetId] === 'rejecting'
                ? 'Processing...'
                : 'Reject'}
            </button>
          </div>
        );
      },
    },
  ];

  // Add total row to the data
  const calculateTotals = () => {
    if (!data || data.length === 0) return [];

    // Calculate totals
    const totalHours = data.reduce((sum, row) => {
      const hours = parseFloat(row.totalHours) || 0;
      return sum + hours;
    }, 0);

    const totalRegularHours = data.reduce((sum, row) => {
      const hours = parseFloat(row.regularHours) || 0;
      return sum + hours;
    }, 0);

    const totalOverTime = data.reduce((sum, row) => {
      const hours = parseFloat(row.overTime) || 0;
      return sum + hours;
    }, 0);

    // Calculate total break time
    const totalBreakMinutes = data.reduce((sum, row) => {
      // Extract minutes from breakTime string (e.g., "30 min", "1h 30m", "2h")
      const breakTime = row.breakTime || '0 min';
      let minutes = 0;

      if (breakTime.includes('h') && breakTime.includes('m')) {
        // Format: "1h 30m"
        const hourMatch = breakTime.match(/(\d+)h/);
        const minuteMatch = breakTime.match(/(\d+)m/);
        minutes =
          (hourMatch ? parseInt(hourMatch[1]) * 60 : 0) +
          (minuteMatch ? parseInt(minuteMatch[1]) : 0);
      } else if (breakTime.includes('h')) {
        // Format: "2h"
        const hourMatch = breakTime.match(/(\d+)h/);
        minutes = hourMatch ? parseInt(hourMatch[1]) * 60 : 0;
      } else if (breakTime.includes('min')) {
        // Format: "30 min"
        const minuteMatch = breakTime.match(/(\d+) min/);
        minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
      }

      return sum + minutes;
    }, 0);

    // Format total break time for display
    const formatTotalBreakTime = (totalMinutes: number) => {
      if (totalMinutes === 0) return '0 min';
      if (totalMinutes < 60) return `${totalMinutes} min`;
      const hours = Math.floor(totalMinutes / 60);
      const remainingMinutes = totalMinutes % 60;
      if (remainingMinutes === 0) return `${hours}h`;
      return `${hours}h ${remainingMinutes}m`;
    };

    // Create a new array with the original data plus the total row
    return [
      ...data,
      {
        employee: 'Total',
        totalHours: `${totalHours} hrs`,
        breakTime: formatTotalBreakTime(totalBreakMinutes),
        regularHours: `${totalRegularHours} hrs`,
        overTime: `${totalOverTime} hrs`,
        isTotal: true, // Flag to identify this as the total row
      },
    ];
  };

  const dataWithTotals = calculateTotals();

  return (
    <div>
      {/* Search and action buttons - only show if showControls is true */}
      {showControls && buttonClick && (
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
      )}

      <DataGrid data={dataWithTotals} columns={columns} loading={false} />
    </div>
  );
};

export default TimesheetTable;
