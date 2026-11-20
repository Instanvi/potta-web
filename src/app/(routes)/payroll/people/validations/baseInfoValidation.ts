import * as yup from 'yup';

export const baseInfoValidationSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters'),

  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters'),

  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),

  phoneNumber: yup
    .string()
    .required('Phone number is required')
    .min(8, 'Phone number must be at least 8 characters'),

  gender: yup
    .string()
    .required('Gender is required')
    .oneOf(['Male', 'Female', 'Other'], 'Please select a valid gender'),

  birthday: yup
    .string()
    .required('Birthday is required')
    .test('age', 'Employee must be at least 16 years old', function (value) {
      if (!value) return false;
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        return age - 1 >= 16;
      }
      return age >= 16;
    }),
  roleName: yup.string().required('Job Title / Role is required'),
  employmentType: yup.string().required('Employment type is required'),

  employmentDate: yup
    .string()
    .required('Employment date is required')
    .test(
      'future-date',
      'Employment date cannot be in the future',
      function (value) {
        if (!value) return false;
        const today = new Date();
        const employmentDate = new Date(value);
        return employmentDate <= today;
      }
    ),

  maritalStatus: yup.string().required('Marital status is required'),

  nationalId: yup
    .string()
    .required('National ID is required')
    .min(5, 'National ID must be at least 5 characters'),

  taxPayerNumber: yup
    .string()
    .required('Tax payer number is required')
    .min(5, 'Tax payer number must be at least 5 characters'),

  employeeId: yup.string().optional(),

  jobTitle: yup.string().optional(),
});

export type BaseInfoFormData = yup.InferType<typeof baseInfoValidationSchema>;
