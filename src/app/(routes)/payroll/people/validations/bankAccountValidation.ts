import * as yup from 'yup';

export const bankAccountValidationSchema = yup.object().shape({
  account_holder_name: yup
    .string()
    .required('Account holder name is required')
    .min(2, 'Account holder name must be at least 2 characters')
    .max(100, 'Account holder name cannot exceed 100 characters'),

  bank_name: yup
    .string()
    .required('Bank name is required')
    .min(2, 'Bank name must be at least 2 characters')
    .max(100, 'Bank name cannot exceed 100 characters'),

  account_number: yup
    .string()
    .required('Account number is required')
    .min(5, 'Account number must be at least 5 characters')
    .max(30, 'Account number cannot exceed 30 characters')
    .matches(/^[0-9]+$/, 'Account number must contain only numbers'),

  routing_number: yup
    .string()
    .required('Routing number is required')
    .min(5, 'Routing number must be at least 5 characters')
    .max(20, 'Routing number cannot exceed 20 characters')
    .matches(/^[0-9]+$/, 'Routing number must contain only numbers'),

  currency: yup
    .string()
    .required('Currency is required')
    .oneOf(
      ['USD', 'EUR', 'GBP', 'XAF', 'NGN', 'KES', 'GHS'],
      'Please select a valid currency'
    ),

  account_type: yup
    .string()
    .required('Account type is required')
    .oneOf(['Checking', 'Savings'], 'Please select a valid account type'),

  country: yup
    .string()
    .required('Country is required')
    .min(2, 'Country must be at least 2 characters')
    .max(50, 'Country cannot exceed 50 characters'),

  is_primary: yup.boolean().optional().default(true),

  verified: yup.boolean().optional().default(false),

  person_id: yup.string().optional(),
});

export type BankAccountFormData = yup.InferType<
  typeof bankAccountValidationSchema
>;
