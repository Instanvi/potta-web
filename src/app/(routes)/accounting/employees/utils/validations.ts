import * as yup from 'yup';

export const createEmployeeSchema = yup.object({
  first_name: yup.string().trim().required('First name is required'),
  last_name: yup.string().trim().required('Last name is required'),
  email: yup.string().trim().email('Invalid email').required('Email is required'),
  job_title: yup.string().trim().default(''),
  status: yup
    .mixed<'active' | 'inactive' | 'terminated'>()
    .oneOf(['active', 'inactive', 'terminated'])
    .default('active'),
});

export type CreateEmployeePayload = yup.InferType<typeof createEmployeeSchema>;
