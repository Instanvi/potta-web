import * as yup from 'yup';

export const createDeductionSchema = yup.object().shape({
  name: yup.string().required('Deduction name is required'),
  description: yup.string().notRequired(),
  type: yup.string().required('Type is required'),
  mode: yup.string().required('Mode is required'),
  value: yup
    .number()
    .typeError('Value must be a number')
    .min(0, 'Value cannot be negative'),
  brackets: yup
    .array()
    .of(
      yup.object().shape({
        min: yup
          .number()
          .typeError('Min must be a number')
          .required('Min is required')
          .min(0, 'Min cannot be negative'),
        max: yup
          .number()
          .typeError('Max must be a number')
          .required('Max is required')
          .min(0, 'Max cannot be negative'),
        rate: yup
          .number()
          .typeError('Rate must be a number')
          .required('Rate is required')
          .min(0, 'Rate cannot be negative'),
      })
    )
    .min(1, 'At least one bracket is required'),
  is_tax: yup.boolean().required(),
  applies_to: yup.string().required('Applies to is required'),
  is_active: yup.boolean().required(),
  is_editable: yup.boolean().required(),
});
