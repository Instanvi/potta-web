'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Input from '@potta/components/input';
import SearchableSelect from '@potta/components/searchableSelect';
import {
  getCountries,
  getStates,
  getCities,
  getCountryName,
  getStateName,
  LocationOption,
} from '@potta/services/locationService';
import { useValidation } from '../hooks/useValidation';
import { addressValidationSchema } from '../validations/addressValidation';

interface AddressProps {
  onChange?: (data: any) => void;
  initialData?: any;
  setValidateAddress?: (validateFn: () => Promise<boolean>) => void;
  showValidationErrors?: boolean;
}

const Address: React.FC<AddressProps> = ({
  onChange,
  initialData,
  setValidateAddress,
  showValidationErrors = false,
}) => {
  // Use a ref to track if we've initialized with initial data
  const initializedRef = useRef(false);

  // Initialize with default values to avoid uncontrolled to controlled warnings
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    latitude: 0,
    longitude: 0,
    countryName: '',
    stateName: '',
  });

  // Initialize validation hook
  const {
    errors,
    validate,
    validateField,
    clearErrors,
    getFieldError,
    hasFieldError,
  } = useValidation(addressValidationSchema);

  // Register validation function with parent
  useEffect(() => {
    if (setValidateAddress) {
      setValidateAddress(() => async () => {
        const isValid = await validate(formData);
        return isValid;
      });
    }
  }, [setValidateAddress, validate, formData]);

  // Trigger validation when parent requests to show validation errors
  useEffect(() => {
    if (showValidationErrors) {
      console.log(
        '🔥 Address - Triggering validation due to showValidationErrors'
      );
      // Run validation to populate errors in the validation hook
      validate(formData);
    }
  }, [showValidationErrors, validate, formData]);

  // State for location options
  const [countryOptions, setCountryOptions] = useState<LocationOption[]>([]);
  const [stateOptions, setStateOptions] = useState<LocationOption[]>([]);
  const [cityOptions, setCityOptions] = useState<LocationOption[]>([]);

  // Track which fields have been touched by the user
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

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

  // Use a ref to prevent the onChange callback from causing re-renders
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Load countries on component mount
  useEffect(() => {
    const countries = getCountries();
    setCountryOptions(countries);
  }, []);

  // Initialize with initialData if provided - only once
  useEffect(() => {
    console.log('🟡 Address useEffect - initialData:', initialData);
    console.log(
      '🟡 Address useEffect - initializedRef.current:',
      initializedRef.current
    );

    if (initialData && !initializedRef.current) {
      console.log('🟡 Address received initialData:', initialData);

      // Create a new object with default values for any missing fields
      const newFormData = {
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        country: initialData.country || '',
        postalCode: initialData.postalCode || '',
        latitude: initialData.latitude || 0,
        longitude: initialData.longitude || 0,
        countryName:
          initialData.countryName || getCountryName(initialData.country) || '',
        stateName:
          initialData.stateName ||
          (initialData.country && initialData.state
            ? getStateName(initialData.country, initialData.state)
            : ''),
      };

      console.log('🟡 Address setting formData to:', newFormData);
      setFormData(newFormData);
      initializedRef.current = true;
    }
  }, [initialData]);

  // Load states when country changes
  useEffect(() => {
    if (formData.country) {
      const states = getStates(formData.country);
      setStateOptions(states);
    } else {
      setStateOptions([]);
    }
  }, [formData.country]);

  // Load cities when state changes
  useEffect(() => {
    if (formData.country && formData.state) {
      const cities = getCities(formData.country, formData.state);
      setCityOptions(cities);
    } else {
      setCityOptions([]);
    }
  }, [formData.country, formData.state]);

  // Handle input change
  const handleInputChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // Mark field as touched
      markFieldAsTouched(field);

      setFormData((prev) => {
        const updated = { ...prev, [field]: value };

        // Validate the field
        validateField(field, value);

        // Call onChange outside of setState to prevent re-renders
        setTimeout(() => {
          if (onChangeRef.current) {
            onChangeRef.current(updated);
          }
        }, 0);

        return updated;
      });
    },
    [validateField, markFieldAsTouched]
  );

  // Handle country change
  const handleCountryChange = useCallback(
    (value: string) => {
      // Mark field as touched
      markFieldAsTouched('country');

      const selectedCountry = countryOptions.find(
        (country) => country.value === value
      );
      const countryName = selectedCountry ? selectedCountry.label : '';

      setFormData((prev) => {
        const updated = {
          ...prev,
          country: value,
          countryName,
          // Reset state and city when country changes
          state: '',
          city: '',
          stateName: '',
        };

        // Validate the field
        validateField('country', value);

        // Call onChange outside of setState to prevent re-renders
        setTimeout(() => {
          if (onChangeRef.current) {
            onChangeRef.current(updated);
          }
        }, 0);

        return updated;
      });
    },
    [countryOptions, validateField, markFieldAsTouched]
  );

  // Handle state change
  const handleStateChange = useCallback(
    (value: string) => {
      // Mark field as touched
      markFieldAsTouched('state');

      const selectedState = stateOptions.find((state) => state.value === value);
      const stateName = selectedState ? selectedState.label : '';

      setFormData((prev) => {
        const updated = {
          ...prev,
          state: value,
          stateName,
          // Reset city when state changes
          city: '',
        };

        // Validate the field
        validateField('state', value);

        // Call onChange outside of setState to prevent re-renders
        setTimeout(() => {
          if (onChangeRef.current) {
            onChangeRef.current(updated);
          }
        }, 0);

        return updated;
      });
    },
    [stateOptions, validateField, markFieldAsTouched]
  );

  // Handle city change
  const handleCityChange = useCallback(
    (value: string) => {
      setFormData((prev) => {
        const updated = { ...prev, city: value };

        // Validate the field
        validateField('city', value);

        // Call onChange outside of setState to prevent re-renders
        setTimeout(() => {
          if (onChangeRef.current) {
            onChangeRef.current(updated);
          }
        }, 0);

        return updated;
      });
    },
    [validateField]
  );

  return (
    <div className="w-full pt-5 px-6">
      <div className="grid grid-cols-1 gap-4">
        <Input
          type="text"
          placeholder="Street Address"
          name="address"
          required
          label="Address"
          value={formData.address}
          onchange={handleInputChange('address')}
          errors={getFieldErrorIfTouched('address')}
        />

        <div className="grid grid-cols-3 gap-3">
          <SearchableSelect
            required
            label="Country"
            options={countryOptions}
            selectedValue={formData.country}
            onChange={handleCountryChange}
            placeholder="Select country"
            error={getFieldErrorIfTouched('country')}
          />

          <SearchableSelect
            required
            label="State/Province"
            options={stateOptions}
            selectedValue={formData.state}
            onChange={handleStateChange}
            placeholder="Select state"
            isDisabled={!formData.country}
            error={getFieldErrorIfTouched('state')}
          />

          <SearchableSelect
            required
            label="City"
            options={cityOptions}
            selectedValue={formData.city}
            onChange={handleCityChange}
            placeholder="Select city"
            isDisabled={!formData.state}
            error={getFieldErrorIfTouched('city')}
          />
        </div>

        <Input
          type="text"
          required
          placeholder="Postal Code"
          name="postalCode"
          label="Postal Code"
          value={formData.postalCode}
          onchange={handleInputChange('postalCode')}
          errors={getFieldErrorIfTouched('postalCode')}
        />
      </div>
    </div>
  );
};

export default Address;
