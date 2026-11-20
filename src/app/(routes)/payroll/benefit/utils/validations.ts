import * as Yup from 'yup';

export interface BenefitFormData {
  benefitName: string;
  benefitType: string;
  componentType: string;
  category: string;
  rateType: string;
  cycle: string;
  percentageValue: string;
  flatRateValue: string;
  customSalaryCap: string;
  taxCap: string;
  maxAmount: string;
  description: string;
  provider: string;
  isTaxable: boolean;
  isRoleBased: boolean;
  isDefault: boolean;
  salaryCap: string;
}

export interface ValidationLimits {
  minPercentage: number;
  maxPercentage: number;
  minFlatRate: number;
  maxFlatRate: number;
}

export const createBenefitValidationSchema = (limits: ValidationLimits) => {
  return Yup.object().shape({
    benefitName: Yup.string()
      .required('Benefit name is required')
      .min(2, 'Benefit name must be at least 2 characters')
      .max(100, 'Benefit name cannot exceed 100 characters'),

    benefitType: Yup.string()
      .required('Benefit type is required')
      .oneOf(['Financial', 'Service', 'Redeemable'], 'Invalid benefit type'),

    componentType: Yup.string()
      .required('Component type is required')
      .oneOf(['earnings', 'deductions'], 'Invalid component type'),

    category: Yup.string().required('Category is required'),

    rateType: Yup.string()
      .required('Rate type is required')
      .oneOf(['Percentage', 'Flat Rate'], 'Invalid rate type'),

    cycle: Yup.string().required('Cycle is required'),

    percentageValue: Yup.string().when('rateType', {
      is: 'Percentage',
      then: (schema) =>
        schema
          .required('Percentage value is required')
          .test('is-valid-number', 'Please enter a valid number', (value) => {
            if (!value) return false;
            const numValue = parseFloat(value);
            return !isNaN(numValue);
          })
          .test(
            'min-percentage',
            `Value must be at least ${limits.minPercentage}%`,
            (value) => {
              if (!value) return false;
              const numValue = parseFloat(value);
              return numValue >= limits.minPercentage;
            }
          )
          .test(
            'max-percentage',
            `Value cannot exceed ${limits.maxPercentage}%`,
            (value) => {
              if (!value) return false;
              const numValue = parseFloat(value);
              return numValue <= limits.maxPercentage;
            }
          ),
      otherwise: (schema) => schema.notRequired(),
    }),

    flatRateValue: Yup.string().when('rateType', {
      is: 'Flat Rate',
      then: (schema) =>
        schema
          .required('Rate amount is required')
          .test('is-valid-number', 'Please enter a valid number', (value) => {
            if (!value) return false;
            const numValue = parseFloat(value.replace(/[^0-9.]/g, ''));
            return !isNaN(numValue);
          })
          .test(
            'min-flat-rate',
            `Value must be at least XAF ${limits.minFlatRate.toLocaleString()}`,
            (value) => {
              if (!value) return false;
              const numValue = parseFloat(value.replace(/[^0-9.]/g, ''));
              return numValue >= limits.minFlatRate;
            }
          )
          .test(
            'max-flat-rate',
            `Value cannot exceed XAF ${limits.maxFlatRate.toLocaleString()}`,
            (value) => {
              if (!value) return false;
              const numValue = parseFloat(value.replace(/[^0-9.]/g, ''));
              return numValue <= limits.maxFlatRate;
            }
          ),
      otherwise: (schema) => schema.notRequired(),
    }),

    customSalaryCap: Yup.string().when('salaryCap', {
      is: 'Custom',
      then: (schema) =>
        schema
          .required('Custom salary cap is required')
          .test(
            'is-valid-number',
            'Please enter a valid salary cap amount',
            (value) => {
              if (!value) return false;
              const numValue = parseFloat(value.replace(/[^0-9.]/g, ''));
              return !isNaN(numValue) && numValue > 0;
            }
          ),
      otherwise: (schema) => schema.notRequired(),
    }),

    taxCap: Yup.string().when('isTaxable', {
      is: true,
      then: (schema) =>
        schema
          .test(
            'is-valid-number',
            'Please enter a valid tax cap amount',
            (value) => {
              if (!value || value.trim() === '') return true; // Optional field
              const numValue = parseFloat(value.replace(/[^0-9.]/g, ''));
              return !isNaN(numValue) && numValue >= 0;
            }
          )
          .test(
            'tax-cap-validation',
            'Tax cap cannot exceed the rate amount',
            function (value) {
              if (!value || value.trim() === '') return true; // Optional field

              const { rateType, flatRateValue } = this.parent;
              const numValue = parseFloat(value.replace(/[^0-9.]/g, ''));

              if (rateType === 'Flat Rate' && flatRateValue) {
                const flatRateVal = parseFloat(
                  flatRateValue.replace(/[^0-9.]/g, '')
                );
                if (!isNaN(flatRateVal) && numValue > flatRateVal) {
                  return false;
                }
              }

              return true;
            }
          ),
      otherwise: (schema) => schema.notRequired(),
    }),

    maxAmount: Yup.string().test(
      'is-valid-number',
      'Please enter a valid maximum amount',
      (value) => {
        if (!value || value.trim() === '') return true; // Optional field
        const numValue = parseFloat(value.replace(/[^0-9.]/g, ''));
        return !isNaN(numValue) && numValue >= 0;
      }
    ),

    description: Yup.string()
      .required('Description is required')
      .max(500, 'Description cannot exceed 500 characters'),

    provider: Yup.string()
      .required('Provider is required')
      .min(2, 'Provider must be at least 2 characters')
      .max(100, 'Provider cannot exceed 100 characters'),
    salaryCap: Yup.string().required('Salary cap is required'),
    isTaxable: Yup.boolean().required(),
    isRoleBased: Yup.boolean().required(),
    isDefault: Yup.boolean().required(),
  });
};

export const validateBenefitForm = async (
  formData: BenefitFormData,
  limits: ValidationLimits
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
  const schema = createBenefitValidationSchema(limits);

  try {
    await schema.validate(formData, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      const errors: Record<string, string> = {};
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
};
