import * as yup from 'yup';

export const reimbursementSchema = yup.object({
  employeeId: yup.string().required('Employee is required'),
  amount: yup
    .number()
    .positive('Amount must be positive')
    .required('Amount is required')
    .min(1, 'Amount must be at least 1'),
  type: yup.string().required('Type is required'),
  expenseType: yup.string().required('Expense type is required'),
  description: yup
    .string()
    .required('Description is required')
    .max(500, 'Description cannot exceed 500 characters'),
  date: yup.date().optional(),
});
