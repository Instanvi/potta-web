import { useState, useEffect } from 'react';
import { CalendarDate } from '@internationalized/date';
import { toast } from 'react-hot-toast';
import {
  validateBenefitForm,
  BenefitFormData,
  ValidationLimits,
} from '../utils/validations';
import {
  getCategoryConfig,
  getCategoryLimits,
  createBenefitPayload,
  resetFormState,
  formatNumberWithoutDecimals,
} from '../utils/formUtils';
import {
  useCreateBenefitMutation,
  useUpdateBenefitMutation,
} from './useBenefitsQuery';

export const useBenefitForm = () => {
  // Form state
  const [formData, setFormData] = useState({
    benefitName: '',
    benefitType: 'Financial',
    componentType: 'earnings',
    category: 'Seniority Bonus',
    rateType: 'Flat Rate',
    cycle: 'MONTHLY',
    percentageValue: '',
    flatRateValue: '',
    salaryCap: '100000',
    customSalaryCap: '',
    taxCap: '',
    maxAmount: '',
    description: '',
    provider: '',
    isTaxable: true,
    isRoleBased: false,
    isDefault: true,
  });

  const [expiryDate, setExpiryDate] = useState<CalendarDate | null>(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [helpText, setHelpText] = useState('');
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [validationLimits, setValidationLimits] = useState<ValidationLimits>({
    minPercentage: 0,
    maxPercentage: 100,
    minFlatRate: 0,
    maxFlatRate: 1000000,
  });

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editBenefitId, setEditBenefitId] = useState<string | null>(null);

  // TanStack Query mutations
  const createBenefitMutation = useCreateBenefitMutation();
  const updateBenefitMutation = useUpdateBenefitMutation();

  // API state derived from mutations
  const isLoading =
    createBenefitMutation.isPending || updateBenefitMutation.isPending;
  const error = createBenefitMutation.error || updateBenefitMutation.error;
  const success =
    createBenefitMutation.isSuccess || updateBenefitMutation.isSuccess;

  // Update form data when category changes
  useEffect(() => {
    const categoryConfig = getCategoryConfig(formData.category);
    const limits = getCategoryLimits(formData.category);

    setFormData((prev) => ({
      ...prev,
      rateType: categoryConfig.rateType,
      cycle: categoryConfig.cycle,
      isTaxable: categoryConfig.isTaxable,
      description: categoryConfig.helpText,
    }));

    setHelpText(categoryConfig.helpText);
    setValidationLimits(limits);
  }, [formData.category]);

  // Update form field and clear validation errors
  const updateFormField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    }

    // Update validation limits and help text when category changes
    if (field === 'category') {
      const categoryConfig = getCategoryConfig(value);
      const limits = getCategoryLimits(value);
      setValidationLimits(limits);
      setHelpText(categoryConfig.helpText);
    }
  };

  // Reset form
  const resetForm = () => {
    const initialState = resetFormState();
    setFormData(initialState);
    setExpiryDate(null);
    setHelpText('');
    setValidationErrors({});
    setIsEditMode(false);
    setEditBenefitId(null);
  };

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setIsSubmitting(true);
    setValidationErrors({});

    try {
      // Validate form data
      const validationResult = await validateBenefitForm(
        formData as BenefitFormData,
        validationLimits
      );

      if (!validationResult.isValid) {
        setValidationErrors(validationResult.errors);
        return;
      }

      // Create payload
      const payload = createBenefitPayload({ ...formData, expiryDate });

      if (isEditMode && editBenefitId) {
        // Update existing benefit
        await updateBenefitMutation.mutateAsync({
          id: editBenefitId,
          data: payload,
        });
      } else {
        // Create new benefit
        await createBenefitMutation.mutateAsync(payload);
      }

      // Reset form and close slider on success
      resetForm();
      closeSlider();
    } catch (error) {
      console.error('Form submission error:', error);
      // Error handling is done in the mutation hooks
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open slider
  const openSlider = () => {
    setIsSliderOpen(true);
  };

  // Populate form for editing
  const populateFormForEdit = (benefit: any) => {
    console.log('🔵 Populating form for edit with benefit:', benefit);

    setIsEditMode(true);
    setEditBenefitId(benefit.uuid);

    // Map API benefit type to UI format
    const mapAPIBenefitTypeToUI = (apiType: string) => {
      switch (apiType) {
        case 'FINANCIAL':
          return 'Financial';
        case 'SERVICE':
          return 'Service';
        case 'REDEEMABLE':
          return 'Redeemable';
        default:
          return 'Financial';
      }
    };

    // Map API cycle to UI format
    const mapAPICycleToUI = (apiCycle: string) => {
      switch (apiCycle) {
        case 'DAILY':
          return 'Daily';
        case 'WEEKLY':
          return 'Weekly';
        case 'MONTHLY':
          return 'Monthly';
        case 'QUARTERLY':
          return 'Quarterly';
        case 'ANNUALLY':
          return 'Annually';
        case 'ONE_TIME':
          return 'OneTime';
        case 'NONE':
          return 'None';
        default:
          return 'Monthly';
      }
    };

    // Determine rate type based on benefit data
    // Check if the rate field contains a percentage indicator or if the value is small enough to be a percentage
    const determineRateType = (benefit: any) => {
      console.log('🔵 Determining rate type for:', {
        rate: benefit.rate,
        value: benefit.value,
      });

      // If rate exists and is a reasonable percentage value (1-100)
      if (benefit.rate && benefit.rate >= 1 && benefit.rate <= 100) {
        return 'Percentage';
      }

      // If value is very large, it's likely a flat rate
      if (benefit.value && benefit.value > 100) {
        return 'Flat Rate';
      }

      // Default to flat rate
      return 'Flat Rate';
    };

    // Determine salary cap value and if it's custom
    const determineSalaryCap = (salaryCap: number) => {
      const standardValues = ['100000', '200000', '300000', '500000'];
      const salaryCapString = formatNumberWithoutDecimals(salaryCap);

      if (standardValues.includes(salaryCapString)) {
        return {
          salaryCap: salaryCapString,
          customSalaryCap: '',
        };
      } else {
        return {
          salaryCap: 'Custom',
          customSalaryCap: salaryCapString,
        };
      }
    };

    const rateType = determineRateType(benefit);
    const salaryCapData = determineSalaryCap(benefit.salary_cap || 100000);

    console.log('🔵 Determined rate type:', rateType);
    console.log('🔵 Salary cap data:', salaryCapData);

    const formData = {
      benefitName: benefit.name || '',
      benefitType: mapAPIBenefitTypeToUI(benefit.type || 'FINANCIAL'),
      componentType: 'earnings', // Default to earnings, can be determined from category if needed
      category: benefit.category || 'Seniority Bonus',
      rateType: rateType,
      cycle: mapAPICycleToUI(benefit.cycle || 'MONTHLY'),
      percentageValue:
        rateType === 'Percentage'
          ? formatNumberWithoutDecimals(benefit.rate || '')
          : '',
      flatRateValue:
        rateType === 'Flat Rate'
          ? formatNumberWithoutDecimals(benefit.value || '')
          : '',
      salaryCap: salaryCapData.salaryCap,
      customSalaryCap: salaryCapData.customSalaryCap,
      taxCap: benefit.tax_cap
        ? formatNumberWithoutDecimals(benefit.tax_cap)
        : '',
      maxAmount: benefit.max_amount
        ? formatNumberWithoutDecimals(benefit.max_amount)
        : '',
      description: benefit.description || '',
      provider: benefit.provider || '',
      isTaxable: benefit.is_taxable ?? true,
      isRoleBased: benefit.role_based ?? false,
      isDefault: benefit.is_default ?? true,
    };

    console.log('🔵 Setting form data:', formData);
    setFormData(formData);

    // Set expiry date if exists
    if (benefit.expires_at) {
      // Convert date string to CalendarDate if needed
      // setExpiryDate(new CalendarDate(benefit.expires_at));
    }

    // Update validation limits based on category
    const category = benefit.category || 'Seniority Bonus';
    const categoryConfig = getCategoryConfig(category);
    const limits = getCategoryLimits(category);
    setValidationLimits(limits);
    setHelpText(categoryConfig.helpText);
  };

  // Close slider - handle both boolean and no parameter
  const closeSlider = (value?: boolean) => {
    setIsSliderOpen(value ?? false);
    // Reset edit mode when closing
    if (value === false || value === undefined) {
      setIsEditMode(false);
      setEditBenefitId(null);
    }
  };

  return {
    // Form state
    formData,
    expiryDate,
    isSliderOpen,
    isSubmitting,
    helpText,
    validationErrors,
    validationLimits,

    // Edit mode state
    isEditMode,
    editBenefitId,

    // Form actions
    updateFormField,
    setExpiryDate,
    handleSubmit,
    resetForm,
    openSlider,
    closeSlider,
    populateFormForEdit,

    // API state
    isLoading,
    error,
    success,
  };
};
