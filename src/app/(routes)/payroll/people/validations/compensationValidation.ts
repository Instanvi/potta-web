import * as yup from 'yup';

export const compensationValidationSchema = yup.object().shape({
  hourlyRate: yup
    .number()
    .nullable()
    .optional()
    .min(0.01, 'Hourly rate must be greater than 0'),

  salary: yup
    .number()
    .nullable()
    .optional()
    .min(0.01, 'Salary must be greater than 0'),

  paymentFrequency: yup
    .string()
    .required('Payment frequency is required')
    .oneOf(
      ['Weekly', 'Bi-Weekly', 'Semi-Monthly', 'Monthly'],
      'Please select a valid payment frequency'
    ),

  eligibleForTips: yup.boolean().optional().default(false),

  eligibleForOvertime: yup.boolean().optional().default(false),

  paid_time_off: yup.array().of(yup.string()).optional().default([]),

  personId: yup.string().optional(),
}).test(
  'compensation-method',
  'Either hourly rate or salary must be provided',
  function (value) {
    const { hourlyRate, salary } = value;
    if ((!hourlyRate || hourlyRate === 0) && (!salary || salary === 0)) {
      return this.createError({
        path: 'hourlyRate',
        message: 'Either hourly rate or salary must be provided',
      });
    }
    return true;
  }
);

export type CompensationFormData = yup.InferType<
  typeof compensationValidationSchema
>;
