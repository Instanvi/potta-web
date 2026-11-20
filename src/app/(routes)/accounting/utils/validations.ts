import { Currency } from 'lucide-react';
import * as yup from 'yup';
const currencyOptions = ['USD', 'EUR', 'XAF'];
const statusOptions = ['active', 'inactive'];
const accountSchema = yup.object().shape({
  code: yup.string().required('Code is required'),
  name: yup.string().required('Name is required'),
  type: yup.string().required('Account type is required'),
  parentCode: yup.string().optional(),
  currency: yup
    .string()
    .required('currency is required')
    .oneOf([...currencyOptions], 'Invalid discount type'),
  openingBalance: yup.number().typeError('Must be a number').optional(),
});

const accountUpdateSchema = yup.object().shape({
  code: yup.string().required('Code is required'),
  name: yup.string().required('Name is required'),
  type: yup.string().required('Account type is required'),
  parentCode: yup.string().optional(),
  currency: yup
    .string()
    .required('currency is required')
    .oneOf([...currencyOptions], 'Invalid discount type'),
  openingBalance: yup.number().typeError('Must be a number').optional(),
  status: yup
    .string()
    .required('Status is required')
    .oneOf([...statusOptions], 'Invalid status type'),
});

export type accountPayload = yup.InferType<typeof accountSchema>;

export type accountUpdatePayload = yup.InferType<typeof accountUpdateSchema>;
