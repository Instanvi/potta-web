import * as yup from 'yup';

export const scheduleValidationSchema = yup.object().shape({
  personId: yup
    .string()
    .optional(),
  
  payScheduleId: yup
    .string()
    .required('Pay schedule is required'),
  
  payCycleName: yup
    .string()
    .required('Pay cycle name is required')
    .min(2, 'Pay cycle name must be at least 2 characters')
    .max(50, 'Pay cycle name cannot exceed 50 characters'),
  
  firstPayDate: yup
    .string()
    .required('First pay date is required')
    .test('valid-date', 'Please enter a valid date', function(value) {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .test('future-date', 'First pay date should be in the future', function(value) {
      if (!value) return false;
      const today = new Date();
      const payDate = new Date(value);
      today.setHours(0, 0, 0, 0);
      payDate.setHours(0, 0, 0, 0);
      return payDate >= today;
    }),
  
  endPayDate: yup
    .string()
    .optional()
    .nullable()
    .test('valid-date', 'Please enter a valid date', function(value) {
      if (!value) return true; // Optional field
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .test('after-first-pay-date', 'End pay date must be after first pay date', function(value) {
      if (!value) return true; // Optional field
      const firstPayDate = this.parent.firstPayDate;
      if (!firstPayDate) return true;
      
      const endDate = new Date(value);
      const firstDate = new Date(firstPayDate);
      return endDate > firstDate;
    }),
  
  effectiveDate: yup
    .string()
    .required('Effective date is required')
    .test('valid-date', 'Please enter a valid date', function(value) {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .test('not-future-date', 'Effective date cannot be in the future', function(value) {
      if (!value) return false;
      const today = new Date();
      const effectiveDate = new Date(value);
      today.setHours(23, 59, 59, 999);
      return effectiveDate <= today;
    }),
});

export type ScheduleFormData = yup.InferType<typeof scheduleValidationSchema>; 