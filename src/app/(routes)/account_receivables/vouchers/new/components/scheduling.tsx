'use client';

import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { X, AlertCircle } from 'lucide-react';
import { isAfter, parse, isValid } from 'date-fns';
import { DatePicker, parseDateValue } from '@potta/components/ui/date-picker';
import { cn } from '@potta/lib/utils';
import { FIELD_INPUT } from '@/lib/field-styles';
import Select from '@potta/components/select';
import Checkbox from '@potta/components/checkbox';
import { Switch } from '@potta/components/shadcn/switch';

interface SchedulingProps {
  showErrors?: boolean;
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

const Scheduling: React.FC<SchedulingProps> = ({ showErrors = false }) => {
  // Properly type the form context
  const {
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

  useEffect(() => {
    if (!showErrors) {
      clearErrors(['scheduling.programStartDate', 'scheduling.programEndDate']);
      return;
    }
    validateDates();
  }, [startDate, endDate, programNeverEnds, showErrors]);

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

  const dayOptions = [
    { label: 'Select a day', value: '' },
    ...daysOfWeek
      .filter((day) => !selectedDays.some((schedule) => schedule.day === day))
      .map((day) => ({ label: day, value: day })),
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <div className={showErrors && hasError('scheduling.programStartDate') ? 'error-field' : ''}>
          <DatePicker
            valueType="date"
            label="Program starts"
            required
            placeholder="Select start date"
            value={parseDateValue(startDate) ?? null}
            onChange={(date) =>
              setValue('scheduling.programStartDate', date ? date.toISOString() : '')
            }
            error={
              showErrors && hasError('scheduling.programStartDate')
                ? getErrorMessage('scheduling.programStartDate')
                : undefined
            }
          />
        </div>
        <div className={showErrors && hasError('scheduling.programEndDate') ? 'error-field' : ''}>
          <DatePicker
            valueType="date"
            label="Program ends"
            required={!programNeverEnds}
            disabled={programNeverEnds}
            placeholder={programNeverEnds ? 'Never' : 'Select end date'}
            min={parseDateValue(startDate) ?? null}
            value={programNeverEnds ? null : parseDateValue(endDate) ?? null}
            onChange={(date) =>
              setValue('scheduling.programEndDate', date ? date.toISOString() : '')
            }
            error={
              showErrors && hasError('scheduling.programEndDate')
                ? getErrorMessage('scheduling.programEndDate')
                : undefined
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-foreground">Program never ends</p>
        <Switch checked={programNeverEnds} onCheckedChange={handleProgramNeverEndsToggle} />
      </div>

      <Checkbox
        id="specific-days"
        label="Valid during specific days"
        checked={validDuringSpecificDays}
        onChange={handleValidDuringSpecificDaysToggle}
      />

      {validDuringSpecificDays ? (
        <div className="space-y-4">
          <div className="flex items-end gap-2 sm:max-w-md">
            <div className="min-w-0 flex-1">
              <Select
                label="Day"
                options={dayOptions}
                selectedValue={selectedDay}
                onChange={setSelectedDay}
                placeholder="Select a day"
              />
            </div>
            <button
              type="button"
              onClick={addDaySchedule}
              disabled={!selectedDay}
              className="inline-flex h-10 items-center rounded-[2px] bg-primary px-4 text-sm text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add
            </button>
          </div>

          {selectedDays.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="grid min-w-[36rem] grid-cols-[1.2fr_1fr_1fr_auto] gap-4 border-b border-black/[0.08] py-2 text-sm font-medium">
                <div>Day</div>
                <div>Start</div>
                <div>End</div>
                <div>All day</div>
              </div>
              {selectedDays.map((schedule, index) => (
                <div
                  key={schedule.day}
                  className="grid min-w-[36rem] grid-cols-[1.2fr_1fr_1fr_auto] items-center gap-4 border-b border-black/[0.06] py-3 text-sm"
                >
                  <div>{schedule.day}</div>
                  <div>
                    {schedule.allDay ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <div>
                        <input
                          type="text"
                          value={schedule.startTime || ''}
                          onChange={(e) => updateDaySchedule(index, 'startTime', e.target.value)}
                          placeholder="09:00 AM"
                          className={cn(
                            FIELD_INPUT,
                            timeErrors[`${schedule.day}-start`] && 'border-destructive',
                          )}
                        />
                        {timeErrors[`${schedule.day}-start`] ? (
                          <p className="mt-1 text-xs text-red-500">
                            {timeErrors[`${schedule.day}-start`]}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </div>
                  <div>
                    {schedule.allDay ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <div>
                        <input
                          type="text"
                          value={schedule.endTime || ''}
                          onChange={(e) => updateDaySchedule(index, 'endTime', e.target.value)}
                          placeholder="05:00 PM"
                          className={cn(
                            FIELD_INPUT,
                            timeErrors[`${schedule.day}-end`] && 'border-destructive',
                          )}
                        />
                        {timeErrors[`${schedule.day}-end`] ? (
                          <p className="mt-1 text-xs text-red-500">
                            {timeErrors[`${schedule.day}-end`]}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={schedule.allDay}
                      onCheckedChange={() => toggleAllDay(index)}
                      aria-label={`All day on ${schedule.day}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeDaySchedule(schedule.day)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={`Remove ${schedule.day}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {Object.keys(timeErrors).some((key) => key.endsWith('-range')) ? (
                <p className="mt-2 flex items-center text-sm text-red-500">
                  <AlertCircle className="mr-1 size-4" />
                  End time must be after start time
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default Scheduling;
