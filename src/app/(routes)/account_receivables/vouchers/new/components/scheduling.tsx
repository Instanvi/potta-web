'use client';

import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Check, X, CalendarIcon, ChevronDown, AlertCircle } from 'lucide-react';
import { format, isAfter, isBefore, parse, isValid } from 'date-fns';
import { Calendar } from '@potta/components/shadcn/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@potta/components/shadcn/popover';
import { Button } from '@potta/components/shadcn/button';
import { cn } from '@potta/lib/utils';

interface SchedulingProps {
  // Add any props if needed
}

type DaySchedule = {
  day: string;
  startTime?: string;
  endTime?: string;
  allDay: boolean;
};

// Define the form structure for TypeScript
interface SchedulingFormValues {
  scheduling: {
    programStartDate?: string;
    programEndDate?: string;
    neverEnds?: boolean;
    specificDaysOnly?: boolean;
    validDays?: DaySchedule[];
  };
}

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

// Time format validation regex - matches formats like "09:00 AM", "9:00 PM", "12:30 AM"
const timeFormatRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$/;

const Scheduling: React.FC<SchedulingProps> = () => {
  // Properly type the form context
  const { 
    register, 
    watch, 
    setValue, 
    getValues, 
    unregister, 
    formState: { errors }, 
    setError, 
    clearErrors 
  } = useFormContext<SchedulingFormValues>();
  
  const programNeverEnds = watch('scheduling.neverEnds') || false;
  const validDuringSpecificDays = watch('scheduling.specificDaysOnly') || false;

  // Initialize selectedDays from form data or with default empty array
  const [selectedDays, setSelectedDays] = useState<DaySchedule[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [timeErrors, setTimeErrors] = useState<{[key: string]: string}>({});

  // Date state for date pickers
  const startDate = watch('scheduling.programStartDate') || undefined;
  const endDate = watch('scheduling.programEndDate') || undefined;

  // Initialize selectedDays from form data on component mount
  useEffect(() => {
    const formValidDays = getValues('scheduling.validDays') || [];
    if (formValidDays.length > 0) {
      setSelectedDays(formValidDays);
    }
  }, [getValues]);

  // Update form data whenever selectedDays changes
  useEffect(() => {
    setValue('scheduling.validDays', selectedDays);
  }, [selectedDays, setValue]);

  // Validate dates when they change
  useEffect(() => {
    validateDates();
  }, [startDate, endDate, programNeverEnds]);

  const validateDates = () => {
    // Clear previous errors
    clearErrors(['scheduling.programStartDate', 'scheduling.programEndDate']);
    
    // Validate start date exists
    if (!startDate) {
      setError('scheduling.programStartDate', {
        type: 'required',
        message: 'Program start date is required'
      });
      return false;
    }
    
    // Validate end date if program doesn't never end
    if (!programNeverEnds) {
      if (!endDate) {
        setError('scheduling.programEndDate', {
          type: 'required',
          message: 'Program end date is required when program has an end date'
        });
        return false;
      }
      
      // Validate end date is after start date
      if (startDate && endDate && !isAfter(new Date(endDate), new Date(startDate))) {
        setError('scheduling.programEndDate', {
          type: 'validate',
          message: 'End date must be after start date'
        });
        return false;
      }
    }
    
    return true;
  };

  const validateTimeFormat = (time: string): boolean => {
    return timeFormatRegex.test(time);
  };

  const validateTimeRange = (startTime: string, endTime: string): boolean => {
    if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
      return false;
    }
    
    try {
      const start = parse(startTime, 'h:mm a', new Date());
      const end = parse(endTime, 'h:mm a', new Date());
      
      return isValid(start) && isValid(end) && isAfter(end, start);
    } catch (error) {
      return false;
    }
  };

  const addDaySchedule = () => {
    if (
      !selectedDay ||
      selectedDays.some((schedule) => schedule.day === selectedDay)
    )
      return;

    const newSchedule = {
      day: selectedDay,
      startTime: '09:00 AM',
      endTime: '05:00 PM',
      allDay: false,
    };

    // Update local state
    setSelectedDays([...selectedDays, newSchedule]);

    // Update form data
    const currentValidDays = getValues('scheduling.validDays') || [];
    setValue('scheduling.validDays', [...currentValidDays, newSchedule]);

    setSelectedDay('');
  };

  const removeDaySchedule = (day: string) => {
    const updatedDays = selectedDays.filter((schedule) => schedule.day !== day);
    
    // Clear any errors for this day
    const newTimeErrors = {...timeErrors};
    delete newTimeErrors[`${day}-start`];
    delete newTimeErrors[`${day}-end`];
    delete newTimeErrors[`${day}-range`];
    setTimeErrors(newTimeErrors);

    // Update local state
    setSelectedDays(updatedDays);

    // Update form data
    setValue('scheduling.validDays', updatedDays);
  };

  const updateDaySchedule = (
    index: number,
    field: keyof DaySchedule,
    value: string | boolean
  ) => {
    const updatedSchedules = [...selectedDays];
    const schedule = updatedSchedules[index];
    updatedSchedules[index] = { ...schedule, [field]: value };
    
    // Validate time format if updating time fields
    const newTimeErrors = {...timeErrors};
    const dayKey = schedule.day;
    
    if (field === 'startTime') {
      if (!validateTimeFormat(value as string)) {
        newTimeErrors[`${dayKey}-start`] = 'Invalid time format (e.g. 09:00 AM)';
      } else {
        delete newTimeErrors[`${dayKey}-start`];
        
        // Check time range if both times are valid
        if (schedule.endTime && validateTimeFormat(schedule.endTime)) {
          if (!validateTimeRange(value as string, schedule.endTime)) {
            newTimeErrors[`${dayKey}-range`] = 'End time must be after start time';
          } else {
            delete newTimeErrors[`${dayKey}-range`];
          }
        }
      }
    }
    
    if (field === 'endTime') {
      if (!validateTimeFormat(value as string)) {
        newTimeErrors[`${dayKey}-end`] = 'Invalid time format (e.g. 05:00 PM)';
      } else {
        delete newTimeErrors[`${dayKey}-end`];
        
        // Check time range if both times are valid
        if (schedule.startTime && validateTimeFormat(schedule.startTime)) {
          if (!validateTimeRange(schedule.startTime, value as string)) {
            newTimeErrors[`${dayKey}-range`] = 'End time must be after start time';
          } else {
            delete newTimeErrors[`${dayKey}-range`];
          }
        }
      }
    }
    
    setTimeErrors(newTimeErrors);

    // Update local state
    setSelectedDays(updatedSchedules);

    // Update form data
    setValue('scheduling.validDays', updatedSchedules);
  };

  const toggleAllDay = (index: number) => {
    const updatedSchedules = [...selectedDays];
    const currentSchedule = updatedSchedules[index];
    const newAllDayValue = !currentSchedule.allDay;
    
    // Clear any time errors for this day
    const newTimeErrors = {...timeErrors};
    delete newTimeErrors[`${currentSchedule.day}-start`];
    delete newTimeErrors[`${currentSchedule.day}-end`];
    delete newTimeErrors[`${currentSchedule.day}-range`];
    setTimeErrors(newTimeErrors);

    if (newAllDayValue) {
      // If turning on "All Day", remove startTime and endTime
      const { day, allDay, ...rest } = currentSchedule;
      updatedSchedules[index] = { day, allDay: true };
    } else {
      // If turning off "All Day", add default startTime and endTime
      updatedSchedules[index] = {
        ...currentSchedule,
        allDay: false,
        startTime: '09:00 AM',
        endTime: '05:00 PM',
      };
    }

    // Update local state
    setSelectedDays(updatedSchedules);

    // Update form data
    setValue('scheduling.validDays', updatedSchedules);
  };

  // Handle toggle for program never ends
  const handleProgramNeverEndsToggle = () => {
    const newValue = !programNeverEnds;
    setValue('scheduling.neverEnds', newValue);

    // If program never ends is true, clear the end date
    if (newValue) {
      unregister('scheduling.programEndDate');
      clearErrors('scheduling.programEndDate');
    } else {
      // Validate dates again when turning off "never ends"
      validateDates();
    }
  };

  // Handle toggle for valid during specific days
  const handleValidDuringSpecificDaysToggle = () => {
    const newValue = !validDuringSpecificDays;
    setValue('scheduling.specificDaysOnly', newValue);

    // If specific days is false, clear the valid days
    if (!newValue) {
      setValue('scheduling.validDays', []);
      setSelectedDays([]);
      setTimeErrors({});
    }
  };

  // Helper function to safely check for nested errors
  const hasError = (path: string): boolean => {
    const parts = path.split('.');
    let current: any = errors;
    
    for (const part of parts) {
      if (!current || !current[part]) return false;
      current = current[part];
    }
    
    return true;
  };

  // Helper function to get error message
  const getErrorMessage = (path: string): string => {
    const parts = path.split('.');
    let current: any = errors;
    
    for (const part of parts) {
      if (!current || !current[part]) return '';
      current = current[part];
    }
    
    return current.message || '';
  };

  return (
    <div className="bg-white p-6">
      <h3 className="text-xl font-medium mb-8">Scheduling Settings</h3>

      <div className="space-y-8 w-3/5">
        {/* Program Start and End Date */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Program Starts Datetime <span className="text-red-500">*</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal border border-gray-300',
                    !startDate && 'text-gray-500',
                    hasError('scheduling.programStartDate') && 'border-red-500'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate
                    ? format(new Date(startDate), 'PPP')
                    : 'Select start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate ? new Date(startDate) : undefined}
                  onSelect={(date) =>
                    setValue(
                      'scheduling.programStartDate',
                      date ? date.toISOString() : ''
                    )
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {hasError('scheduling.programStartDate') && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {getErrorMessage('scheduling.programStartDate')}
              </p>
            )}
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program Ends Datetime {!programNeverEnds && <span className="text-red-500">*</span>}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal border border-gray-300',
                      !endDate && 'text-gray-500',
                      programNeverEnds && 'opacity-50 cursor-not-allowed',
                      hasError('scheduling.programEndDate') && 'border-red-500'
                    )}
                    disabled={programNeverEnds}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate && !programNeverEnds
                      ? format(new Date(endDate), 'PPP')
                      : programNeverEnds ? 'Never' : 'Select end date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate ? new Date(endDate) : undefined}
                    onSelect={(date) =>
                      setValue(
                        'scheduling.programEndDate',
                        date ? date.toISOString() : ''
                      )
                    }
                    initialFocus
                    disabled={programNeverEnds}
                  />
                </PopoverContent>
              </Popover>
              {hasError('scheduling.programEndDate') && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {getErrorMessage('scheduling.programEndDate')}
                </p>
              )}
            </div>
          </div>
            <div className="flex items-center ">
              <label className="mr-2 text-sm text-gray-700">
                Program Never ends
              </label>
              <div
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  programNeverEnds ? 'bg-green-500' : 'bg-gray-200'
                }`}
                onClick={handleProgramNeverEndsToggle}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    programNeverEnds ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </div>
              <input
                type="checkbox"
                {...register('scheduling.neverEnds')}
                className="hidden"
              />
            </div>
        </div>

        {/* Valid during specific days */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div
              className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer ${
                validDuringSpecificDays
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300'
              }`}
              onClick={handleValidDuringSpecificDaysToggle}
            >
              {validDuringSpecificDays && (
                <Check className="h-4 w-4 text-white" />
              )}
            </div>
            <input
              type="checkbox"
              {...register('scheduling.specificDaysOnly')}
              className="hidden"
            />
            <label
              className="ml-2 text-sm text-gray-700 cursor-pointer"
              onClick={handleValidDuringSpecificDaysToggle}
            >
              Valid during specific days
            </label>
          </div>

          {validDuringSpecificDays && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 w-1/2">
                {/* Custom select with centered icon */}
                <div className="relative flex-1 w-1/2">
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className={cn(
                      "w-full appearance-none border bg-white border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
                      hasError('scheduling.validDays') && selectedDays.length === 0 && "border-red-500"
                    )}
                  >
                    <option value="">select day</option>
                    {daysOfWeek
                      .filter(
                        (day) =>
                          !selectedDays.some((schedule) => schedule.day === day)
                      )
                      .map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addDaySchedule}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  disabled={!selectedDay}
                >
                  Add
                </button>
              </div>
              
              {hasError('scheduling.validDays') && selectedDays.length === 0 && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {getErrorMessage('scheduling.validDays')}
                </p>
              )}

              {selectedDays.length > 0 && (
                <div className="mt-4">
                  <div className="grid grid-cols-4 gap-4 py-2 border-b border-gray-200 font-medium">
                    <div>Day</div>
                    <div>Start Time</div>
                    <div>Ends</div>
                    <div>All Day</div>
                  </div>

                  {selectedDays.map((schedule, index) => (
                    <div
                      key={schedule.day}
                      className="grid grid-cols-4 gap-4 py-4 border-b border-gray-100 items-center"
                    >
                      <div>{schedule.day}</div>
                      <div>
                        {schedule.allDay ? (
                          <span className="text-gray-500">--</span>
                        ) : (
                          <div>
                            <input
                              type="text"
                              value={schedule.startTime || ''}
                              onChange={(e) =>
                                updateDaySchedule(
                                  index,
                                  'startTime',
                                  e.target.value
                                )
                              }
                              placeholder="e.g. 09:00 AM"
                              className={cn(
                                "w-full border border-gray-300 px-3 py-1 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500",
                                timeErrors[`${schedule.day}-start`] && "border-red-500"
                              )}
                            />
                            {timeErrors[`${schedule.day}-start`] && (
                              <p className="mt-1 text-xs text-red-500">
                                {timeErrors[`${schedule.day}-start`]}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        {schedule.allDay ? (
                          <span className="text-gray-500">--</span>
                        ) : (
                          <div>
                            <input
                              type="text"
                              value={schedule.endTime || ''}
                              onChange={(e) =>
                                updateDaySchedule(
                                  index,
                                  'endTime',
                                  e.target.value
                                )
                              }
                              placeholder="e.g. 05:00 PM"
                              className={cn(
                                "w-full border border-gray-300 px-3 py-1 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500",
                                timeErrors[`${schedule.day}-end`] && "border-red-500"
                              )}
                            />
                            {timeErrors[`${schedule.day}-end`] && (
                              <p className="mt-1 text-xs text-red-500">
                                {timeErrors[`${schedule.day}-end`]}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="mr-2 text-sm">All Day</span>
                          <div
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              schedule.allDay ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                            onClick={() => toggleAllDay(index)}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                schedule.allDay
                                  ? 'translate-x-6'
                                  : 'translate-x-1'
                              }`}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDaySchedule(schedule.day)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {Object.keys(timeErrors).some(key => key.endsWith('-range')) && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-md">
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        End time must be after start time
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scheduling;
