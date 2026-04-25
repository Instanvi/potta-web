import * as yup from 'yup';

export const createBankAccountSchema = yup.object().shape({
  account_name: yup.string().required('Account name is required'),
  account_type: yup
    .string()
    .oneOf(['Bank_Account', 'Cash_on_Hand', 'Debit_Card', 'Credit_Card'])
    .required('Account type is required'),
  currency: yup.string().required('Currency is required'),
  bank_name: yup.string().when('account_type', {
    is: 'Bank_Account',
    then: (schema) => schema.required('Bank name is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  account_number: yup.string().when('account_type', {
    is: 'Bank_Account',
    then: (schema) => schema.required('Account number is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  sort_code: yup.string().when('account_type', {
    is: 'Bank_Account',
    then: (schema) => schema.notRequired(),
    otherwise: (schema) => schema.notRequired(),
  }),
  iban: yup.string().when('account_type', {
    is: 'Bank_Account',
    then: (schema) => schema.notRequired(),
    otherwise: (schema) => schema.notRequired(),
  }),
  card_number: yup.string().when('account_type', {
    is: (val: string) => val === 'Debit_Card' || val === 'Credit_Card',
    then: (schema) => schema.required('Card number is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  card_type: yup.string().when('account_type', {
    is: (val: string) => val === 'Debit_Card' || val === 'Credit_Card',
    then: (schema) => schema.required('Card type is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  expiration_date: yup.string().when('account_type', {
    is: (val: string) => val === 'Debit_Card' || val === 'Credit_Card',
    then: (schema) => schema.required('Expiration date is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  cvv: yup.string().when('account_type', {
    is: (val: string) => val === 'Debit_Card' || val === 'Credit_Card',
    then: (schema) => schema.required('CVV is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  bank_representative_name: yup.string().when('account_type', {
    is: (val: string) => val === 'Debit_Card' || val === 'Credit_Card',
    then: (schema) => schema.notRequired(),
    otherwise: (schema) => schema.notRequired(),
  }),
  representative_contact: yup.string().when('account_type', {
    is: (val: string) => val === 'Debit_Card' || val === 'Credit_Card',
    then: (schema) => schema.notRequired(),
    otherwise: (schema) => schema.notRequired(),
  }),
  is_active: yup.boolean().required(),
  ledger_account_id: yup.string().required('Ledger account ID is required'),
});
