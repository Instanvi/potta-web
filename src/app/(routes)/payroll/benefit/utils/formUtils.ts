import { BenefitType, CycleType, BenefitPayload } from './types';
import {
  BENEFIT_CATEGORIES,
  DEFAULT_LIMITS,
  BENEFIT_CATEGORY_ENUM,
  getCategoryConfigByEnum,
} from '../constants/benefitCategories';
import { ValidationLimits } from './validations';

export const mapBenefitTypeToAPI = (type: string): BenefitType => {
  switch (type) {
    case 'Financial':
      return 'FINANCIAL';
    case 'Service':
      return 'SERVICE';
    case 'Redeemable':
      return 'REDEEMABLE';
    default:
      return 'FINANCIAL';
  }
};

export const mapCycleToAPI = (cycleValue: string): CycleType => {
  switch (cycleValue) {
    case 'Daily':
      return 'DAILY';
    case 'Weekly':
      return 'WEEKLY';
    case 'Monthly':
      return 'MONTHLY';
    case 'Quarterly':
      return 'QUARTERLY';
    case 'Annually':
      return 'ANNUALLY';
    case 'OneTime':
      return 'ONE_TIME';
    case 'None':
      return 'NONE';
    default:
      return 'MONTHLY';
  }
};

export const getSalaryCapValue = (
  salaryCap: string,
  customSalaryCap: string
): number => {
  if (salaryCap === 'Custom') {
    return customSalaryCap
      ? parseFloat(customSalaryCap.replace(/[^0-9.]/g, ''))
      : 100000; // Default to 100,000 if no custom value
  } else {
    return parseFloat(salaryCap);
  }
};

export const getCategoryLimits = (category: string): ValidationLimits => {
  const categoryConfig = BENEFIT_CATEGORIES[category];

  if (!categoryConfig) {
    return DEFAULT_LIMITS;
  }

  return {
    minPercentage: categoryConfig.minPercentage ?? DEFAULT_LIMITS.minPercentage,
    maxPercentage: categoryConfig.maxPercentage ?? DEFAULT_LIMITS.maxPercentage,
    minFlatRate: categoryConfig.minFlatRate ?? DEFAULT_LIMITS.minFlatRate,
    maxFlatRate: categoryConfig.maxFlatRate ?? DEFAULT_LIMITS.maxFlatRate,
  };
};

export const getCategoryConfig = (category: string) => {
  return (
    BENEFIT_CATEGORIES[category] || {
      rateType: 'Flat Rate' as const,
      cycle: 'MONTHLY',
      isTaxable: true,
      helpText: '',
    }
  );
};

export const createBenefitPayload = (formData: {
  benefitName: string;
  benefitType: string;
  componentType: string;
  category: string;
  rateType: string;
  cycle: string;
  percentageValue: string;
  flatRateValue: string;
  salaryCap: string;
  customSalaryCap: string;
  taxCap: string;
  maxAmount: string;
  description: string;
  provider: string;
  isTaxable: boolean;
  isRoleBased: boolean;
  isDefault: boolean;
  expiryDate: any;
}): BenefitPayload => {
  const salaryCap = getSalaryCapValue(
    formData.salaryCap,
    formData.customSalaryCap
  );

  // Get the category configuration to extract the enum value
  const categoryConfig = BENEFIT_CATEGORIES[formData.category];
  const categoryEnum =
    categoryConfig?.enumValue || BENEFIT_CATEGORY_ENUM.BASE_SALARY;
  const isPercentage = formData.rateType === 'Percentage';

  // Calculate values based on rate type
  const value = isPercentage
    ? parseFloat(formData.percentageValue) || 0
    : parseFloat(formData.flatRateValue.replace(/[^0-9.]/g, '')) || 0;

  // For percentage rates, store the percentage value as-is
  // For flat rates, store the amount as-is
  const rateValue = value;

  return {
    name: formData.benefitName,
    description: formData.description || '',
    type: mapBenefitTypeToAPI(formData.benefitType),
    componentType: categoryEnum, // Send the enum value to backend
    value: value,
    cycle: mapCycleToAPI(formData.cycle),
    is_taxable: formData.isTaxable,
    tax_cap: formData.taxCap
      ? parseFloat(formData.taxCap.replace(/[^0-9.]/g, ''))
      : undefined,
    salary_cap: salaryCap,
    max_amount: formData.maxAmount
      ? parseFloat(formData.maxAmount.replace(/[^0-9.]/g, ''))
      : undefined,
    role_based: formData.isRoleBased,
    eligible_roles: formData.isRoleBased ? [] : undefined,
    is_default: formData.isDefault,
    rate: rateValue,
    provider: formData.provider || '',
    expires_at: formData.expiryDate
      ? new Date(formData.expiryDate.toString()).toISOString()
      : undefined,

    // Additional DTO fields
    isPercentage: isPercentage,
    percentageOfBase: isPercentage ? value : undefined,
    minValue: categoryConfig?.minFlatRate || categoryConfig?.minPercentage || 0,
    maxValue:
      categoryConfig?.maxFlatRate || categoryConfig?.maxPercentage || 1000000,
    minimumWageCompliant: categoryEnum === BENEFIT_CATEGORY_ENUM.BASE_SALARY,
    yearsOfServiceMin:
      categoryEnum === BENEFIT_CATEGORY_ENUM.SENIORITY_BONUS ? 2 : undefined,
    yearsOfServiceMax:
      categoryEnum === BENEFIT_CATEGORY_ENUM.SENIORITY_BONUS ? 20 : undefined,
    isNeverTaxable: !formData.isTaxable,
  };
};

// Utility functions for formatting numbers without unnecessary decimals
export const formatNumberWithoutDecimals = (value: string | number): string => {
  if (!value || value === '' || value === 0) return '0';

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0';

  // If the number is a whole number, don't show decimals
  if (numValue % 1 === 0) {
    return numValue.toString();
  }

  // Otherwise, show up to 2 decimal places but remove trailing zeros
  return numValue.toFixed(2).replace(/\.?0+$/, '');
};

export const formatCurrencyWithoutDecimals = (
  value: string | number
): string => {
  if (!value || value === '' || value === 0) return 'XAF 0';

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return 'XAF 0';

  // Format with locale but remove unnecessary decimals
  const formatted = numValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return `XAF ${formatted}`;
};

export const formatPercentageWithoutDecimals = (
  value: string | number
): string => {
  if (!value || value === '' || value === 0) return '0%';

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0%';

  // If the number is a whole number, don't show decimals
  if (numValue % 1 === 0) {
    return `${numValue}%`;
  }

  // Otherwise, show up to 2 decimal places but remove trailing zeros
  return `${numValue.toFixed(2).replace(/\.?0+$/, '')}%`;
};

export const resetFormState = () => ({
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
  expiryDate: null,
});

export const parseNumericValue = (value: string): number => {
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
  return isNaN(numericValue) ? 0 : numericValue;
};
