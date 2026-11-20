'use client';
import React, { useState, useEffect } from 'react';
import Button from '@potta/components/button';
import Input from '@potta/components/input';
import SearchableSelect from '@potta/components/searchableSelect';
import { TimeInput } from '@potta/components/timeInput';
import { toast } from 'react-hot-toast';
import { X, Save, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { peopleApi } from '../../people/utils/api';
import axios from 'config/axios.config';
import CustomDatePicker from '@potta/components/customDatePicker';
import { CalendarDate } from '@internationalized/date';
import { shiftValidationSchema } from '../../utils/validations';
import { NewShiftModalProps, ShiftPayload } from '../../utils/types';

const NewShiftModal: React.FC<NewShiftModalProps> = ({
  onClose,
  onSuccess,
  roles = [],
  isLoadingRoles = false,
  selectedDate,
}) => {
  // State for modal visibility to handle animations
  const [isVisible, setIsVisible] = useState(true);

  // Form state
  const [shiftName, setShiftName] = useState('Morning Shift');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [breakMinutes, setBreakMinutes] = useState('30');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedShift, setSelectedShift] = useState('morning');
  const [startDate, setStartDate] = useState(
    selectedDate ? selectedDate.isoDate : new Date().toISOString().split('T')[0]
  );
  const [selectedColor, setSelectedColor] = useState('#34A853');
  const [recurrence, setRecurrence] = useState({
    sunday: false,
    monday: true,
    tuesday: false,
    wednesday: false,
    thursday: true,
    friday: false,
    saturday: false,
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<
    { value: string; label: string }[]
  >([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  // Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Available colors for UI display
  const colorOptions = [
    { value: '#34A853', label: 'Green', name: 'Morning' },
    { value: '#4CAF50', label: 'Material Green', name: 'Morning Alt' },
    { value: '#8BC34A', label: 'Light Green', name: 'Morning Light' },
    { value: '#009688', label: 'Teal', name: 'Teal' },
    { value: '#00BCD4', label: 'Cyan', name: 'Cyan' },
    { value: '#03A9F4', label: 'Light Blue', name: 'Afternoon' },
    { value: '#2196F3', label: 'Blue', name: 'Afternoon Alt' },
    { value: '#3F51B5', label: 'Indigo', name: 'Indigo' },
    { value: '#9C27B0', label: 'Purple', name: 'Night' },
    { value: '#E91E63', label: 'Pink', name: 'Pink' },
    { value: '#FF9800', label: 'Orange', name: 'Custom' },
    { value: '#FF5722', label: 'Red', name: 'Red' },
    { value: '#9E9E9E', label: 'Gray', name: 'Unavailable' },
  ];

  // Standard shifts
  const standardShifts = [
    { value: 'morning', label: 'Morning Shift' },
    { value: 'afternoon', label: 'Afternoon Shift' },
    { value: 'night', label: 'Night Shift' },
    { value: 'unavailable', label: 'Unavailable' },
    { value: 'custom', label: 'Custom Hours' },
  ];

  // Set default roles when roles prop changes
  useEffect(() => {
    if (roles && roles.length > 0) {
      // Select the first role by default
      const defaultRoles = [roles[0].value];
      setSelectedRoles(defaultRoles);
    }
  }, [roles]);

  // Set default recurrence based on selected date
  useEffect(() => {
    if (selectedDate && selectedDate.dayName) {
      const dayName = selectedDate.dayName;
      setRecurrence((prev) => ({
        ...prev,
        [dayName]: true,
      }));
    }
  }, [selectedDate]);

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch employees from API
  const fetchEmployees = async () => {
    setIsLoadingEmployees(true);
    try {
      const response = await peopleApi.filterPersons({
        page: 1,
        limit: 100,
        status: 'active',
      });
      if (response && response.data) {
        const employeeOptions = response.data.map((employee: any) => ({
          value: employee.id || employee._id || employee.uuid,
          label:
            `${employee.first_name || employee.firstName || ''} ${
              employee.last_name || employee.lastName || ''
            }`.trim() || 'Employee',
        }));
        setEmployees(employeeOptions);
        // If no employees were found, add a dummy employee for testing
        if (employeeOptions.length === 0) {
          setEmployees([
            {
              value: 'b89a5c1d-3cfb-4f7c-bf27-95a0c8dbca2e',
              label: 'John Doe',
            },
            { value: '2', label: 'Jane Smith' },
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
      // Add fallback employees for testing
      setEmployees([
        { value: 'b89a5c1d-3cfb-4f7c-bf27-95a0c8dbca2e', label: 'John Doe' },
        { value: '2', label: 'Jane Smith' },
      ]);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  // Handle smooth closing
  const handleClose = () => {
    setIsVisible(false);
    // Delay actual closing to allow animation to complete
    setTimeout(() => {
      onClose();
    }, 300); // Match this with the exit animation duration
  };

  // Handle standard shift selection
  const handleStandardShiftSelect = (shiftId: string) => {
    setSelectedShift(shiftId);
    // Set default times and colors based on selected shift
    if (shiftId === 'morning') {
      setStartTime('08:00');
      setEndTime('16:00');
      setShiftName('Morning Shift');
      setSelectedColor('#34A853');
    } else if (shiftId === 'afternoon') {
      setStartTime('14:00');
      setEndTime('22:00');
      setShiftName('Afternoon Shift');
      setSelectedColor('#03A9F4');
    } else if (shiftId === 'night') {
      setStartTime('22:00');
      setEndTime('06:00');
      setShiftName('Night Shift');
      setSelectedColor('#9C27B0');
    } else if (shiftId === 'unavailable') {
      setStartTime('00:00');
      setEndTime('00:00');
      setShiftName('Unavailable');
      setBreakMinutes('0');
      setSelectedColor('#9E9E9E');
    } else if (shiftId === 'custom') {
      setShiftName('Custom Shift');
      setSelectedColor('#FF9800');
    }
  };

  // Toggle recurrence day
  const toggleDay = (day: keyof typeof recurrence) => {
    setRecurrence((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  // Toggle role selection
  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  // Format time to match API format (ISO 8601 with timezone)
  const formatTimeForApi = (timeString: string, dateString: string) => {
    // Combine date and time into ISO format with Z for UTC timezone
    return `${dateString}T${timeString}:00Z`;
  };

  // Handle date change from CustomDatePicker
  const handleDateChange = (value: CalendarDate | null) => {
    if (value) {
      // Format date as YYYY-MM-DD
      const formattedDate = `${value.year}-${String(value.month).padStart(
        2,
        '0'
      )}-${String(value.day).padStart(2, '0')}`;

      setStartDate(formattedDate);
    }
  };

  // Parse string date to CalendarDate object for the DatePicker
  const getShiftDate = () => {
    try {
      if (startDate) {
        const [year, month, day] = startDate.split('-').map(Number);
        return new CalendarDate(year, month, day);
      }
      return null;
    } catch (error) {
      console.error('Invalid date format:', error);
      return null;
    }
  };

  // Validate form using Yup
  const validateForm = async () => {
    try {
      const formData = {
        name: shiftName,
        startTime,
        endTime,
        employeeId: selectedEmployee,
        startDate,
        breakMinutes: parseInt(breakMinutes),
        selectedRoles,
        recurrence,
        color: selectedColor,
        shiftType: selectedShift,
      };

      await shiftValidationSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (validationError: any) {
      const newErrors: Record<string, string> = {};
      if (validationError.inner) {
        validationError.inner.forEach((error: any) => {
          newErrors[error.path] = error.message;
        });
      }
      setErrors(newErrors);
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    try {
      setIsSubmitting(true);
      // Get the current date in YYYY-MM-DD format
      const currentDate = startDate;
      // Create shift object to match the API format
      const shiftData: ShiftPayload = {
        name: shiftName,
        start_time: formatTimeForApi(startTime, currentDate),
        end_time: formatTimeForApi(endTime, currentDate),
        employeeId: selectedEmployee,
        recurrence_pattern: recurrence,
        break_minutes: parseInt(breakMinutes),
        applies_to_roles: selectedRoles,
        color: selectedColor, // Include color in payload
      };
      // Log the payload
      console.log('Creating shift:', shiftData);
      // Call the API to create the shift
      try {
        await axios.post('/shifts', shiftData);
        toast.success('Shift added successfully!');
        setIsVisible(false);
        // Delay actual success callback to allow animation to complete
        setTimeout(() => {
          onSuccess();
        }, 300);
      } catch (apiError) {
        console.error('API error creating shift:', apiError);
        toast.error('Failed to add shift. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error creating shift:', error);
      toast.error('Failed to add shift');
      setIsSubmitting(false);
    }
  };

  // Handle escape key press to close modal
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isSubmitting]);

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
            className="bg-white w-full max-w-md h-screen overflow-y-auto shadow-lg"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              duration: 0.3,
            }}
            onClick={(e) => e.stopPropagation()} // Prevent clicks from closing the modal
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-medium">Add Shift</h2>
              <button
                onClick={handleClose}
                className="p-2"
                disabled={isSubmitting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Form content */}
            <div className="">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Select Employee - Not required for Unavailable shifts */}
                {selectedShift !== 'unavailable' && (
                  <div className="px-6 pt-2">
                    <SearchableSelect
                      label="Select Employee"
                      options={employees}
                      required
                      selectedValue={selectedEmployee}
                      onChange={(value) => setSelectedEmployee(value)}
                      placeholder={
                        isLoadingEmployees
                          ? 'Loading employees...'
                          : 'Select employee'
                      }
                      isDisabled={isLoadingEmployees || isSubmitting}
                      error={errors.employeeId}
                    />
                  </div>
                )}

                {/* Shift Name */}
                <div className="px-6 pt-2">
                  <Input
                    label="Shift Name"
                    type="text"
                    name="shiftName"
                    placeholder="Enter shift name"
                    value={shiftName}
                    onchange={(e) => setShiftName(e.target.value)}
                    required
                    disabled={isSubmitting}
                    errors={errors.name}
                  />
                </div>

                {/* Standard shifts */}
                <div className="px-6 pt-2">
                  <SearchableSelect
                    label="Shift Type"
                    options={standardShifts}
                    selectedValue={selectedShift}
                    onChange={(value) => handleStandardShiftSelect(value)}
                    placeholder="Select a shift type"
                    isDisabled={isSubmitting}
                    error={errors.shiftType}
                  />
                </div>

                {/* Date Selection - Using CustomDatePicker */}
                <div className="px-6 pt-2">
                  <CustomDatePicker
                    label="Shift Date"
                    placeholder="Select shift date"
                    value={getShiftDate()}
                    onChange={handleDateChange}
                    isRequired
                    errors={errors.startDate}
                  />
                </div>

                {/* Time Selection using TimeInput */}
                <div className="grid grid-cols-2 gap-4 px-6 pt-2">
                  <TimeInput
                    label="Start Time"
                    name="startTime"
                    placeholder="Select start time"
                    value={startTime}
                    onChange={(time) => setStartTime(time)}
                    required
                    disabled={isSubmitting || selectedShift === 'unavailable'}
                    errors={errors.startTime}
                    format="24"
                  />
                  <TimeInput
                    label="End Time"
                    name="endTime"
                    placeholder="Select end time"
                    value={endTime}
                    onChange={(time) => setEndTime(time)}
                    required
                    disabled={isSubmitting || selectedShift === 'unavailable'}
                    errors={errors.endTime}
                    format="24"
                  />
                </div>

                {/* Break Duration - Not needed for Unavailable shifts */}
                {selectedShift !== 'unavailable' && (
                  <div className="px-6 pt-2">
                    <Input
                      label="Break Duration (minutes)"
                      type="number"
                      name="break_minutes"
                      value={breakMinutes}
                      onchange={(e) => setBreakMinutes(e.target.value)}
                      min={0}
                      max={120}
                      required
                      disabled={isSubmitting}
                      errors={errors.breakMinutes}
                    />
                  </div>
                )}

                {/* Color Selection */}
                <div className="px-6 pt-2">
                  <label className="block text-sm font-medium mb-2">
                    Shift Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`relative w-12 h-12 rounded-lg transition-all ${
                          selectedColor === color.value
                            ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setSelectedColor(color.value)}
                        disabled={isSubmitting}
                        title={color.name}
                      >
                        {selectedColor === color.value && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {errors.color && (
                    <p className="mt-1 text-sm text-red-600">{errors.color}</p>
                  )}
                </div>

                {/* Repeat on Days */}
                <div className="px-6 pt-2">
                  <label className="block text-sm font-medium mb-2">
                    Repeat on Days
                  </label>
                  <div className="flex justify-between">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
                      const dayKey = [
                        'sunday',
                        'monday',
                        'tuesday',
                        'wednesday',
                        'thursday',
                        'friday',
                        'saturday',
                      ][index] as keyof typeof recurrence;
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(dayKey)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            recurrence[dayKey]
                              ? 'bg-[#005D1F] text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                          disabled={isSubmitting}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  {errors.recurrence && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.recurrence}
                    </p>
                  )}
                </div>

                {/* Applies To Roles */}
                <div className="px-6 pt-2">
                  <label className="block text-sm font-medium mb-2">
                    Applies To Roles
                  </label>
                  {isLoadingRoles ? (
                    <div className="text-sm text-gray-500">
                      Loading roles...
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {roles.length > 0 ? (
                        roles.map((role) => (
                          <button
                            key={role.value}
                            type="button"
                            onClick={() => toggleRole(role.value)}
                            className={`px-3 py-1 text-sm transition-colors ${
                              selectedRoles.includes(role.value)
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                            disabled={isSubmitting}
                          >
                            {role.label}
                          </button>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">
                          No roles available
                        </div>
                      )}
                    </div>
                  )}
                  {errors.selectedRoles && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.selectedRoles}
                    </p>
                  )}
                </div>

                {/* Action buttons - fixed at bottom */}
                <div className="pt-2 flex pb-2 justify-end sticky pr-3 bottom-0 bg-white w-full mt-8">
                  <Button
                    text={isSubmitting ? 'Adding...' : 'Add Shift'}
                    type="submit"
                    disabled={isSubmitting}
                    icon={<Plus className="h-4 w-4" />}
                  />
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewShiftModal;
