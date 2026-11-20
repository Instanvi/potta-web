'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Button from '@potta/components/button';
import Input from '@potta/components/input';
import Select from '@potta/components/select';
import Slider from '@potta/components/slideover';
import { toast } from 'react-hot-toast';
import { useCreatePTOPolicy } from '../hooks/useCreatePTOPolicy';
import CustomDatePicker from '@potta/components/customDatePicker';
import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date';

const SliderSchedule = () => {
  const [isSliderOpen, setIsSliderOpen] = useState(false);

  // Use a single formData object like BaseInfo does
  const [formData, setFormData] = useState({
    type: 'VACATION',
    cycleType: 'MONTHLY',
    accrualRate: '',
    totalEntitledDays: '',
    startDate: '',
    endDate: '',
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Use our custom hook for PTO policy creation
  const { createPTOPolicy, isSubmitting } = useCreatePTOPolicy();

  // Debug logging for form data changes
  useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);

  // Options for dropdown selects
  const typeOptions = [
    { label: 'Vacation', value: 'VACATION' },
    { label: 'Sick', value: 'SICK' },
    { label: 'Maternity', value: 'MATERNITY' },
    { label: 'Paternity', value: 'PATERNITY' },
    { label: 'Custom', value: 'CUSTOM' },
  ];

  const cycleTypeOptions = [
    { label: 'Daily', value: 'DAILY' },
    { label: 'Weekly', value: 'WEEKLY' },
    { label: 'Monthly', value: 'MONTHLY' },
    { label: 'Quarterly', value: 'QUARTERLY' },
    { label: 'Yearly', value: 'YEARLY' },
  ];

  // Direct input change handler for the Input component
  const handleInputChange = useCallback(
    (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => {
        const updated = { ...prev, [name]: value };
        return updated;
      });

      // Clear validation error when user starts typing
      if (validationErrors[name]) {
        setValidationErrors((prev) => ({ ...prev, [name]: '' }));
      }
    },
    [validationErrors]
  );

  // Handle select change
  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      return updated;
    });
  }, []);

  // Let's try a different approach for date handling
  const handleStartDateChange = useCallback(
    (value: CalendarDate | null) => {
      if (value) {
        // Format date as YYYY-MM-DD
        const formattedDate = `${value.year}-${String(value.month).padStart(
          2,
          '0'
        )}-${String(value.day).padStart(2, '0')}`;

        setFormData((prev) => {
          return { ...prev, startDate: formattedDate };
        });

        // Clear validation error
        if (validationErrors.startDate) {
          setValidationErrors((prev) => ({ ...prev, startDate: '' }));
        }
      }
    },
    [validationErrors]
  );

  const handleEndDateChange = useCallback(
    (value: CalendarDate | null) => {
      if (value) {
        // Format date as YYYY-MM-DD
        const formattedDate = `${value.year}-${String(value.month).padStart(
          2,
          '0'
        )}-${String(value.day).padStart(2, '0')}`;

        setFormData((prev) => {
          return { ...prev, endDate: formattedDate };
        });

        // Clear validation error
        if (validationErrors.endDate) {
          setValidationErrors((prev) => ({ ...prev, endDate: '' }));
        }
      }
    },
    [validationErrors]
  );

  // Parse string dates to CalendarDate objects for the DatePicker
  const getStartDate = useCallback(() => {
    try {
      if (formData.startDate) {
        const [year, month, day] = formData.startDate.split('-').map(Number);
        const calDate = new CalendarDate(year, month, day);
        return calDate;
      }
      return null;
    } catch (error) {
      console.error('Error creating CalendarDate from startDate:', error);
      return null;
    }
  }, [formData.startDate]);

  const getEndDate = useCallback(() => {
    try {
      if (formData.endDate) {
        const [year, month, day] = formData.endDate.split('-').map(Number);
        const calDate = new CalendarDate(year, month, day);
        return calDate;
      }
      return null;
    } catch (error) {
      console.error('Error creating CalendarDate from endDate:', error);
      return null;
    }
  }, [formData.endDate]);

  // Let's try a simpler approach - just use today's date as default
  const getTodayAsCalendarDate = useCallback(() => {
    const todayDate = today(getLocalTimeZone());
    return todayDate;
  }, []);

  // Validate form inputs
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Validate accrual rate
    if (!formData.accrualRate.trim()) {
      errors.accrualRate = 'Accrual rate is required';
    } else if (
      isNaN(parseFloat(formData.accrualRate)) ||
      parseFloat(formData.accrualRate) <= 0
    ) {
      errors.accrualRate = 'Accrual rate must be a positive number';
    }

    // Validate total entitled days
    if (!formData.totalEntitledDays.trim()) {
      errors.totalEntitledDays = 'Total entitled days is required';
    } else if (
      isNaN(parseInt(formData.totalEntitledDays)) ||
      parseInt(formData.totalEntitledDays) <= 0
    ) {
      errors.totalEntitledDays =
        'Total entitled days must be a positive number';
    }

    // Validate start date
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }

    // Validate end date
    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    } else if (
      formData.startDate &&
      formData.endDate &&
      formData.endDate <= formData.startDate
    ) {
      errors.endDate = 'End date must be after start date';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Reset form after submission
  const resetForm = () => {
    setFormData({
      type: 'VACATION',
      cycleType: 'MONTHLY',
      accrualRate: '',
      totalEntitledDays: '',
      startDate: '',
      endDate: '',
    });
    setValidationErrors({});
  };

  // Handle form submission
  const handleSubmit = async () => {
    console.log('Submitting form with data:', formData);

    if (validateForm()) {
      try {
        const result = await createPTOPolicy({
          type: formData.type,
          cycle_type: formData.cycleType,
          accrual_rate: parseFloat(formData.accrualRate),
          total_entitled_days: parseInt(formData.totalEntitledDays),
          start_date: formData.startDate,
          end_date: formData.endDate,
          status: 'ACTIVE',
        });

        if (result.success) {
          toast.success('PTO policy created successfully!');
          // Reset form and close slider on success
          resetForm();
          setIsSliderOpen(false);
        } else {
          toast.error('Failed to create PTO policy');
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        toast.error('An error occurred while creating the PTO policy');
      }
    } else {
      toast.error('Please fix the errors in the form');
    }
  };

  return (
    <Slider
      edit={false}
      title={'Add PTO Policy'}
      buttonText="New Schedules"
      isOpen={isSliderOpen}
      onOpenChange={setIsSliderOpen}
      button={
        <Button
          text={'New PTO Policy'}
          type={'button'}
          icon={<i className="ri-file-add-line"></i>}
          onClick={() => setIsSliderOpen(true)}
        />
      }
    >
      <div className="flex flex-col gap-5 w-full max-w-4xl">
        <div>
          <p className="mb-2 font-medium">PTO Type</p>
          <Select
            options={typeOptions}
            selectedValue={formData.type}
            onChange={(value) => handleSelectChange('type', value)}
            bg={''}
          />
        </div>

        <div>
          <p className="mb-2 font-medium">Cycle Type</p>
          <Select
            options={cycleTypeOptions}
            selectedValue={formData.cycleType}
            onChange={(value) => handleSelectChange('cycleType', value)}
            bg={''}
          />
        </div>

        <div>
          <p className="mb-2 font-medium">Accrual Rate</p>
          <Input
            name="accrualRate"
            type="text"
            placeholder="Enter accrual rate (e.g., 1.25)"
            value={formData.accrualRate}
            onchange={handleInputChange('accrualRate')}
            errors={
              validationErrors.accrualRate
                ? { message: validationErrors.accrualRate }
                : undefined
            }
          />
          <p className="mt-1 text-xs text-gray-500">
            Rate at which PTO is accrued per cycle
          </p>
        </div>

        <div>
          <p className="mb-2 font-medium">Total Entitled Days</p>
          <Input
            name="totalEntitledDays"
            type="text"
            placeholder="Enter total entitled days (e.g., 15)"
            value={formData.totalEntitledDays}
            onchange={handleInputChange('totalEntitledDays')}
            errors={
              validationErrors.totalEntitledDays
                ? { message: validationErrors.totalEntitledDays }
                : undefined
            }
          />
          <p className="mt-1 text-xs text-gray-500">
            Maximum number of days an employee can accrue
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <CustomDatePicker
              label="Start Date"
              placeholder="Select start date"
              value={getStartDate()}
              onChange={handleStartDateChange}
              isRequired={true}
            />
            {validationErrors.startDate && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.startDate}
              </p>
            )}
          </div>
          <div>
            <CustomDatePicker
              label="End Date"
              placeholder="Select end date"
              value={getEndDate()}
              onChange={handleEndDateChange}
              isRequired={true}
            />
            {validationErrors.endDate && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.endDate}
              </p>
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-2 bg-white border-t border-gray-200 flex justify-end space-x-3">
          <Button
            text={isSubmitting ? 'Adding...' : 'Add Policy'}
            type={'button'}
            icon={<i className="ri-file-add-line"></i>}
            onClick={handleSubmit}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </Slider>
  );
};

export default SliderSchedule;
