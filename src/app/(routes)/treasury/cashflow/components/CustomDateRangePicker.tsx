'use client';
import React, { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@potta/components/shadcn/popover';
import { Calendar } from '@potta/components/shadcn/calendar';

interface CustomDateRangePickerProps {
  dateRange: { start: Date; end: Date };
  setDateRange: (range: { start: Date; end: Date }) => void;
}

const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({
  dateRange,
  setDateRange,
}) => {
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
    if (date?.from) {
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
    return 'Custom Range';
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
    <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
      <PopoverTrigger asChild>
        <button
          onClick={() => setIsPopoverOpen(true)}
          className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <CalendarIcon className="h-4 w-4 text-gray-500" />
          <span className="text-gray-700">{getCustomButtonText()}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-white border border-gray-200 transform transition-all duration-200 ease-in-out"
        align="start"
      >
        {/* Date range header */}
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <h3 className="font-medium text-center">{formatDateRange()}</h3>
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
              className="bg-[#005D1F] text-white px-4 py-2 text-sm rounded"
              onClick={applyDateRange}
            >
              Apply
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CustomDateRangePicker;
