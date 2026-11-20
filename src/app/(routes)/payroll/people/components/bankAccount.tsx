'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Input from '@potta/components/input';
import Select from '@potta/components/select';
import SearchableSelect from '@potta/components/searchableSelect';
import { Switch } from '@headlessui/react';
import { peopleApi } from '../utils/api';
import { Country } from 'country-state-city';
import {
  getCountries,
  getCountryName,
  LocationOption,
} from '@potta/services/locationService';
import { useValidation } from '../hooks/useValidation';
import { bankAccountValidationSchema } from '../validations/bankAccountValidation';

interface BankAccountProps {
  personId: string;
  onChange?: (data: any) => void;
  initialData?: any;
  onSubmit?: (data: any) => void;
  setValidateBankAccount?: (validateFn: () => Promise<boolean>) => void;
  showValidationErrors?: boolean;
}

// Updated account types to match backend requirements
const accountTypes = [
  { label: 'Checking', value: 'Checking' },
  { label: 'Savings', value: 'Savings' },
  { label: 'Mobile Money', value: 'MobileMoney' },
  { label: 'Other', value: 'Other' },
];

// Common currencies
const currencies = [
  { label: 'USD - US Dollar', value: 'USD' },
  { label: 'EUR - Euro', value: 'EUR' },
  { label: 'GBP - British Pound', value: 'GBP' },
  { label: 'JPY - Japanese Yen', value: 'JPY' },
  { label: 'CAD - Canadian Dollar', value: 'CAD' },
  { label: 'AUD - Australian Dollar', value: 'AUD' },
  { label: 'CHF - Swiss Franc', value: 'CHF' },
  { label: 'CNY - Chinese Yuan', value: 'CNY' },
  { label: 'XAF - Central African CFA Franc', value: 'XAF' },
  { label: 'NGN - Nigerian Naira', value: 'NGN' },
];

// Helper function to get currency based on country code
const getDefaultCurrencyForCountry = (countryCode: string): string => {
  const currencyMap: Record<string, string> = {
    CM: 'XAF', // Cameroon
    US: 'USD', // United States
    GB: 'GBP', // United Kingdom
    CA: 'CAD', // Canada
    AU: 'AUD', // Australia
    DE: 'EUR', // Germany
    FR: 'EUR', // France
    NG: 'NGN', // Nigeria
    ZA: 'ZAR', // South Africa
    KE: 'KES', // Kenya
    GH: 'GHS', // Ghana
    CN: 'CNY', // China
    JP: 'JPY', // Japan
    IN: 'INR', // India
    BR: 'BRL', // Brazil
    MX: 'MXN', // Mexico
  };

  return currencyMap[countryCode] || 'XAF'; // Default to XAF if not found
};

const BankAccount: React.FC<BankAccountProps> = ({
  personId,
  onChange,
  initialData,
  onSubmit,
  setValidateBankAccount,
  showValidationErrors = false,
}) => {
  const [formData, setFormData] = useState({
    person_id: personId,
    account_holder_name: initialData?.account_holder_name || '',
    bank_name: initialData?.bank_name || '',
    account_number: initialData?.account_number || '',
    routing_number: initialData?.routing_number || '',
    currency: initialData?.currency || 'XAF', // Default to XAF for Cameroon
    account_type: initialData?.account_type || 'Checking',
    is_primary:
      initialData?.is_primary !== undefined ? initialData.is_primary : true,
    country_code: initialData?.country_code || '',
    country: initialData?.country || '',
    verified:
      initialData?.verified !== undefined ? initialData.verified : false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [personData, setPersonData] = useState<any>(null);
  const [countryOptions, setCountryOptions] = useState<LocationOption[]>([]);

  // Initialize validation hook
  const { validate, validateField, getFieldError, hasFieldError } =
    useValidation(bankAccountValidationSchema);

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

  // Register validation function with parent
  useEffect(() => {
    if (setValidateBankAccount) {
      setValidateBankAccount(() => async () => {
        const isValid = await validate(formData);
        return isValid;
      });
    }
  }, [setValidateBankAccount, validate, formData]);

  // Trigger validation when parent requests to show validation errors
  useEffect(() => {
    if (showValidationErrors) {
      console.log(
        '🔥 BankAccount - Triggering validation due to showValidationErrors'
      );
      // Run validation to populate errors in the validation hook
      validate(formData);
    }
  }, [showValidationErrors, validate, formData]);

  // Load countries on component mount
  useEffect(() => {
    const countries = getCountries();
    setCountryOptions(countries);
  }, []);

  // Fetch person data to get the country from address (only if personId exists - for edit mode)
  useEffect(() => {
    const fetchPersonData = async () => {
      if (personId && personId !== '') {
        try {
          setIsLoading(true);
          const data = await peopleApi.getPerson(personId);
          setPersonData(data);

          // Auto-populate account holder name if not already set
          const fullName = `${data.firstName} ${data.lastName}`.trim();

          // Auto-populate country from person's address
          const country = data.address?.country || '';

          // Set default currency based on country
          const defaultCurrency = getDefaultCurrencyForCountry(country);

          setFormData((prev) => ({
            ...prev,
            person_id: personId,
            account_holder_name: prev.account_holder_name || fullName,
            country: country,
            currency: prev.currency || defaultCurrency,
          }));
        } catch (error) {
          console.error('Error fetching person data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchPersonData();
  }, [personId]);

  // Initialize data for parent component
  useEffect(() => {
    if (onChange) onChange(formData);
  }, []);

  // Update person_id when it changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      person_id: personId,
    }));
  }, [personId]);

  // Validate form data
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.account_holder_name.trim()) {
      newErrors.account_holder_name = 'Account holder name is required';
    }

    if (!formData.bank_name.trim()) {
      newErrors.bank_name = 'Bank name is required';
    }

    if (!formData.account_number.trim()) {
      newErrors.account_number = 'Account number is required';
    }

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Direct input change handler for the Input component
  const handleInputChange =
    (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // Mark field as touched
      markFieldAsTouched(name);

      setFormData((prev) => {
        const newData = { ...prev, [name]: value };
        if (onChange) onChange(newData);
        return newData;
      });

      // Validate the field
      validateField(name, value);
    };
  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    // Mark field as touched
    markFieldAsTouched(name);

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // If changing country_code, also update the country name
      if (name === 'country_code') {
        newData.country = getCountryName(value) || '';

        // Also update currency based on new country
        newData.currency = getDefaultCurrencyForCountry(value);
      }

      if (onChange) {
        // Create a copy without country_code for the onChange callback
        const callbackData = { ...newData };
        if ('country_code' in callbackData) {
          delete callbackData.country_code;
        }
        onChange(callbackData);
      }

      return newData;
    });

    // Validate the field
    validateField(name, value);
  };

  // Handle switch change
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: checked };
      if (onChange) onChange(newData);
      return newData;
    });
  };
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();

    if (isValid) {
      // Create a copy of formData
      const formDataCopy = { ...formData };

      // Remove country_code from the payload
      if ('country_code' in formDataCopy) {
        delete formDataCopy.country_code;
      }

      // Prepare the exact payload structure as requested
      const payload = {
        person_id: formDataCopy.person_id,
        account_holder_name: formDataCopy.account_holder_name,
        bank_name: formDataCopy.bank_name,
        account_number: formDataCopy.account_number,
        routing_number: formDataCopy.routing_number,
        currency: formDataCopy.currency,
        account_type: formDataCopy.account_type,
        is_primary: formDataCopy.is_primary,
        country: formDataCopy.country,
        verified: formDataCopy.verified,
      };

      // Submit the data
      if (onSubmit) {
        onSubmit(payload);
      } else if (onChange) {
        onChange(payload);
      }

      console.log('Submitting bank account data:', payload);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center pt-20">
        <p className="text-gray-500">Loading employee information...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 pt-5 px-6">
      <h2 className="text-xl font-medium mb-4">Direct Deposit Information</h2>
      <p className="text-gray-600 mb-4">
        Add bank account details for direct deposit
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type={'text'}
            name={'account_holder_name'}
            required
            label="Account Holder Name"
            placeholder="John Doe"
            value={formData.account_holder_name}
            onchange={handleInputChange('account_holder_name')}
            errors={getFieldErrorIfTouched('account_holder_name')}
          />
        </div>

        <div>
          <Input
            type={'text'}
            name={'bank_name'}
            required
            label="Bank Name"
            placeholder="Example Bank"
            value={formData.bank_name}
            onchange={handleInputChange('bank_name')}
            errors={getFieldErrorIfTouched('bank_name')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              type={'text'}
              name={'account_number'}
              required
              label="Account Number"
              placeholder="123456789"
              value={formData.account_number}
              onchange={handleInputChange('account_number')}
              errors={getFieldErrorIfTouched('account_number')}
            />
          </div>
          <div>
            <Input
              type={'text'}
              name={'routing_number'}
              required
              label="Routing Number"
              placeholder="987654321"
              value={formData.routing_number}
              onchange={handleInputChange('routing_number')}
              errors={getFieldErrorIfTouched('routing_number')}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <SearchableSelect
              required
              label="Currency"
              options={currencies}
              selectedValue={formData.currency}
              onChange={(value: string) =>
                handleSelectChange('currency', value)
              }
            />
          </div>
          <div>
            <SearchableSelect
              required
              label="Account Type"
              options={accountTypes}
              selectedValue={formData.account_type}
              onChange={(value: string) =>
                handleSelectChange('account_type', value)
              }
            />
          </div>
        </div>

        <div>
          <SearchableSelect
            required
            label="Country"
            options={countryOptions}
            selectedValue={formData.country_code}
            onChange={(value) => {
              handleSelectChange('country_code', value);
              // Also update the country field with the country name
              const countryName = getCountryName(value) || '';
              setFormData((prev) => ({
                ...prev,
                country: countryName,
              }));
            }}
            placeholder="Select a country"
            error={getFieldErrorIfTouched('country')}
          />
        </div>

        <div className="flex items-center mt-2">
          <Switch
            checked={formData.is_primary}
            onChange={(checked) => handleSwitchChange('is_primary', checked)}
            className={`${
              formData.is_primary ? 'bg-green-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                formData.is_primary ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <span className="ml-3 text-sm font-medium">
            Set as Primary Account
          </span>
        </div>

        <div className="flex items-center mt-2">
          <Switch
            checked={formData.verified}
            onChange={(checked) => handleSwitchChange('verified', checked)}
            className={`${
              formData.verified ? 'bg-green-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                formData.verified ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <span className="ml-3 text-sm font-medium">Verified Account</span>
        </div>
      </form>
    </div>
  );
};

export default BankAccount;
