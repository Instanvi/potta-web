'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Switch } from '@headlessui/react';
import Input from '@potta/components/input';
import { PhoneInput } from '@potta/components/phoneInput';
import Select from '@potta/components/select';
import SearchableSelect from '@potta/components/searchableSelect';
import { CalendarDate } from '@internationalized/date';
import CustomDatePicker from '@potta/components/customDatePicker';
import axios from 'config/axios.config';
import { useValidation } from '../hooks/useValidation';
import { baseInfoValidationSchema } from '../validations/baseInfoValidation';
import { useOrgRoles } from '../hooks/useOrgRoles';

// Define enum for marital status
enum MaritalStatusEnum {
  SINGLE = 'Single',
  MARRIED = 'Married',
  DIVORCED = 'Divorced',
  WIDOWED = 'Widowed',
  SEPARATED = 'Separated',
  DOMESTIC_PARTNER = 'Domestic Partner',
  CIVIL_UNION = 'Civil Union',
  ENGAGED = 'Engaged',
  COMPLICATED = 'Complicated',
  OTHER = 'Other',
}

interface BaseInfoProps {
  onChange?: (data: any) => void;
  initialData?: any;
  showValidationErrors?: boolean;
}

// Define the PhoneMetadata interface to match what the PhoneInput component provides
interface PhoneMetadata {
  formattedValue: string;
  countryCode: string;
  rawInput: string;
}

// Define OrgRole interface
interface OrgRole {
  id: string;
  name: string;
  organizationId: string;
  branchId: string | null;
  permissions: any;
}

const BaseInfo: React.FC<BaseInfoProps> = ({
  onChange,
  initialData,
  showValidationErrors = false,
}) => {
  // Use a ref to track if we've initialized with initial data
  const initializedRef = useRef(false);

  // Initialize with default values to avoid uncontrolled to controlled warnings
  const [formData, setFormData] = useState({
    employmentType: 'Employee',
    jobTitle: '',
    roleName: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    birthday: '',
    maritalStatus: MaritalStatusEnum.SINGLE,
    gender: 'Male',
    nationalId: '',
    taxPayerNumber: '',
    employeeId: '',
    employmentDate: '',
  });

  // Initialize validation hook
  const {
    errors,
    validate,
    validateField,
    clearFieldError,
    getFieldError,
    hasFieldError,
  } = useValidation(baseInfoValidationSchema);

  // Track which fields have been touched by the user
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Track if the form has been submitted (to show all errors)
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Helper function to mark a field as touched
  const markFieldAsTouched = useCallback((fieldName: string) => {
    setTouchedFields((prev) => new Set(prev).add(fieldName));
  }, []);

  // Helper function to get error - show if touched OR if parent requested to show all errors
  const getFieldErrorIfTouched = useCallback(
    (fieldName: string) => {
      const error = getFieldError(fieldName);
      const isTouched = touchedFields.has(fieldName);

      // Show error if field is touched OR if parent requested to show all errors
      return isTouched || showValidationErrors ? error : undefined;
    },
    [touchedFields, getFieldError, showValidationErrors]
  );

  // Trigger validation when parent requests to show validation errors
  useEffect(() => {
    if (showValidationErrors) {
      // Run validation to populate errors in the validation hook
      validate(formData);
    }
  }, [showValidationErrors, validate, formData]);

  // Use the new org roles hook
  const { data: orgRoles, isLoading: isLoadingRoles } = useOrgRoles();

  // Create role options from org roles
  const roleOptions =
    orgRoles?.map((role: OrgRole) => ({
      label: role.name,
      value: role.name,
    })) || [];

  // Track phone metadata separately to maintain all parts of the phone number
  const [phoneMetadata, setPhoneMetadata] = useState<PhoneMetadata>({
    formattedValue: '',
    countryCode: '+237', // Default to Cameroon
    rawInput: '',
  });

  // Use a ref to get current formData for validation
  const formDataRef = useRef(formData);

  // Use a ref to track current initialization state
  const isInitializedRef = useRef(false);

  // Use a ref to prevent the onChange callback from causing re-renders
  const onChangeRef = useRef(onChange);

  // Use a ref to store the validation registration function
  const onValidationRegisterRef = useRef(onChange); // This ref is no longer needed

  // Update the refs whenever they change
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    isInitializedRef.current = false; // Reset initialization state
  }, []); // Empty dependency array - only reset once

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onValidationRegisterRef.current = onChange; // This useEffect is no longer needed
  }, [onChange]);

  // Create a stable validation wrapper that never gets replaced
  const stableValidationWrapper = useCallback(async () => {
    console.log('🔥 STABLE WRAPPER - Validation triggered');

    // Use ref to get current initialization state
    const currentIsInitialized = isInitializedRef.current;
    console.log('🔍 Current initialization state:', currentIsInitialized);

    // If not initialized, return immediately without running validation
    if (!currentIsInitialized) {
      console.log(
        '🚫 VALIDATION BLOCKED - Component not initialized, returning true'
      );
      return true; // Return true immediately, don't run validation
    }

    const currentFormData = formDataRef.current;

    // Mark all fields as touched when form is submitted
    const allFieldNames = Object.keys(currentFormData);
    setTouchedFields(new Set(allFieldNames));
    setIsSubmitted(true);

    // Run full validation with current formData
    const result = await validate(currentFormData);
    console.log('🔥 Validation result:', result);

    return result;
  }, [validate]); // Only depends on validate

  // Add this inside the useEffect that handles initialData
  useEffect(() => {
    if (initialData && !initializedRef.current) {
      console.log('BaseInfo received initialData:', initialData);
      console.log('Role Name from initialData:', initialData.roleName); // Add this line

      // Create a new object with default values for any missing fields
      const newFormData = {
        employmentType: initialData.employmentType || 'Employee',
        jobTitle: initialData.jobTitle || '',
        roleName: initialData.roleName || '',
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        phoneNumber: initialData.phoneNumber || '',
        email: initialData.email || '',
        birthday: initialData.birthday || '',
        maritalStatus: initialData.maritalStatus || MaritalStatusEnum.SINGLE,
        gender: initialData.gender || 'Male',
        nationalId: initialData.nationalId || '',
        taxPayerNumber: initialData.taxPayerNumber || '',
        employeeId: initialData.employeeId || '',
        employmentDate: initialData.employmentDate || '',
      };

      setFormData(newFormData);

      // Update phone metadata if phone number is available
      if (initialData.phoneNumber) {
        setPhoneMetadata({
          formattedValue: initialData.phoneNumber,
          countryCode: initialData.phoneNumber.substring(0, 4) || '+237',
          rawInput: initialData.phoneNumber,
        });
      }

      initializedRef.current = true;
    }
  }, [initialData]);
  // Direct input change handler for the Input component
  const handleInputChange = useCallback(
    (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // Mark field as touched on first interaction
      markFieldAsTouched(name);

      setFormData((prev) => {
        const updated = { ...prev, [name]: value };
        // Call onChange outside of setState to prevent re-renders
        setTimeout(() => {
          if (onChangeRef.current) onChangeRef.current(updated);
        }, 0);
        return updated;
      });
    },
    [markFieldAsTouched]
  );

  // Handle field blur for validation
  const handleFieldBlur = useCallback(
    (fieldName: string, value: any) => {
      markFieldAsTouched(fieldName);
      // TEMPORARY: Use disabled validation
      validateField(fieldName, value);
    },
    [markFieldAsTouched, validateField]
  );

  // Handle phone input change - updated to match the SliderCustomer implementation
  const handlePhoneChange = useCallback(
    (combinedValue: string, metadata: PhoneMetadata) => {
      // Mark field as touched on first interaction
      markFieldAsTouched('phoneNumber');

      // Store the complete metadata for future reference
      setPhoneMetadata(metadata);

      // Update the form data with the combined value
      setFormData((prev) => {
        const updated = { ...prev, phoneNumber: combinedValue };
        // Call onChange outside of setState to prevent re-renders
        setTimeout(() => {
          if (onChangeRef.current) onChangeRef.current(updated);
        }, 0);
        return updated;
      });

      // Validate phone number
      validateField('phoneNumber', combinedValue);
    },
    [markFieldAsTouched, validateField]
  );

  // Handle select change
  const handleSelectChange = useCallback(
    (name: string, value: string) => {
      // Mark field as touched on first interaction
      markFieldAsTouched(name);

      setFormData((prev) => {
        const updated = { ...prev, [name]: value };

        // If changing the role, update the jobTitle field as well
        if (name === 'roleName') {
          updated.jobTitle = value;
        }

        // Call onChange outside of setState to prevent re-renders
        setTimeout(() => {
          if (onChangeRef.current) onChangeRef.current(updated);
        }, 0);
        return updated;
      });

      // Validate the field
      validateField(name, value);
    },
    [markFieldAsTouched, validateField]
  );

  // Handle date change for birthday
  const handleBirthdayChange = useCallback(
    (value: CalendarDate | null) => {
      // Mark field as touched on first interaction
      markFieldAsTouched('birthday');

      if (value) {
        // Format date as YYYY-MM-DD
        const formattedDate = `${value.year}-${String(value.month).padStart(
          2,
          '0'
        )}-${String(value.day).padStart(2, '0')}`;

        setFormData((prev) => {
          const updated = { ...prev, birthday: formattedDate };
          // Call onChange outside of setState to prevent re-renders
          setTimeout(() => {
            if (onChangeRef.current) onChangeRef.current(updated);
          }, 0);
          return updated;
        });

        // Validate the birthday field
        validateField('birthday', formattedDate);
      }
    },
    [markFieldAsTouched, validateField]
  );

  // Handle date change for employment date
  const handleEmploymentDateChange = useCallback(
    (value: CalendarDate | null) => {
      // Mark field as touched on first interaction
      markFieldAsTouched('employmentDate');

      if (value) {
        // Format date as YYYY-MM-DD
        const formattedDate = `${value.year}-${String(value.month).padStart(
          2,
          '0'
        )}-${String(value.day).padStart(2, '0')}`;

        setFormData((prev) => {
          const updated = { ...prev, employmentDate: formattedDate };
          // Call onChange outside of setState to prevent re-renders
          setTimeout(() => {
            if (onChangeRef.current) onChangeRef.current(updated);
          }, 0);
          return updated;
        });

        // Validate the employment date field
        validateField('employmentDate', formattedDate);
      }
    },
    [markFieldAsTouched, validateField]
  );

  // Create marital status options from enum
  const maritalStatusOptions = Object.values(MaritalStatusEnum).map(
    (status) => ({
      label: status,
      value: status,
    })
  );

  // Create gender options
  const genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
    { label: 'Prefer not to say', value: 'Prefer not to say' },
  ];

  // Parse string dates to CalendarDate objects for the DatePicker
  const getBirthdayDate = useCallback(() => {
    try {
      if (formData.birthday) {
        const [year, month, day] = formData.birthday.split('-').map(Number);
        return new CalendarDate(year, month, day);
      }
      return null;
    } catch (error) {
      console.error('Invalid birthday date format:', error);
      return null;
    }
  }, [formData.birthday]);

  const getEmploymentDate = useCallback(() => {
    try {
      if (formData.employmentDate) {
        const [year, month, day] = formData.employmentDate
          .split('-')
          .map(Number);
        return new CalendarDate(year, month, day);
      }
      return null;
    } catch (error) {
      console.error('Invalid employment date format:', error);
      return null;
    }
  }, [formData.employmentDate]);

  // Enable validation after component is fully initialized
  useEffect(() => {
    if (initializedRef.current) {
      // Add a delay to ensure everything is fully loaded and settled
      const timer = setTimeout(() => {
        console.log(
          '🟢 Component fully ready - validation can be enabled when needed'
        );
        // Don't automatically enable validation - keep it user-interaction based
      }, 500); // Increased delay to ensure everything is settled

      return () => clearTimeout(timer);
    }
  }, [initializedRef.current]);

  // Mark component as fully initialized after all initial setup is complete
  useEffect(() => {
    if (isLoadingRoles === false && initializedRef.current) {
      const timer = setTimeout(() => {
        console.log('🟢 Component marked as fully initialized');
      }, 200); // Small delay to ensure everything is settled

      return () => clearTimeout(timer);
    }
  }, [isLoadingRoles, initializedRef.current]);

  return (
    <div className="w-full flex flex-col gap-4 pt-10 pb-5 px-14 ">
      <div>
        <SearchableSelect
          options={[
            { label: 'Contractor', value: 'Contractor' },
            { label: 'Employee', value: 'Employee' },
          ]}
          required
          label="Employment Type"
          selectedValue={formData.employmentType}
          onChange={(value: string) =>
            handleSelectChange('employmentType', value)
          }
          error={getFieldErrorIfTouched('employmentType')}
        />
      </div>
      <div className="">
        <SearchableSelect
          label="Job Title / Role"
          options={roleOptions}
          required
          selectedValue={formData.roleName}
          onChange={(value) => handleSelectChange('roleName', value)}
          placeholder={isLoadingRoles ? 'Loading roles...' : 'Select a role'}
          isDisabled={isLoadingRoles}
          error={getFieldErrorIfTouched('roleName')}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          type="text"
          placeholder="fname"
          name="firstName"
          label="First Name"
          required
          value={formData.firstName}
          onchange={handleInputChange('firstName')}
          errors={getFieldErrorIfTouched('firstName')}
        />
        <Input
          type="text"
          required
          name="lastName"
          placeholder="lname"
          label="Last Name"
          value={formData.lastName}
          onchange={handleInputChange('lastName')}
          errors={getFieldErrorIfTouched('lastName')}
        />
      </div>
      <div>
        <div className="grid grid-cols-2 gap-3">
          <PhoneInput
            label="Telephone Number"
            placeholder="Enter phone number"
            value={phoneMetadata.formattedValue} // Use the formatted value from metadata
            onChange={handlePhoneChange}
            whatsapp={false}
            required
            countryCode={phoneMetadata.countryCode} // Use the country code from metadata
            errors={getFieldErrorIfTouched('phoneNumber')}
          />

          <div>
            <Input
              type="text"
              name="email"
              required
              label="Email Address"
              placeholder="youemail@gmail.com"
              value={formData.email}
              onchange={handleInputChange('email')}
              errors={getFieldErrorIfTouched('email')}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 items-center">
        <CustomDatePicker
          label="Birth date"
          placeholder="Select birth date"
          value={getBirthdayDate()}
          onChange={handleBirthdayChange}
          isRequired
          errors={getFieldErrorIfTouched('birthday')}
        />
        <div>
          <SearchableSelect
            options={maritalStatusOptions}
            label="Marital Status"
            required
            selectedValue={formData.maritalStatus}
            onChange={(value: string) =>
              handleSelectChange('maritalStatus', value)
            }
            error={getFieldErrorIfTouched('maritalStatus')}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SearchableSelect
          options={genderOptions}
          label="Gender"
          required
          selectedValue={formData.gender}
          onChange={(value: string) => handleSelectChange('gender', value)}
          error={getFieldErrorIfTouched('gender')}
        />
        <Input
          type="text"
          name="nationalId"
          label="National Identification Number"
          required
          value={formData.nationalId}
          onchange={handleInputChange('nationalId')}
          errors={getFieldErrorIfTouched('nationalId')}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          type="text"
          name="taxPayerNumber"
          label="Tax payers number"
          required
          value={formData.taxPayerNumber}
          onchange={handleInputChange('taxPayerNumber')}
          errors={getFieldErrorIfTouched('taxPayerNumber')}
        />
        <CustomDatePicker
          label="Employment Date"
          placeholder="Select employment date"
          isRequired
          value={getEmploymentDate()}
          onChange={handleEmploymentDateChange}
          errors={getFieldErrorIfTouched('employmentDate')}
        />
      </div>
    </div>
  );
};
export default BaseInfo;
