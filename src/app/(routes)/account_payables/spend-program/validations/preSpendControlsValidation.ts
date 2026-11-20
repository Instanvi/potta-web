import * as yup from 'yup';

export const preSpendControlsValidationSchema = yup.object().shape({
  allowEmployees: yup
    .string()
    .required('Please select who can request from this program')
    .oneOf(['all', 'specific'], 'Invalid employee access option'),

  selectedEmployees: yup.array().when('allowEmployees', {
    is: 'specific',
    then: (schema) =>
      schema
        .min(1, 'Please select at least one employee')
        .required('Please select specific employees'),
    otherwise: (schema) => schema.notRequired(),
  }),

  approver: yup
    .string()
    .required('Please select who needs to approve requests')
    .min(1, 'Please select an approver'),

  selectedApprovers: yup.array().when('approver', {
    is: 'custom',
    then: (schema) =>
      schema
        .min(1, 'Please select at least one approver role')
        .required('Please select custom approvers'),
    otherwise: (schema) => schema.notRequired(),
  }),

  paymentMethod: yup
    .string()
    .required('Please select a default payment method')
    .oneOf(
      ['purchase_order', 'credit_card', 'bank_transfer'],
      'Invalid payment method'
    ),

  canChangePayment: yup
    .string()
    .required('Please select if payment method can be changed')
    .oneOf(['yes', 'no'], 'Invalid option'),

  approvalPolicy: yup
    .string()
    .required('Please select an approval policy')
    .min(1, 'Please select an approval policy'),
});

export type PreSpendControlsFormData = yup.InferType<
  typeof preSpendControlsValidationSchema
>;
