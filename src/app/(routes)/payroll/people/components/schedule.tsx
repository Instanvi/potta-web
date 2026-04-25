'use client';
import React, { useState, useEffect } from 'react';
import { SchedulePayload } from '../utils/types';
import Button from '@potta/components/button';
import { toast } from 'react-hot-toast';
import { peopleApi } from '../utils/api';
import { DateInput } from '@potta/components/customDatePicker';
import { useValidation } from '../hooks/useValidation';
import { scheduleValidationSchema } from '../validations/scheduleValidation';

interface ScheduleProps {
  onChange?: (data: SchedulePayload) => void;
  initialData?: SchedulePayload | null;
  personId?: string;
  onComplete?: () => void;
  setValidateSchedule?: (validateFn: () => Promise<boolean>) => void;
}

// Pay schedule options
const PAY_SCHEDULE_OPTIONS = [
  'Weekly',
  'Biweekly',
  'Monthly',
  'Bimonthly',
  'Annually',
  'Quarterly',
  'Daily',
  'Hourly',
];

// Utility functions
const stringToDate = (dateString: string): Date | undefined => {
  if (!dateString) return undefined;
  try {
    return new Date(dateString);
  } catch (e) {
    console.error('Invalid date format:', dateString);
    return undefined;
  }
};

const dateToString = (date: Date | undefined): string => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
};

const calculateNextPayDate = (
  baseDate: Date,
  schedule: string,
  iteration: number = 0
): Date => {
  const nextDate = new Date(baseDate);

  switch (schedule) {
    case 'Weekly':
      nextDate.setDate(baseDate.getDate() + 7 * (iteration + 1));
      break;
    case 'Biweekly':
      nextDate.setDate(baseDate.getDate() + 14 * (iteration + 1));
      break;
    case 'Monthly':
      nextDate.setMonth(baseDate.getMonth() + (iteration + 1));
      break;
    case 'Bimonthly':
      const currentDay = baseDate.getDate();
      if (currentDay < 15) {
        nextDate.setDate(15);
      } else {
        nextDate.setMonth(baseDate.getMonth() + 1);
        nextDate.setDate(1);
      }
      if (iteration > 0) {
        const additionalMonths = Math.floor((iteration + 1) / 2);
        const additionalDays = (iteration + 1) % 2 === 0 ? 0 : 14;
        nextDate.setMonth(nextDate.getMonth() + additionalMonths);
        nextDate.setDate(nextDate.getDate() + additionalDays);
      }
      break;
    case 'Quarterly':
      nextDate.setMonth(baseDate.getMonth() + 3 * (iteration + 1));
      break;
    case 'Annually':
      nextDate.setFullYear(baseDate.getFullYear() + (iteration + 1));
      break;
    case 'Daily':
      nextDate.setDate(baseDate.getDate() + (iteration + 1));
      break;
    case 'Hourly':
      nextDate.setHours(baseDate.getHours() + 24 * (iteration + 1));
      break;
    default:
      nextDate.setMonth(baseDate.getMonth() + (iteration + 1));
  }

  return nextDate;
};

const getInitialPayDate = (startDate: string, schedule: string): string => {
  if (!startDate) return '';

  try {
    const employmentDate = new Date(startDate);
    const currentDate = new Date();

    if (employmentDate > currentDate) {
      return startDate;
    }

    let payDate = new Date(currentDate);

    switch (schedule) {
      case 'Weekly':
        payDate.setDate(
          currentDate.getDate() + ((8 - currentDate.getDay()) % 7 || 7)
        );
        break;
      case 'Biweekly':
        payDate.setDate(
          currentDate.getDate() + ((8 - currentDate.getDay()) % 7 || 7) + 7
        );
        break;
      case 'Monthly':
        payDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          1
        );
        break;
      case 'Bimonthly':
        if (currentDate.getDate() < 15) {
          payDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            15
          );
        } else {
          payDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            1
          );
        }
        break;
      case 'Quarterly':
        const currentQuarter = Math.floor(currentDate.getMonth() / 3);
        payDate = new Date(
          currentDate.getFullYear(),
          (currentQuarter + 1) * 3,
          1
        );
        break;
      case 'Annually':
        payDate = new Date(currentDate.getFullYear() + 1, 0, 1);
        break;
      case 'Daily':
        payDate.setDate(currentDate.getDate() + 1);
        break;
      case 'Hourly':
        payDate.setHours(currentDate.getHours() + 1);
        break;
      default:
        payDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          1
        );
    }

    return payDate.toISOString().split('T')[0];
  } catch (e) {
    console.error('Error calculating initial pay date:', e);
    return '';
  }
};

const generatePayPeriods = (firstPayDate: string, schedule: string) => {
  if (!firstPayDate) return [];

  let baseDate;
  try {
    baseDate = new Date(firstPayDate);
    if (isNaN(baseDate.getTime())) {
      baseDate = new Date();
    }
  } catch (e) {
    console.error('Error parsing first pay date:', e);
    baseDate = new Date();
  }

  const periods = [];
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  for (let i = 0; i < 3; i++) {
    let startDate: Date;
    let endDate: Date;
    let payDate: Date;

    if (i === 0) {
      payDate = new Date(baseDate);
      startDate = new Date(payDate);
      endDate = new Date(payDate);

      // Calculate period dates based on schedule
      switch (schedule) {
        case 'Weekly':
          startDate.setDate(payDate.getDate() - 7);
          endDate.setDate(payDate.getDate() - 1);
          break;
        case 'Biweekly':
          startDate.setDate(payDate.getDate() - 14);
          endDate.setDate(payDate.getDate() - 1);
          break;
        case 'Monthly':
          startDate.setMonth(payDate.getMonth() - 1);
          endDate.setDate(payDate.getDate() - 1);
          break;
        case 'Bimonthly':
          if (payDate.getDate() === 15) {
            startDate.setDate(1);
            endDate.setDate(14);
          } else {
            startDate.setMonth(startDate.getMonth() - 1);
            startDate.setDate(15);
            endDate.setDate(payDate.getDate() - 1);
          }
          break;
        default:
          startDate.setMonth(payDate.getMonth() - 1);
          endDate.setDate(payDate.getDate() - 1);
      }
    } else {
      const prevPayDate = periods[i - 1].payDateObj;
      payDate = calculateNextPayDate(prevPayDate, schedule);
      startDate = new Date(prevPayDate);
      endDate = new Date(payDate);
      endDate.setDate(payDate.getDate() - 1);
    }

    periods.push({
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      payDate: formatDate(payDate),
      payDateObj: payDate,
    });
  }

  return periods;
};

const Schedule: React.FC<ScheduleProps> = ({
  onChange,
  initialData,
  personId,
  onComplete,
  setValidateSchedule,
}) => {
  const [formData, setFormData] = useState({
    firstPayDate: initialData?.firstPayDate || '',
    endPayDate: initialData?.endPayDate || '',
    payCycleName: initialData?.payCycleName || '',
  });

  const [firstPayDate, setFirstPayDate] = useState<Date | undefined>(
    stringToDate(initialData?.firstPayDate || '')
  );
  const [endPayDate, setEndPayDate] = useState<Date | undefined>(
    stringToDate(initialData?.endPayDate || '')
  );
  const [personData, setPersonData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize validation hook
  const { validate, validateField, getFieldError, hasFieldError } =
    useValidation(scheduleValidationSchema);

  // Register validation function with parent
  useEffect(() => {
    if (setValidateSchedule) {
      setValidateSchedule(async () => {
        const scheduleData = {
          personId: personId || '',
          payScheduleId: '',
          payCycleName: formData.payCycleName || '',
          firstPayDate: formData.firstPayDate || '',
          endPayDate: formData.endPayDate || null,
          effectiveDate: new Date().toISOString().split('T')[0],
        };
        const isValid = await validate(scheduleData);
        return isValid;
      });
    }
  }, [setValidateSchedule, validate, formData, personId]);

  // Fetch person data when component mounts (only if personId exists - for edit mode)
  useEffect(() => {
    if (personId && personId !== '') {
      fetchPersonData();
    }
  }, [personId]);

  const fetchPersonData = async () => {
    if (!personId) return;

    setIsLoading(true);
    try {
      const data = await peopleApi.getPerson(personId);
      setPersonData(data);
      console.log('Fetched person data for schedule:', data);

      if (data) {
        let firstPayDateStr = '';
        let endPayDateStr = '';

        if (data.pay_schedule && data.pay_schedule.first_pay_date) {
          firstPayDateStr = data.pay_schedule.first_pay_date;
          endPayDateStr = data.pay_schedule.end_date || '';
        } else {
          firstPayDateStr = getInitialPayDate(
            data.start_date,
            data.compensation_schedule
          );
        }

        setFormData((prev) => ({
          ...prev,
          firstPayDate: firstPayDateStr,
          endPayDate: endPayDateStr,
          payCycleName: data.compensation_schedule || prev.payCycleName,
        }));

        setFirstPayDate(stringToDate(firstPayDateStr));
        setEndPayDate(stringToDate(endPayDateStr));
      }
    } catch (error) {
      console.error('Error fetching person data:', error);
      toast.error('Failed to load employee data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirstPayDateChange = (date: Date | undefined) => {
    const dateString = dateToString(date);
    setFirstPayDate(date);
    setFormData((prev) => ({ ...prev, firstPayDate: dateString }));
    setHasChanges(true);

    if (onChange) {
      onChange({
        personId: personId || '',
        payScheduleId: personData?.pay_schedule?.uuid || '',
        effectiveDate: dateString,
        firstPayDate: dateString,
        endPayDate: formData.endPayDate,
        payCycleName: formData.payCycleName,
      });
    }
  };

  const handleEndPayDateChange = (date: Date | undefined) => {
    const dateString = dateToString(date);
    setEndPayDate(date);
    setFormData((prev) => ({ ...prev, endPayDate: dateString }));
    setHasChanges(true);

    if (onChange) {
      onChange({
        personId: personId || '',
        payScheduleId: personData?.pay_schedule?.uuid || '',
        effectiveDate: formData.firstPayDate,
        firstPayDate: formData.firstPayDate,
        endPayDate: dateString,
        payCycleName: formData.payCycleName,
      });
    }
  };

  const handleProceed = async () => {
    if (!formData.firstPayDate) {
      toast.error('Please select a first pay date');
      return;
    }

    if (formData.endPayDate && hasChanges) {
      await handleSaveSchedule();
    } else {
      if (onComplete) {
        onComplete();
      }
    }
  };

  const handleSaveSchedule = async () => {
    if (!personId) {
      toast.error('Cannot save schedule: Employee ID is missing');
      return;
    }

    setIsLoading(true);
    try {
      toast.success('Pay schedule saved successfully');
      setHasChanges(false);

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error saving pay schedule:', error);
      toast.error('Failed to save pay schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const payPeriods = generatePayPeriods(
    formData.firstPayDate,
    personData?.compensation_schedule || formData.payCycleName
  );

  return (
    <div className="w-full pt-10 px-14">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <DateInput
                label="First Pay Date"
                placeholder="Select first pay date"
                name="firstPayDate"
                value={firstPayDate}
                onChange={handleFirstPayDateChange}
                required={true}
                yearRange={{ start: 2020, end: 2030 }}
              />
              <p className="text-xs text-gray-500 mt-2">
                The date when the employee will receive their next paycheck
              </p>
              {hasChanges && formData.firstPayDate && (
                <p className="text-xs text-blue-500 mt-1">
                  This date will automatically update when pay periods pass
                </p>
              )}
            </div>

            <div>
              <DateInput
                label="End Pay Date"
                placeholder="Select end pay date (optional)"
                name="endPayDate"
                value={endPayDate}
                onChange={handleEndPayDateChange}
                required={false}
                yearRange={{ start: 2020, end: 2030 }}
              />
              <p className="text-xs text-gray-500 mt-2">
                The date when the employee will receive their last paycheck
                (leave empty if ongoing)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pay Cycle Name
              </label>
              <div className="p-4 border border-gray-300 rounded-xs font-medium bg-gray-50 text-gray-700">
                {personData?.compensation_schedule || 'Not set'}
              </div>
            </div>

            <div className="pt-4">
              <Button
                text={isLoading ? 'Saving...' : 'Proceed'}
                type="button"
                onClick={handleProceed}
                disabled={isLoading}
                className="w-fit"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Upcoming Pay Periods
            </h3>
            {payPeriods.length > 0 ? (
              <div className="space-y-3">
                {payPeriods.map((period, index) => (
                  <div
                    key={index}
                    className={`p-4 border ${
                      index === 0
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          Pay Period
                        </h4>
                        <p className="text-sm text-gray-600">
                          {period.startDate} - {period.endDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <h4 className="font-medium text-gray-900">Pay Date</h4>
                        <p className="text-sm text-gray-600">
                          {period.payDate}
                        </p>
                        {index === 0 && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                            Next payment
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200">
                <p className="text-sm text-gray-600">
                  No pay periods available. Please set a valid first pay date
                  and compensation schedule.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
