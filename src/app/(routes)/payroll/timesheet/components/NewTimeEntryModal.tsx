'use client';
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi, timesheetApi } from '../../utils/api';
import { toast } from 'react-hot-toast';
import Button from '@potta/components/button';
import Input from '@potta/components/input';
import { format } from 'date-fns';
import { X, Save, Clock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import SearchableSelect, { Option } from '@potta/components/searchableSelect';
import * as yup from 'yup';
import { DateInput } from '@potta/components/customDatePicker';
import { TimeInput } from '@potta/components/timeInput';

interface NewTimeEntryModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

// Validation schema
const timeEntrySchema = yup.object().shape({
  employeeId: yup.string().required('Employee selection is required'),
  date: yup
    .date()
    .required('Date is required')
    .typeError('Please enter a valid date'),
  check_in_time: yup.string().required('Check-in time is required'),
  check_out_time: yup.string().required('Check-out time is required'),
  break_minutes: yup
    .number()
    .min(0, 'Break minutes cannot be negative')
    .max(480, 'Break minutes cannot exceed 8 hours')
    .required('Break minutes is required'),
});

const NewTimeEntryModal: React.FC<NewTimeEntryModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  // State for modal visibility to handle animations
  const [isVisible, setIsVisible] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [newTimeEntry, setNewTimeEntry] = useState({
    employeeId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    check_in_time: '09:00',
    check_out_time: '17:00',
    break_minutes: 30,
  });

  // Convert string date to Date object for the DateInput
  const getDateValue = (): Date | undefined => {
    try {
      if (newTimeEntry.date) {
        return new Date(newTimeEntry.date);
      }
      return undefined;
    } catch (error) {
      console.error('Invalid date format:', error);
      return undefined;
    }
  };

  // Handle date change from DateInput
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      // Format date as YYYY-MM-DD
      const formattedDate = format(date, 'yyyy-MM-dd');
      handleTimeEntryChange('date', formattedDate);
    }
  };

  // Handle time change from TimeInput
  const handleTimeChange = (field: string, time: string) => {
    handleTimeEntryChange(field, time);
  };

  // Fetch employees
  const { data: employeesResponse, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      try {
        const response = await employeeApi.filterEmployees({
          limit: 100,
          sortBy: ['firstName:ASC'],
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching employees:', error);
        return { data: [] };
      }
    },
  });

  // Create employee options for dropdown
  const employeeOptions = React.useMemo(() => {
    if (!employeesResponse?.data) return [];

    return employeesResponse.data.map((employee) => ({
      value: employee.uuid,
      label: `${employee.firstName || ''} ${employee.lastName || ''}`,
    }));
  }, [employeesResponse]);

  // Create timesheet mutation
  const createTimesheetMutation = useMutation({
    mutationFn: async (data) => {
      return await timesheetApi.createTimesheet(data);
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries(['timesheets']);

      // Handle success with animation
      toast.success('Time entry created successfully');
      setIsVisible(false);
      setTimeout(() => {
        onSuccess();
      }, 300);
    },
    onError: (error) => {
      console.error('Error creating timesheet:', error);
      toast.error('Failed to create time entry');
    },
  });

  // Handle smooth closing
  const handleClose = () => {
    setIsVisible(false);
    // Delay actual closing to allow animation to complete
    setTimeout(() => {
      onClose();
    }, 300); // Match this with the exit animation duration
  };

  // Handle time entry form changes
  const handleTimeEntryChange = (field, value) => {
    setNewTimeEntry((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form using yup
  const validateForm = async () => {
    try {
      await timeEntrySchema.validate(newTimeEntry, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      const validationErrors: Record<string, string> = {};
      error.inner.forEach((err) => {
        if (err.path) {
          validationErrors[err.path] = err.message;
        }
      });
      setErrors(validationErrors);
      return false;
    }
  };

  // Additional time validation
  const validateTimes = () => {
    const checkIn = new Date(
      `${newTimeEntry.date}T${newTimeEntry.check_in_time}`
    );
    const checkOut = new Date(
      `${newTimeEntry.date}T${newTimeEntry.check_out_time}`
    );

    if (checkOut <= checkIn) {
      setErrors((prev) => ({
        ...prev,
        check_out_time: 'Check-out time must be after check-in time',
      }));
      return false;
    }

    return true;
  };

  // Create a new time entry
  const createTimeEntry = async () => {
    // Validate form
    const isFormValid = await validateForm();
    const areTimesValid = validateTimes();

    if (!isFormValid || !areTimesValid) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      // Format the payload according to the requirements
      const payload = {
        employeeId: newTimeEntry.employeeId,
        date: newTimeEntry.date,
        check_in_time: `${newTimeEntry.date}T${newTimeEntry.check_in_time}:00Z`,
        check_out_time: `${newTimeEntry.date}T${newTimeEntry.check_out_time}:00Z`,
        break_minutes: parseInt(newTimeEntry.break_minutes),
      };

      createTimesheetMutation.mutate(payload);
    } catch (error) {
      console.error('Error creating time entry:', error);
      toast.error('Failed to create time entry');
    }
  };

  // Handle escape key press to close modal
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && !createTimesheetMutation.isLoading) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [createTimesheetMutation.isLoading]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white h-full w-full max-w-md shadow-xl overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              duration: 0.3,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-medium">New Time Entry</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                disabled={createTimesheetMutation.isLoading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form content */}
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <SearchableSelect
                    label="Employee"
                    required
                    options={employeeOptions}
                    selectedValue={newTimeEntry.employeeId}
                    onChange={(value) =>
                      handleTimeEntryChange('employeeId', value)
                    }
                    placeholder={
                      isLoadingEmployees
                        ? 'Loading employees...'
                        : 'Select employee'
                    }
                    isDisabled={
                      isLoadingEmployees || createTimesheetMutation.isLoading
                    }
                  />
                  {errors.employeeId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.employeeId}
                    </p>
                  )}
                </div>

                <div>
                  <DateInput
                    label="Date"
                    placeholder="Select date"
                    name="date"
                    value={getDateValue()}
                    onChange={handleDateChange}
                    required
                    disabled={createTimesheetMutation.isLoading}
                    errors={errors.date}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <TimeInput
                      label="Check In"
                      placeholder="Select check-in time"
                      name="check_in_time"
                      value={newTimeEntry.check_in_time}
                      onChange={(time) =>
                        handleTimeChange('check_in_time', time)
                      }
                      required
                      disabled={createTimesheetMutation.isLoading}
                      errors={errors.check_in_time}
                      format="12"
                    />
                  </div>

                  <div>
                    <TimeInput
                      label="Check Out"
                      placeholder="Select check-out time"
                      name="check_out_time"
                      value={newTimeEntry.check_out_time}
                      onChange={(time) =>
                        handleTimeChange('check_out_time', time)
                      }
                      required
                      disabled={createTimesheetMutation.isLoading}
                      errors={errors.check_out_time}
                      format="12"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Break (minutes) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={newTimeEntry.break_minutes.toString()}
                    onchange={(e) =>
                      handleTimeEntryChange(
                        'break_minutes',
                        parseInt(e.target.value) || 0
                      )
                    }
                    disabled={createTimesheetMutation.isLoading}
                    required
                  />
                  {errors.break_minutes && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.break_minutes}
                    </p>
                  )}
                </div>

                {/* Optional notes field */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Notes
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={4}
                    placeholder="Add any additional notes about this time entry"
                    disabled={createTimesheetMutation.isLoading}
                  ></textarea>
                </div>
              </div>

              {/* Action buttons - fixed at bottom */}
              <div className="mt-8 pt-4 border-t sticky bottom-0 bg-white">
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    text={
                      createTimesheetMutation.isLoading
                        ? 'Creating...'
                        : 'Create Entry'
                    }
                    onClick={createTimeEntry}
                    disabled={createTimesheetMutation.isLoading}
                    icon={<Save className="h-4 w-4" />}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewTimeEntryModal;
