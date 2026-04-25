'use client';

import React, { useState, useMemo } from 'react';
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
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@potta/components/shadcn/popover';
import { Calendar } from '@potta/components/shadcn/calendar';
import SearchableSelect from '../../../../components/searchableSelect';

interface FPATabFilterProps {
  activeTab: 'time' | 'geography' | 'orgcharts';
  setActiveTab: (tab: 'time' | 'geography' | 'orgcharts') => void;
  // Time navigation props
  timeCycleTab: string;
  setTimeCycleTab: (tab: string) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  dateRange: { start: Date; end: Date };
  setDateRange: (range: { start: Date; end: Date }) => void;
  // Geography navigation props
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedVillage: string;
  setSelectedVillage: (village: string) => void;
  selectedTown: string;
  setSelectedTown: (town: string) => void;
  // Org charts navigation props
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (department: string) => void;
}

const FPATabFilter: React.FC<FPATabFilterProps> = ({
  activeTab,
  setActiveTab,
  timeCycleTab,
  setTimeCycleTab,
  selectedDate,
  setSelectedDate,
  dateRange,
  setDateRange,
  selectedRegion,
  setSelectedRegion,
  selectedVillage,
  setSelectedVillage,
  selectedTown,
  setSelectedTown,
  selectedLocation,
  setSelectedLocation,
  selectedDepartment,
  setSelectedDepartment,
}) => {
  const today = new Date();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>({
    from: dateRange.start,
    to: dateRange.end,
  });

  // Mock data for geography and org charts
  const regions = [
    'North Region',
    'South Region',
    'East Region',
    'West Region',
    'Central Region',
  ];
  const villages = [
    'Village A',
    'Village B',
    'Village C',
    'Village D',
    'Village E',
  ];
  const towns = ['Town A', 'Town B', 'Town C', 'Town D', 'Town E'];
  const locations = [
    'Head Office',
    'Branch A',
    'Branch B',
    'Branch C',
    'Remote Office',
  ];
  const departments = [
    'Finance',
    'HR',
    'IT',
    'Sales',
    'Marketing',
    'Operations',
  ];

  // Time navigation functions
  const navigateDate = (direction: 'prev' | 'next') => {
    let newDate;

    switch (timeCycleTab) {
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

    switch (timeCycleTab) {
      case 'Daily': {
        const start = subDays(now, 7);
        const end = addDays(now, 7);
        return eachDayOfInterval({ start, end }).map((date) => ({
          date,
          label: date.getDate().toString().padStart(2, '0'),
          isDisabled: isAfter(date, today),
        }));
      }
      case 'Weekly': {
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
        const start = subMonths(startOfMonth(now), 6);
        const end = addMonths(endOfMonth(now), 5);
        return eachMonthOfInterval({ start, end }).map((date) => ({
          date,
          label: format(date, 'MMM'),
          isDisabled: isAfter(date, today),
        }));
      }
      case 'Quarterly': {
        const start = startOfYear(now);
        const end = endOfYear(now);
        return eachQuarterOfInterval({ start, end }).map((date) => ({
          date,
          label: `Q${getQuarter(date)}`,
          isDisabled: isAfter(date, today),
        }));
      }
      case 'Yearly': {
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
  }, [timeCycleTab]);

  // Check if a date unit is selected
  const isSelected = (date: Date) => {
    switch (timeCycleTab) {
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
    switch (timeCycleTab) {
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

  // Handle date range change in the calendar
  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setTempDateRange(newDateRange);
  };

  // Apply the selected date range
  const applyDateRange = () => {
    if (tempDateRange?.from) {
      const newRange = {
        start: tempDateRange.from,
        end: tempDateRange.to || tempDateRange.from,
      };
      setDateRange(newRange);
      setIsPopoverOpen(false);
    }
  };

  // Get custom button text
  const getCustomButtonText = () => {
    if (timeCycleTab === 'Custom' && dateRange?.start) {
      if (!dateRange.end) return format(dateRange.start, 'MMM d, yyyy');
      if (
        dateRange.start.getFullYear() === dateRange.end.getFullYear() &&
        dateRange.start.getMonth() === dateRange.end.getMonth()
      ) {
        return `${format(dateRange.start, 'MMM d')} - ${format(
          dateRange.end,
          'd, yyyy'
        )}`;
      }
      return `${format(dateRange.start, 'MMM d')} - ${format(
        dateRange.end,
        'MMM d, yyyy'
      )}`;
    }
    return 'Custom';
  };

  return (
    <div className="space-y-6 h-fit  xl:items-center gap-10 flex xl:flex-row flex-col mb-8">
      {/* Main FP&A Tabs */}
      <div className="flex gap-10 w-fit whitespace-nowrap justify-between">
        <div className="bg-white h-max flex">
          {[
            { id: 'time', label: 'Time' },
            { id: 'geography', label: 'Geography' },
            { id: 'orgcharts', label: 'Org Charts' },
          ].map((tab) => (
            <div
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id as 'time' | 'geography' | 'orgcharts')
              }
              className={`px-6 py-4 cursor-pointer transition-all ${
                activeTab === tab.id
                  ? 'text-green-600 border-b-2 border-green-500 font-medium'
                  : 'text-gray-600'
              }`}
            >
              {tab.label}
            </div>
          ))}
        </div>
      </div>

      {/* Time Navigation */}
      {activeTab === 'time' && (
        <div className="w-full ">
          {/* Time Cycle Tabs */}
          <div className="flex gap-10 justify-between">
            <div className="bg-white flex">
              {[
                'Daily',
                'Weekly',
                'Monthly',
                'Quarterly',
                'Yearly',
                'Custom',
              ].map((tab) => {
                if (tab !== 'Custom') {
                  return (
                    <div
                      key={tab}
                      onClick={() => setTimeCycleTab(tab)}
                      className={`px-6 py-3 cursor-pointer transition-all ${
                        timeCycleTab === tab
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
                      open={isPopoverOpen}
                      onOpenChange={setIsPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <div
                          onClick={() => {
                            setTimeCycleTab(tab);
                            setIsPopoverOpen(true);
                          }}
                          className={`px-6 py-3 cursor-pointer transition-all flex items-center ${
                            timeCycleTab === tab
                              ? 'text-green-600 border-b-2 border-green-500 font-medium'
                              : 'text-gray-600'
                          }`}
                        >
                          {getCustomButtonText()}
                          {timeCycleTab === 'Custom' && (
                            <CalendarIcon className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 bg-white border border-gray-200"
                        align="start"
                      >
                        <div className="p-3 border-b border-gray-200 bg-gray-50">
                          <h3 className="font-medium text-center">
                            {tempDateRange?.from
                              ? `${format(
                                  tempDateRange.from,
                                  'MMM d'
                                )} - ${format(
                                  tempDateRange.to || tempDateRange.from,
                                  'MMM d, yyyy'
                                )}`
                              : 'Select Date Range'}
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
                              className="bg-[#005D1F] text-white px-4 py-2 text-sm"
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
              })}
            </div>

            {/* Date Units Selector */}
            {timeCycleTab !== 'Custom' && (
              <div className="flex justify-center">
                <div className="bg-white flex p-2 overflow-x-auto max-w-full">
                  {dateUnits.map((unit) => (
                    <div
                      key={unit.date.toISOString()}
                      onClick={() =>
                        !unit.isDisabled && setSelectedDate(unit.date)
                      }
                      className={`w-10 h-10 flex items-center  justify-center cursor-pointer transition-all mx-1 ${
                        isSelected(unit.date) 
                          ? timeCycleTab === 'Yearly'
                            ? 'bg-[#015c1f] text-white p-1 px-6 h-fit mt-1'
                            : 'bg-[#015c1f] text-white rounded-full'
                          : unit.isDisabled
                          ? 'text-gray-400 !cursor-not-allowed'
                          : timeCycleTab === 'Yearly'
                          ? 'text-gray-600 hover:bg-green-100'
                          : 'text-gray-600 hover:bg-green-100 '
                      }`}
                    >
                      {unit.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Current Period Display */}
          <div className="text-right text-sm text-gray-500">
            {formatCurrentPeriod()}
          </div>
        </div>
      )}

      {/* Geography Navigation */}
      {activeTab === 'geography' && (
        <div className="w-full pb-6">
          <div className="flex gap-6">
            {/* Regions */}
            <div className="flex-1">
              <SearchableSelect
                options={regions.map((region) => ({
                  value: region,
                  label: region,
                }))}
                selectedValue={selectedRegion}
                onChange={setSelectedRegion}
                placeholder="Select a region"
                label=""
                labelClass="text-sm font-medium text-gray-700"
              />
            </div>

            {/* Villages */}
            <div className="flex-1">
              <SearchableSelect
                options={villages.map((village) => ({
                  value: village,
                  label: village,
                }))}
                selectedValue={selectedVillage}
                onChange={setSelectedVillage}
                placeholder="Select a village"
                // label="Villages"
                labelClass="text-sm font-medium text-gray-700"
              />
            </div>

            {/* Towns */}
            <div className="flex-1">
              <SearchableSelect
                options={towns.map((town) => ({
                  value: town,
                  label: town,
                }))}
                selectedValue={selectedTown}
                onChange={setSelectedTown}
                placeholder="Select a town"
                // label="Towns"
                labelClass="text-sm font-medium text-gray-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* Org Charts Navigation */}
      {activeTab === 'orgcharts' && (
        <div className="w-full pb-6">
          <div className="flex gap-6">
            {/* Locations */}
            <div className="flex-1">
              <SearchableSelect
                options={locations.map((location) => ({
                  value: location,
                  label: location,
                }))}
                selectedValue={selectedLocation}
                onChange={setSelectedLocation}
                placeholder="Select a location"
                // label="Locations"
                labelClass="text-sm font-medium text-gray-700"
              />
            </div>

            {/* Departments */}
            <div className="flex-1">
              <SearchableSelect
                options={departments.map((department) => ({
                  value: department,
                  label: department,
                }))}
                selectedValue={selectedDepartment}
                onChange={setSelectedDepartment}
                placeholder="Select a department"
                // label="Departments"
                labelClass="text-sm font-medium text-gray-700"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FPATabFilter;
