import * as yup from 'yup';

// Validation schema
export const shiftValidationSchema = yup.object({
  name: yup
    .string()
    .required('Shift name is required')
    .min(2, 'Shift name must be at least 2 characters'),
  startTime: yup.string().required('Start time is required'),
  endTime: yup.string().required('End time is required'),
  employeeId: yup.string().when('shiftType', {
    is: 'unavailable',
    then: (schema) => schema.optional(),
    otherwise: (schema) => schema.required('Employee is required'),
  }),
  startDate: yup.string().required('Start date is required'),
  breakMinutes: yup
    .number()
    .min(0, 'Break minutes cannot be negative')
    .max(120, 'Break minutes cannot exceed 120')
    .required('Break minutes is required'),
  selectedRoles: yup.array().min(1, 'At least one role must be selected'),
  recurrence: yup
    .object()
    .test('at-least-one-day', 'At least one day must be selected', (value) =>
      Object.values(value).some((day) => day === true)
    ),
  color: yup.string().required('Color is required'),
});
