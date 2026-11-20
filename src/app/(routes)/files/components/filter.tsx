'use client';
import React, { useState } from 'react';
import SearchableSelect from '@potta/components/searchableSelect';
import Button from '@potta/components/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@potta/components/shadcn/popover';
import { Calendar } from '@potta/components/shadcn/calendar';

interface FilterProps {
  groupBy: string;
  onGroupByChange: (value: string) => void;
  viewType: 'grid' | 'list';
  onViewTypeChange: (type: 'grid' | 'list') => void;
  onNewFolderClick: () => void;
  onDateRangeChange?: (range: {
    start: Date | null;
    end: Date | null;
    period: string;
  }) => void;
  currentFolderName?: string;
  onBack?: () => void;
}

const groupByOptions = [
  { label: 'All Time', value: 'All Time' },
  { label: 'Yesterday', value: 'Yesterday' },
  { label: 'Images', value: 'images' },
  { label: 'PDFs', value: 'pdfs' },
  { label: 'Videos', value: 'videos' },
];

const periods = ['Custom'];

const Filter: React.FC<FilterProps> = ({
  groupBy,
  onGroupByChange,
  viewType,
  onViewTypeChange,
  onNewFolderClick,
  onDateRangeChange,
  currentFolderName,
  onBack,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  // Format the date range for display
  const formatDateRange = () => {
    if (!date?.from) return '';
    if (!date?.to) return format(date.from, 'PPP');
    return `${format(date.from, 'PPP')} - ${format(date.to, 'PPP')}`;
  };

  // Display the selected date range on the Custom button when it's selected
  const getCustomButtonText = () => {
    if (selectedPeriod === 'Custom' && date?.from) {
      if (!date.to) return format(date.from, 'MMM d, yyyy');
      if (
        date.from.getFullYear() === date.to.getFullYear() &&
        date.from.getMonth() === date.to.getMonth()
      ) {
        return `${format(date.from, 'MMM d')} - ${format(date.to, 'd, yyyy')}`;
      }
      return `${format(date.from, 'MMM d')} - ${format(
        date.to,
        'MMM d, yyyy'
      )}`;
    }
    return 'Custom';
  };

  // Call onDateRangeChange when date or period changes
  React.useEffect(() => {
    if (onDateRangeChange) {
      onDateRangeChange({
        start: date?.from || null,
        end: date?.to || null,
        period: selectedPeriod,
      });
    }
    // eslint-disable-next-line
  }, [date, selectedPeriod]);

  return (
    <div className="w-full flex px-4 justify-between items-center">
      <div className="w-[50%] flex items-center space-x-4">
        {onBack ? (
          <button
            onClick={onBack}
            className="mr-2 text-gray-600 flex items-center"
          >
            <i className="ri-arrow-left-line text-xl mr-1"></i> Back
          </button>
        ) : null}
        <h2 className="text-3xl">{currentFolderName || 'All Files'}</h2>
      </div>
      <div className="flex w-[50%] justify-end items-center space-x-4 ">
        <Button text="New Folder" type="button" onClick={onNewFolderClick} />
        <div className="w-48">
          <SearchableSelect
            options={groupByOptions}
            selectedValue={groupBy}
            onChange={onGroupByChange}
            placeholder="Group By"
          />
        </div>
        <div className="flex border rounded overflow-hidden">
          <button
            className={`w-[47px] h-[47px] flex justify-center items-center ${
              viewType === 'list' ? 'bg-gray-200' : ''
            }`}
            onClick={() => onViewTypeChange('list')}
            aria-label="List view"
          >
            <i className="ri-align-justify"></i>
          </button>
          <button
            className={`w-[47px] h-[47px] flex justify-center items-center ${
              viewType === 'grid' ? 'bg-gray-200' : ''
            }`}
            onClick={() => onViewTypeChange('grid')}
            aria-label="Grid view"
          >
            <i className="ri-layout-grid-fill"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filter;
