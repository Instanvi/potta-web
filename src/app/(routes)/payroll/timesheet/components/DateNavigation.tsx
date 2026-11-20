import React, { useMemo, useState } from 'react';
import {
  format,
  addDays,
  subDays,
  addMonths,
  subMonths,
  addYears,
  subYears,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachQuarterOfInterval,
  eachYearOfInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isSameDay,
  isSameMonth,
  isSameQuarter,
  isSameYear,
  getWeek,
  getQuarter,
  isAfter,
} from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@potta/components/shadcn/popover';
import { Calendar } from '@potta/components/shadcn/calendar';

interface DateNavigationProps {
  cycleTab: string;
  setCycleTab: (tab: string) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  dateRange: { start: Date; end: Date };
  setDateRange: (range: { start: Date; end: Date }) => void;
  onDateRangeApply?: (range: { start: Date; end: Date }) => void;
}

const DateNavigation: React.FC<DateNavigationProps> = ({
  cycleTab,
  setCycleTab,
  selectedDate,
  setSelectedDate,
  dateRange,
  setDateRange,
  onDateRangeApply,
}) => {
  const today = new Date();
  // Convert the dateRange format to match DateRange from react-day-picker
  const [date, setDate] = useState<DateRange | undefined>({
    from: dateRange.start,
    to: dateRange.end,
  });

  // State to control popover visibility
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Temporary date range state (for preview before applying)
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>({
    from: dateRange.start,
    to: dateRange.end,
  });

  // Navigation between periods
  const navigateDate = (direction: 'prev' | 'next') => {
    let newDate;

    switch (cycleTab) {
      case 'Daily':
        newDate =
          direction === 'prev'
            ? subDays(selectedDate, 1)
            : addDays(selectedDate, 1);
        break;
      case 'Weekly':
        newDate =
          direction === 'prev'
            ? subDays(selectedDate, 7)
            : addDays(selectedDate, 7);
        break;
      case 'Monthly':
        newDate =
          direction === 'prev'
            ? subMonths(selectedDate, 1)
            : addMonths(selectedDate, 1);
        break;
      case 'Quarterly':
        newDate =
          direction === 'prev'
            ? subMonths(selectedDate, 3)
            : addMonths(selectedDate, 3);
        break;
      case 'Yearly':
        newDate =
          direction === 'prev'
            ? subYears(selectedDate, 1)
            : addYears(selectedDate, 1);
        break;
      default:
        newDate =
          direction === 'prev'
            ? subDays(selectedDate, 1)
            : addDays(selectedDate, 1);
    }

    setSelectedDate(newDate);
  };

  // Generate date units based on the current cycle
  const dateUnits = useMemo(() => {
    const now = new Date();

    switch (cycleTab) {
      case 'Daily': {
        // For daily view, show 15 days (7 before, today, 7 after)
        const start = subDays(now, 7);
        const end = addDays(now, 7);
        return eachDayOfInterval({ start, end }).map((date) => ({
          date,
          label: date.getDate().toString().padStart(2, '0'),
          isDisabled: isAfter(date, today),
        }));
      }

      case 'Weekly': {
        // Show 9 weeks
        const start = subDays(startOfWeek(now, { weekStartsOn: 1 }), 28);
        const end = addDays(endOfWeek(now, { weekStartsOn: 1 }), 28);
        return eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }).map(
          (date) => ({
            date,
            label: `W${getWeek(date, { weekStartsOn: 1 })}`,
            isDisabled: isAfter(date, today),
          })
        );
      }

      case 'Monthly': {
        // Show 12 months
        const start = subMonths(startOfMonth(now), 6);
        const end = addMonths(endOfMonth(now), 5);
        return eachMonthOfInterval({ start, end }).map((date) => ({
          date,
          label: format(date, 'MMM'),
          isDisabled: isAfter(date, today),
        }));
      }
      case 'Quarterly': {
        // Show 4 quarters (current year only)
        const start = startOfYear(now);
        const end = endOfYear(now);
        return eachQuarterOfInterval({ start, end }).map((date) => ({
          date,
          label: `Q${getQuarter(date)}`,
          isDisabled: isAfter(date, today),
        }));
      }

      case 'Yearly': {
        // Show 7 years
        const start = subYears(startOfYear(now), 3);
        const end = addYears(endOfYear(now), 3);
        return eachYearOfInterval({ start, end }).map((date) => ({
          date,
          label: format(date, 'yyyy'),
          isDisabled: isAfter(date, today),
        }));
      }

      default:
        return [];
    }
  }, [cycleTab]);

  // Check if a date unit is selected
  const isSelected = (date: Date) => {
    switch (cycleTab) {
      case 'Daily':
        return isSameDay(date, selectedDate);
      case 'Weekly':
        return isSameDay(
          startOfWeek(date, { weekStartsOn: 1 }),
          startOfWeek(selectedDate, { weekStartsOn: 1 })
        );
      case 'Monthly':
        return isSameMonth(date, selectedDate);
      case 'Quarterly':
        return (
          isSameQuarter(date, selectedDate) && isSameYear(date, selectedDate)
        );
      case 'Yearly':
        return isSameYear(date, selectedDate);
      default:
        return false;
    }
  };

  // Format the current period for display
  const formatCurrentPeriod = () => {
    switch (cycleTab) {
      case 'Daily':
        return format(selectedDate, 'MMMM d, yyyy');
      case 'Weekly':
        return `Week ${getWeek(selectedDate, { weekStartsOn: 1 })}, ${format(
          selectedDate,
          'yyyy'
        )}`;
      case 'Monthly':
        return format(selectedDate, 'MMMM yyyy');
      case 'Quarterly':
        return `Q${getQuarter(selectedDate)} ${format(selectedDate, 'yyyy')}`;
      case 'Yearly':
        return format(selectedDate, 'yyyy');
      case 'Custom':
        return `${format(dateRange.start, 'MMM d')} - ${format(
          dateRange.end,
          'MMM d, yyyy'
        )}`;
      default:
        return format(selectedDate, 'MMMM d, yyyy');
    }
  };

  // Format the date range for display
  const formatDateRange = () => {
    if (!tempDateRange?.from) return '';
    if (!tempDateRange?.to) return format(tempDateRange.from, 'PPP');
    return `${format(tempDateRange.from, 'PPP')} - ${format(
      tempDateRange.to,
      'PPP'
    )}`;
  };

  // Get custom button text
  const getCustomButtonText = () => {
    if (cycleTab === 'Custom' && date?.from) {
      // Show abbreviated date format on the button
      if (!date.to) return format(date.from, 'MMM d, yyyy');
      if (
        date.from.getFullYear() === date.to.getFullYear() &&
        date.from.getMonth() === date.to.getMonth()
      ) {
        // Same month and year
        return `${format(date.from, 'MMM d')} - ${format(date.to, 'd, yyyy')}`;
      }
      return `${format(date.from, 'MMM d')} - ${format(
        date.to,
        'MMM d, yyyy'
      )}`;
    }
    return 'Custom';
  };

  // Handle date range change in the calendar (preview only)
  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setTempDateRange(newDateRange);
  };

  // Apply the selected date range and close the popover
  const applyDateRange = () => {
    if (tempDateRange?.from) {
      // Update the actual date state
      setDate(tempDateRange);

      // Update the parent component's date range
      const newRange = {
        start: tempDateRange.from,
        end: tempDateRange.to || tempDateRange.from,
      };
      setDateRange(newRange);

      // Call the optional callback for filtering or other actions
      if (onDateRangeApply) {
        onDateRangeApply(newRange);
      }

      // Close the popover
      setIsPopoverOpen(false);
    }
  };

  // Handle popover open state change
  const handlePopoverOpenChange = (open: boolean) => {
    if (open) {
      // When opening, set the temporary date range to the current date range
      setTempDateRange({
        from: dateRange.start,
        to: dateRange.end,
      });
    }
    setIsPopoverOpen(open);
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Cycle tabs */}
      <div className="flex gap-10 justify-between">
        <div className="bg-[#F3FBFB]  flex">
          {['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly', 'Custom'].map(
            (tab) => {
              if (tab !== 'Custom') {
                return (
                  <div
                    key={tab}
                    onClick={() => setCycleTab(tab)}
                    className={`px-6 py-3 cursor-pointer transition-all ${
                      cycleTab === tab
                        ? 'text-green-600 border-b-2 border-green-500 font-medium'
                        : 'text-gray-600'
                    }`}
                  >
                    {tab}
                  </div>
                );
              } else {
                return (
                  <Popover
                    key={tab}
                    open={isPopoverOpen}
                    onOpenChange={handlePopoverOpenChange}
                  >
                    <PopoverTrigger asChild>
                      <div
                        onClick={() => {
                          setCycleTab(tab);
                          setIsPopoverOpen(true);
                        }}
                        className={`px-6 py-3 cursor-pointer transition-all flex items-center ${
                          cycleTab === tab
                            ? 'text-green-600 border-b-2 border-green-500 font-medium'
                            : 'text-gray-600'
                        }`}
                      >
                        {getCustomButtonText()}
                        {cycleTab === 'Custom' && (
                          <CalendarIcon className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-white border border-gray-200  "
                      align="start"
                    >
                      {/* Date range header */}
                      <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-medium text-center">
                          {formatDateRange()}
                        </h3>
                      </div>
                      <div className="p-3">
                        <Calendar
                          mode="range"
                          defaultMonth={tempDateRange?.from}
                          selected={tempDateRange}
                          onSelect={handleDateRangeChange}
                          numberOfMonths={2}
                          className="bg-white"
                        />
                        <div className="flex justify-end mt-4">
                          <button
                            className="bg-[#005D1F] text-white px-4 py-2  text-sm"
                            onClick={applyDateRange}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              }
            }
          )}
        </div>

        {/* Date units selector with square shape for Yearly */}
        {cycleTab !== 'Custom' && (
          <div className="flex justify-center">
            <div className="bg-[#F3FBFB]  flex p-2 overflow-x-auto max-w-full">
              {dateUnits.map((unit) => (
                <div
                  key={unit.date.toISOString()}
                  onClick={() => !unit.isDisabled && setSelectedDate(unit.date)}
                  className={`w-10 h-10 flex items-center justify-center cursor-pointer transition-all mx-1 ${
                    isSelected(unit.date)
                      ? cycleTab === 'Yearly'
                        ? 'bg-[#015c1f] text-white p-1 px-6 h-fit mt-1' // Square for Yearly
                        : 'bg-[#015c1f] text-white rounded-full' // Circle for others
                      : unit.isDisabled
                      ? 'text-gray-400 !cursor-not-allowed'
                      : cycleTab === 'Yearly'
                      ? 'text-gray-600 hover:bg-green-100 ' // Square hover for Yearly
                      : 'text-gray-600 hover:bg-green-100 rounded-full' // Circle hover for others
                  }`}
                >
                  {unit.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Additional context information */}
      {cycleTab === 'Daily' && (
        <div className="text-right text-sm text-gray-500">
          {format(selectedDate, 'EEEE, MMMM yyyy')}
        </div>
      )}
      {cycleTab === 'Weekly' && (
        <div className="text-right text-sm text-gray-500">
          {format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d')} -{' '}
          {format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}
        </div>
      )}
    </div>
  );
};

export default DateNavigation;
