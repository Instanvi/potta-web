'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import CurrencyInput from '@potta/components/currencyInput';
import Select from '@potta/components/select';
import { CompensationPayload, PaidTimeOffItem } from '../utils/types';
import { useFetchPTOs } from '../hooks/useFetchPTOs';
import { peopleApi } from '../utils/api';
import { toast } from 'react-hot-toast';
import Button from '@potta/components/button';
import SearchableSelect from '@potta/components/searchableSelect';
import { useValidation } from '../hooks/useValidation';
import { compensationValidationSchema } from '../validations/compensationValidation';

interface CompensationProps {
  onChange?: (data: CompensationPayload) => void;
  initialData?: CompensationPayload | null;
  personId?: string;
  onComplete?: () => void; // Add this new prop
  setValidateCompensation?: (validateFn: () => Promise<boolean>) => void;
}

// Payment frequency options
const paymentFrequencyOptions = [
  { label: 'Weekly', value: 'Weekly' },
  { label: 'Bi-Weekly', value: 'Bi-Weekly' },
  { label: 'Semi-Monthly', value: 'Semi-Monthly' },
  { label: 'Monthly', value: 'Monthly' },
];

// Removed unused default option

// Switch component
const Switch = ({
  checked,
  onChange,
  className,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <button
      type="button"
      className={className}
      onClick={() => onChange(!checked)}
    >
      {children}
    </button>
  );
};

const Compensation: React.FC<CompensationProps> = ({
  onChange,
  initialData,
  personId,
  onComplete,
  setValidateCompensation,
}) => {
  // Use a ref to track if this is the initial render
  const isInitialMount = useRef(true);

  const [formData, setFormData] = useState({
    hourlyRate: initialData?.hourlyRate || 0,
    salary: initialData?.salary || 0,
    paymentFrequency: initialData?.paymentFrequency || 'Monthly',
    eligibleForTips: initialData?.eligibleForTips || false,
    eligibleForOvertime: initialData?.eligibleForOvertime || false,
    paid_time_off: (initialData?.paid_time_off || []).map((item) =>
      typeof item === 'string' ? item : (item as any).id
    ),
  });

  // Add state for saving status
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch PTO options
  const { data: ptoOptions = [], isLoading: ptoLoading } = useFetchPTOs();

  // Selected PTO IDs for multiple selection
  const [selectedPTOIds, setSelectedPTOIds] = useState<string[]>([]);

  // Time tracking code
  const [trackingCode, setTrackingCode] = useState<string[]>([
    '0',
    '0',
    '0',
    '0',
    '0',
  ]);

  // Initialize validation hook
  const { validate, validateField, getFieldError, hasFieldError } =
    useValidation(compensationValidationSchema);

  // Register validation function with parent
  useEffect(() => {
    if (setValidateCompensation) {
      setValidateCompensation(() => async () => {
        const isValid = await validate(formData);
        return isValid;
      });
    }
  }, [setValidateCompensation, validate, formData]);

  // Log PTO options for debugging
  useEffect(() => {
    console.log('PTO Options:', ptoOptions);
  }, [ptoOptions]);

  // Update parent component when form data changes
  useEffect(() => {
    // Skip the first render to prevent unnecessary updates
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (onChange) {
      onChange(formData);
      setHasChanges(true);
    }
  }, [formData, onChange]);

  // Initialize selected PTOs from initialData
  useEffect(() => {
    if (initialData?.paid_time_off && initialData.paid_time_off.length > 0) {
      console.log('🔄 Initializing PTO selection:', initialData.paid_time_off);
      const ptoIds = initialData.paid_time_off.map((item) =>
        typeof item === 'string' ? item : (item as any).id
      );
      setSelectedPTOIds(ptoIds);
    }
  }, [initialData]);

  // Handle input changes for compensation schedule
  const handleScheduleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentFrequency: value,
    }));
  };

  // Handle currency input changes
  const handleHourlyRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Convert currency string to number
    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
    setFormData((prev) => ({
      ...prev,
      hourlyRate: isNaN(numericValue) ? 0 : numericValue,
    }));
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Convert currency string to number
    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
    setFormData((prev) => ({
      ...prev,
      salary: isNaN(numericValue) ? 0 : numericValue,
    }));
  };

  // Handle switch changes
  const handleSwitchChange = (
    field: 'eligibleForTips' | 'eligibleForOvertime',
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  // Handle PTO multiple selection
  const handlePTOChange = (selectedIds: string[]) => {
    console.log('🔄 PTO selection changed:', selectedIds);
    setSelectedPTOIds(selectedIds);

    // Update form data with selected PTO IDs
    setFormData((prev) => ({
      ...prev,
      paid_time_off: selectedIds,
    }));
  };

  // Generate random tracking code
  const generateTrackingCode = () => {
    const newCode = Array(5)
      .fill(0)
      .map(() => Math.floor(Math.random() * 10).toString());
    setTrackingCode(newCode);
  };

  // Save compensation data directly
  const saveCompensationData = async () => {
    if (!personId) {
      toast.error('Cannot save compensation: Employee ID is missing');
      return;
    }

    setIsSaving(true);
    try {
      // Make sure paid_time_off doesn't contain undefined values
      const validPtoIds = formData.paid_time_off.filter(
        (id) => id !== undefined && id !== null
      );

      // Format the payload for the API using the required structure
      const payload = {
        compensation_schedule: formData.paymentFrequency || undefined,
        base_pay: formData.salary || undefined,
        eligible_for_tips: formData.eligibleForTips || false,
        eligible_for_overtime: formData.eligibleForOvertime || false,
        paidTimeOff: validPtoIds.length > 0 ? validPtoIds : [],
        hourly_rate: formData.hourlyRate || undefined,
      };

      console.log('Sending compensation payload:', payload);

      // Call the API to update the employee
      await peopleApi.updatePerson(personId, payload);
      toast.success('Compensation data saved successfully');
      setHasChanges(false);
      // Call the onComplete callback to notify the parent component
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error saving compensation data:', error);
      toast.error('Failed to save compensation data');
    } finally {
      setIsSaving(false);
    }
  };

  // Convert PTO options for select component
  const ptoSelectOptions = useMemo(
    () =>
      ptoOptions.map((pto) => ({
        label: `${pto.type} (${pto.total_entitled_days} days)` || 'Unnamed PTO',
        value: pto.id,
      })),
    [ptoOptions]
  );
  return (
    <div className="w-full pt-5 px-6">
      <div className="w-full">
        <SearchableSelect
          options={paymentFrequencyOptions}
          selectedValue={formData.paymentFrequency}
          onChange={handleScheduleChange}
          label="Compensation Schedule"
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <CurrencyInput
          label="Hourly Rate"
          placeholder="950"
          value={formData.hourlyRate.toString()}
          onChange={handleHourlyRateChange}
          inputClass=""
        />
        <CurrencyInput
          label="Base Pay"
          placeholder="90,000"
          value={formData.salary.toString()}
          onChange={handleSalaryChange}
          inputClass=""
        />
      </div>

      <div className="my-7 flex space-x-10">
        <div className="flex items-center">
          <Switch
            checked={formData.eligibleForTips}
            onChange={(checked) =>
              handleSwitchChange('eligibleForTips', checked)
            }
            className={`${
              formData.eligibleForTips ? 'bg-green-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                formData.eligibleForTips ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <span className="ml-3 text-sm font-medium">Eligible for Tips</span>
        </div>

        <div className="flex items-center">
          <Switch
            checked={formData.eligibleForOvertime}
            onChange={(checked) =>
              handleSwitchChange('eligibleForOvertime', checked)
            }
            className={`${
              formData.eligibleForOvertime ? 'bg-green-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                formData.eligibleForOvertime ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <span className="ml-3 text-sm font-medium">
            Eligible for Overtime
          </span>
        </div>
      </div>

      <div className="my-5">
        <p className="text-xl font-medium">Paid Time off (PTO)</p>
        <div className="mt-5">
          {ptoLoading ? (
            <div>Loading PTO options...</div>
          ) : (
            <SearchableSelect
              options={ptoSelectOptions}
              selectedValue={selectedPTOIds}
              onChange={handlePTOChange}
              label="PTO Type"
              multiple={true}
              placeholder="Select PTO types..."
            />
          )}

          <p className="text-sm text-gray-500 mt-2">
            Select multiple PTO types to associate with this employee.
          </p>
        </div>
      </div>

      {/* Time Tracking Section - Commented Out */}
      {/* <div className="mt-7">
        <h4 className="text-xl mb-3 font-medium">Time Tracking</h4>
        <p>
          Setup a tracking code for this team member, so they can clock in and
          out from the potta mobile app. Their time cards submissions are
          visible from the admin panel
        </p>
        <div className="flex mt-3 gap-8 items-center">
          {trackingCode.map((digit, index) => (
            <p
              key={index}
              className="w-10 h-12 bg-gray-100 rounded-sm grid place-content-center"
            >
              {digit}
            </p>
          ))}
          <p
            className="text-green-500 cursor-pointer"
            onClick={generateTrackingCode}
          >
            Generate Code
          </p>
        </div>
      </div> */}

      {/* Add Save button when we have a personId and changes */}
      {personId && hasChanges && (
        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            text={isSaving ? 'Saving...' : 'Proceed'}
            onClick={saveCompensationData}
            disabled={isSaving}
            className="mb-2"
          />
        </div>
      )}
    </div>
  );
};

export default Compensation;
