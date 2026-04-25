import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  BaseInfoPayload,
  AddressPayload,
  CompensationPayload,
  SchedulePayload,
  BenefitPayload,
  TaxInfoPayload,
  PersonPayload,
  BankAccountPayload,
} from '../utils/types';
import { STORAGE_KEYS, FORM_STEPS } from '../constants';
import { useEmployeeAPI } from './useEmployeeAPI';
import { baseInfoValidationSchema } from '../validations/baseInfoValidation';
import { addressValidationSchema } from '../validations/addressValidation';
import { bankAccountValidationSchema } from '../validations/bankAccountValidation';

type FormStep = 'ebi' | 'el' | 'ba' | 'c' | 'ps' | 'bad' | 'eti';

export const useEmployeeForm = () => {
  const [active, setActive] = useState<FormStep>(FORM_STEPS.EMPLOYEE_BASE_INFO);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [personId, setPersonId] = useState<string | null>(null);
  const [personData, setPersonData] = useState<any>(null);
  const [formKey, setFormKey] = useState(0);

  // Form state
  const [baseInfo, setBaseInfo] = useState<BaseInfoPayload | null>(null);
  const [address, setAddress] = useState<AddressPayload | null>(null);
  const [bankAccount, setBankAccount] = useState<BankAccountPayload | null>(
    null
  );
  const [compensation, setCompensation] = useState<CompensationPayload | null>(
    null
  );
  const [schedule, setSchedule] = useState<SchedulePayload | null>(null);
  const [benefit, setBenefit] = useState<BenefitPayload | null>(null);
  const [taxInfo, setTaxInfo] = useState<TaxInfoPayload | null>(null);

  // State to control when to show validation errors for each step
  const [showValidationErrors, setShowValidationErrors] = useState({
    baseInfo: false,
    address: false,
    bankAccount: false,
    compensation: false,
    schedule: false,
  });

  // Simple validation functions for each step
  const validateBaseInfoData = useCallback(async (): Promise<boolean> => {
    console.log('🔥 SIMPLE VALIDATION - Validating base info data...');

    if (!baseInfo) {
      console.log('❌ No base info data available');
      return false;
    }

    try {
      await baseInfoValidationSchema.validate(baseInfo, { abortEarly: false });
      console.log('✅ Base info validation passed');
      return true;
    } catch (error) {
      console.log('❌ Base info validation failed:', error);
      return false;
    }
  }, [baseInfo]);

  const validateAddressData = useCallback(async (): Promise<boolean> => {
    console.log('🔥 SIMPLE VALIDATION - Validating address data...');

    if (!address) {
      console.log('❌ No address data available');
      return false;
    }

    try {
      await addressValidationSchema.validate(address, { abortEarly: false });
      console.log('✅ Address validation passed');
      return true;
    } catch (error) {
      console.log('❌ Address validation failed:', error);
      return false;
    }
  }, [address]);

  const validateBankAccountData = useCallback(async (): Promise<boolean> => {
    console.log('🔥 SIMPLE VALIDATION - Validating bank account data...');

    if (!bankAccount) {
      console.log('❌ No bank account data available');
      return false;
    }

    try {
      await bankAccountValidationSchema.validate(bankAccount, {
        abortEarly: false,
      });
      console.log('✅ Bank account validation passed');
      return true;
    } catch (error) {
      console.log('❌ Bank account validation failed:', error);
      return false;
    }
  }, [bankAccount]);

  // Function to trigger validation errors for current step
  const triggerValidationForCurrentStep = useCallback(() => {
    setShowValidationErrors((prev) => ({
      ...prev,
      baseInfo: active === FORM_STEPS.EMPLOYEE_BASE_INFO,
      address: active === FORM_STEPS.EMPLOYEE_LOCATION,
      bankAccount: active === FORM_STEPS.BANK_ACCOUNT,
      compensation: active === FORM_STEPS.COMPENSATION,
      schedule: active === FORM_STEPS.PAY_SCHEDULE,
    }));
  }, [active]);

  // Debug: Track when validateBaseInfo changes
  useEffect(() => {
    console.log('🔍 PARENT: validateBaseInfo changed', {
      hasValidateBaseInfo: !!validateBaseInfoData,
      functionType: typeof validateBaseInfoData,
      isPromise: validateBaseInfoData instanceof Promise,
      validateBaseInfoData,
    });
  }, [validateBaseInfoData]);

  const { createPerson, updatePerson, getPersonData, getBankAccounts } =
    useEmployeeAPI();

  // Load saved data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPersonId = localStorage.getItem(STORAGE_KEYS.PERSON_ID);
      if (savedPersonId) {
        setPersonId(savedPersonId);

        // Only restore saved active step if there's a valid personId
      const savedActiveStep = localStorage.getItem(STORAGE_KEYS.ACTIVE_STEP);
      if (savedActiveStep) {
        setActive(savedActiveStep as any);
        }
      } else {
        // If no personId, always start from base info step
        setActive(FORM_STEPS.EMPLOYEE_BASE_INFO);
      }

      // Load saved form data
      try {
        const savedBaseInfo = localStorage.getItem(STORAGE_KEYS.BASE_INFO);
        if (savedBaseInfo) setBaseInfo(JSON.parse(savedBaseInfo));

        const savedAddress = localStorage.getItem(STORAGE_KEYS.ADDRESS);
        if (savedAddress) setAddress(JSON.parse(savedAddress));

        const savedBankAccount = localStorage.getItem(
          STORAGE_KEYS.BANK_ACCOUNT
        );
        if (savedBankAccount) setBankAccount(JSON.parse(savedBankAccount));

        const savedCompensation = localStorage.getItem(
          STORAGE_KEYS.COMPENSATION
        );
        if (savedCompensation) setCompensation(JSON.parse(savedCompensation));

        const savedSchedule = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
        if (savedSchedule) setSchedule(JSON.parse(savedSchedule));

        const savedBenefit = localStorage.getItem(STORAGE_KEYS.BENEFIT);
        if (savedBenefit) setBenefit(JSON.parse(savedBenefit));

        const savedTaxInfo = localStorage.getItem(STORAGE_KEYS.TAX_INFO);
        if (savedTaxInfo) setTaxInfo(JSON.parse(savedTaxInfo));
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, []);

  // Save active step to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_STEP, active);
  }, [active]);

  // Watch for changes in localStorage personId (for when modal reopens)
  useEffect(() => {
    const handleStorageChange = () => {
      const currentPersonId = localStorage.getItem(STORAGE_KEYS.PERSON_ID);

      if (currentPersonId && currentPersonId !== personId) {
        console.log(
          '🔄 PersonId changed from',
          personId,
          'to',
          currentPersonId
        );
        setPersonId(currentPersonId);
        // Reset form state when switching employees
        setFormKey((prev) => prev + 1);
      } else if (!currentPersonId && personId) {
        console.log('🔄 PersonId cleared');
        setPersonId(null);
        // Clear form data when personId is cleared
        setBaseInfo(null);
        setAddress(null);
        setBankAccount(null);
        setCompensation(null);
        setSchedule(null);
        setBenefit(null);
        setTaxInfo(null);
        // Reset to base info step when personId is cleared
        setActive(FORM_STEPS.EMPLOYEE_BASE_INFO);
      }
    };

    // Check immediately when effect runs
    handleStorageChange();

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);

    // Also check periodically (for same-tab changes)
    const interval = setInterval(handleStorageChange, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [personId]);

  // Fetch person data when personId changes
  useEffect(() => {
    if (personId) {
      fetchPersonData();
    }
  }, [personId, active]);

  const fetchPersonData = useCallback(async () => {
    if (!personId) return;

    console.log('🟢 Fetching person data for ID:', personId);
    setIsFetching(true);
    try {
      const data = await getPersonData(personId);
      console.log('🟢 Person data fetched successfully:', data);
      setPersonData(data);

      if (data) {
        // Update base info
        if (
          active === FORM_STEPS.EMPLOYEE_BASE_INFO ||
          active === FORM_STEPS.EMPLOYEE_LOCATION
        ) {
          const newBaseInfo = {
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phoneNumber: data.phone || '',
            gender: data.gender
              ? data.gender.charAt(0).toUpperCase() + data.gender.slice(1)
              : 'Male',
            birthday: data.date_of_birth || '',
            employmentType: data.employment_type || 'Employee',
            employmentDate: data.start_date || '',
            maritalStatus: data.marital_status || 'Single',
            taxPayerNumber: data.tax_payer_number || '',
            nationalId: data.national_identification_number || '',
            employeeId: data.uuid || '',
            jobTitle: data.jobTitle || '',
            roleName: data.role_name || '',
          };
          setBaseInfo(newBaseInfo);
        }

        // Update address info
        if (active === FORM_STEPS.EMPLOYEE_LOCATION && data.address) {
          const newAddress = {
            address: data.address.address || '',
            city: data.address.city || '',
            state: data.address.state || '',
            country: data.address.country || '',
            postalCode: data.address.postalCode || '',
            latitude: data.address.latitude || 0,
            longitude: data.address.longitude || 0,
          };
          setAddress(newAddress);
        }

        // Update bank account info
        if (active === FORM_STEPS.BANK_ACCOUNT) {
          try {
            const bankAccounts = await getBankAccounts(personId);

            if (
              bankAccounts &&
              Array.isArray(bankAccounts) &&
              bankAccounts.length > 0
            ) {
              const primaryAccount =
                bankAccounts.find((acc: any) => acc.is_primary) ||
                bankAccounts[0];
              const newBankAccount = {
                person_id: personId,
                account_holder_name:
                  primaryAccount.account_holder_name ||
                  `${data.firstName} ${data.lastName}`,
                bank_name: primaryAccount.bank_name || '',
                account_number: primaryAccount.account_number || '',
                routing_number: primaryAccount.routing_number || '',
                currency: primaryAccount.currency || 'USD',
                account_type: primaryAccount.account_type || 'Checking',
                is_primary: primaryAccount.is_primary || true,
                country:
                  primaryAccount.country || data.address?.country || 'US',
                verified: primaryAccount.verified || false,
              };
              setBankAccount(newBankAccount);
            } else {
              const emptyBankAccount = {
                person_id: personId,
                account_holder_name: `${data.firstName} ${data.lastName}`,
                bank_name: '',
                account_number: '',
                routing_number: '',
                currency: 'USD',
                account_type: 'Checking',
                is_primary: true,
                country: data.address?.country || 'US',
                verified: false,
              };
              setBankAccount(emptyBankAccount);
            }
          } catch (error) {
            console.error('Error fetching bank accounts:', error);
          }
        }

        // Update compensation data
        if (active === FORM_STEPS.COMPENSATION) {
          const newCompensation = {
            personId: personId,
            hourlyRate: data.hourly_rate || 0,
            salary: data.base_pay || 0,
            paymentFrequency: data.compensation_schedule || 'Monthly',
            eligibleForTips: data.eligible_for_tips || false,
            eligibleForOvertime: data.eligible_for_overtime || false,
            paid_time_off: data.paidTimeOff || [],
          };
          setCompensation(newCompensation);
        }

        // Update schedule info
        if (active === FORM_STEPS.PAY_SCHEDULE) {
          const newSchedule = {
            personId: personId,
            payScheduleId: data.pay_schedule?.uuid || '',
            payCycleName: data.compensation_schedule || '',
            firstPayDate: data.pay_schedule?.first_pay_date || '',
            endPayDate: data.pay_schedule?.end_date || '',
            effectiveDate: data.pay_schedule?.effective_date || '', // Fix the missing field
          };
          setSchedule(newSchedule);
        }

        setFormKey((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error fetching person data:', error);
    } finally {
      setIsFetching(false);
    }
  }, [personId, active, getPersonData, getBankAccounts]);

  // Form data handlers
  const handleBaseInfoChange = useCallback((data: BaseInfoPayload) => {
    setBaseInfo(data);
    localStorage.setItem(STORAGE_KEYS.BASE_INFO, JSON.stringify(data));
  }, []);

  const handleAddressChange = useCallback((data: AddressPayload) => {
    setAddress(data);
    localStorage.setItem(STORAGE_KEYS.ADDRESS, JSON.stringify(data));
  }, []);

  const handleBankAccountChange = useCallback((data: BankAccountPayload) => {
    setBankAccount(data);
    localStorage.setItem(STORAGE_KEYS.BANK_ACCOUNT, JSON.stringify(data));
  }, []);

  const handleCompensationChange = useCallback((data: CompensationPayload) => {
    setCompensation(data);
    localStorage.setItem(STORAGE_KEYS.COMPENSATION, JSON.stringify(data));
  }, []);

  const handleScheduleChange = useCallback((data: SchedulePayload) => {
    setSchedule(data);
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(data));
  }, []);

  const handleBenefitChange = useCallback((data: BenefitPayload) => {
    setBenefit(data);
    localStorage.setItem(STORAGE_KEYS.BENEFIT, JSON.stringify(data));
  }, []);

  const handleTaxInfoChange = useCallback((data: TaxInfoPayload) => {
    setTaxInfo(data);
    localStorage.setItem(STORAGE_KEYS.TAX_INFO, JSON.stringify(data));
  }, []);

  // Clear all saved data
  const clearSavedData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });

    setPersonId(null);
    setPersonData(null);
    setBaseInfo(null);
    setAddress(null);
    setBankAccount(null);
    setCompensation(null);
    setSchedule(null);
    setBenefit(null);
    setTaxInfo(null);
    setActive(FORM_STEPS.EMPLOYEE_BASE_INFO);
  }, []);

  // Format data for API
  const formatPersonPayload = useCallback((): PersonPayload | null => {
    if (!baseInfo || !address) return null;

    const payload: PersonPayload = {
      firstName: baseInfo.firstName,
      lastName: baseInfo.lastName,
      email: baseInfo.email,
      phone: baseInfo.phoneNumber,
      gender: baseInfo.gender.toLowerCase(),
      date_of_birth: baseInfo.birthday,
      employment_type: baseInfo.employmentType,
      start_date: baseInfo.employmentDate,
      end_date: null,
      marital_status: baseInfo.maritalStatus,
      payScheduleId: schedule?.payScheduleId,
      tax_payer_number: baseInfo.taxPayerNumber,
      national_identification_number: baseInfo.nationalId,
      roleName: baseInfo.roleName,
      isActive: true,
      address: {
        address: address.address,
        city: address.city,
        state: address.state,
        country: address.country,
        postalCode: address.postalCode,
        latitude: address.latitude || 0,
        longitude: address.longitude || 0,
      },
    };

    // Include bank account data if available
    if (bankAccount) {
      payload.account_holder_name = bankAccount.account_holder_name;
      payload.bank_name = bankAccount.bank_name;
      payload.account_number = bankAccount.account_number;
      payload.routing_number = bankAccount.routing_number;
      payload.currency = bankAccount.currency;
      payload.account_type = bankAccount.account_type;
      payload.is_primary = bankAccount.is_primary;
      payload.country = bankAccount.country;
      payload.verified = bankAccount.verified;
    }

    // Include compensation data if available
    if (compensation) {
      payload.eligible_for_tips = compensation.eligibleForTips;
      payload.eligible_for_overtime = compensation.eligibleForOvertime;
      payload.base_pay = compensation.salary;
      payload.hourly_rate = compensation.hourlyRate;
      payload.compensation_schedule = compensation.paymentFrequency;
      payload.salary = compensation.salary;
    }

    return payload;
  }, [baseInfo, address, schedule, bankAccount, compensation]);

  // Handle form submission
  const handleProceed = useCallback(async () => {
    setIsLoading(true);

    try {
      switch (active) {
        case FORM_STEPS.EMPLOYEE_BASE_INFO:
          if (!baseInfo) {
            toast.error('Please complete the employee base information');
            break;
          }
          
          // Validate base info using the form component's validation
          console.log('🔍 PARENT: Checking validateBaseInfo function', {
            hasValidateBaseInfo: !!validateBaseInfoData,
            functionType: typeof validateBaseInfoData,
            validateBaseInfoData,
          });

          if (
            !validateBaseInfoData ||
            typeof validateBaseInfoData !== 'function'
          ) {
            console.log('❌ PARENT: Validation function not available');
            toast.error('Validation not ready, please try again');
            break;
          }

          console.log('✅ PARENT: Validation function available, calling...');
          
          try {
            const isBaseInfoValid = await validateBaseInfoData();
            if (!isBaseInfoValid) {
              toast.error('Please fix the validation errors in the form');
              break;
            }
          } catch (error) {
            console.error('Error during validation:', error);
            toast.error('Validation failed, please try again');
            break;
          }
          
          setActive(FORM_STEPS.EMPLOYEE_LOCATION);
          break;

        case FORM_STEPS.EMPLOYEE_LOCATION:
          if (!address) {
            toast.error('Please complete the employee location information');
            break;
          }

          // Just move to the next step - employee creation will happen at bank account stage
          setActive(FORM_STEPS.BANK_ACCOUNT);
          break;

        case FORM_STEPS.BANK_ACCOUNT:
          if (!bankAccount) {
            toast.error('Please complete the bank account information');
            break;
          }

          // This is where the employee should be created (with all data: baseInfo, address, bankAccount)
          if (!personId) {
            const payload = formatPersonPayload();
            if (!payload) {
              toast.error('Invalid form data');
              break;
            }
            const newPersonId = await createPerson(payload);
            if (!newPersonId) break;
            setPersonId(newPersonId);
            localStorage.setItem(STORAGE_KEYS.PERSON_ID, newPersonId);
          } else {
            const payload = formatPersonPayload();
            if (!payload) {
              toast.error('Invalid form data');
              break;
            }
            const updateSuccess = await updatePerson(personId, payload);
            if (!updateSuccess) break;
          }

          setActive(FORM_STEPS.COMPENSATION);
          break;

        case FORM_STEPS.COMPENSATION:
          if (compensation) {
            // Validate compensation using the form component's validation
            // const isCompensationValid = await validateCompensation?.(); // This line is removed as per the new_code
            // if (!isCompensationValid) { // This line is removed as per the new_code
            //   toast.error( // This line is removed as per the new_code
            //     'Please fix the validation errors in the compensation form' // This line is removed as per the new_code
            //   ); // This line is removed as per the new_code
            //   break; // This line is removed as per the new_code
            // } // This line is removed as per the new_code
          }

          setActive(FORM_STEPS.PAY_SCHEDULE);
          break;

        case FORM_STEPS.PAY_SCHEDULE:
          if (schedule) {
            // Validate schedule using the form component's validation
            // const isScheduleValid = await validateSchedule?.(); // This line is removed as per the new_code
            // if (!isScheduleValid) { // This line is removed as per the new_code
            //   toast.error( // This line is removed as per the new_code
            //     'Please fix the validation errors in the schedule form' // This line is removed as per the new_code
            //   ); // This line is removed as per the new_code
            //   break; // This line is removed as per the new_code
            // } // This line is removed as per the new_code
          }

          setActive(FORM_STEPS.BENEFITS);
          break;

        case FORM_STEPS.BENEFITS:
          setActive(FORM_STEPS.EMPLOYEE_TAX_INFO);
          break;

        case FORM_STEPS.EMPLOYEE_TAX_INFO:
          if (!taxInfo) {
            toast.error('Please complete the tax information');
            break;
          }

          if (personId) {
            const payload = formatPersonPayload();
            if (payload) {
              await updatePerson(personId, payload);
              toast.success('Employee setup completed!');
              clearSavedData();
              return { completed: true };
            }
          }
          break;
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }

    return { completed: false };
  }, [
    active,
    baseInfo,
    address,
    bankAccount,
    compensation,
    schedule,
    taxInfo,
    personId,
    formatPersonPayload,
    createPerson,
    updatePerson,
    clearSavedData,
    validateBaseInfoData,
    // validateAddress, // This line is removed as per the new_code
    // validateBankAccount, // This line is removed as per the new_code
    // validateCompensation, // This line is removed as per the new_code
    // validateSchedule, // This line is removed as per the new_code
  ]);

  const handleTabClick = useCallback(
    (tab: string) => {
      if (
        personId ||
        tab === FORM_STEPS.EMPLOYEE_BASE_INFO ||
        tab === FORM_STEPS.BANK_ACCOUNT ||
        tab === FORM_STEPS.EMPLOYEE_LOCATION
      ) {
        setActive(tab as FormStep);
      } else {
        toast.error('Please complete previous steps first');
      }
    },
    [personId]
  );

  return {
    // State
    active,
    isLoading,
    isFetching,
    personId,
    personData,
    formKey,
    baseInfo,
    address,
    bankAccount,
    compensation,
    schedule,
    benefit,
    taxInfo,
    showValidationErrors,

    // Actions
    setActive,
    setPersonId,
    handleBaseInfoChange,
    handleAddressChange,
    handleBankAccountChange,
    handleCompensationChange,
    handleScheduleChange,
    handleBenefitChange,
    handleTaxInfoChange,
    handleProceed,
    handleTabClick,
    clearSavedData,

    // Validation functions
    validateBaseInfoData,
    validateAddressData,
    validateBankAccountData,
    triggerValidationForCurrentStep,
  };
};
