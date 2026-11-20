import * as yup from 'yup';

const addressSchema = yup.object().shape({
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  state: yup.string(),
  country: yup.string().required('Country is required'),
  postalCode: yup.string(),
  latitude: yup.number().typeError('Must be a number'),
  longitude: yup.number().typeError('Must be a number'),
});
const VendorStatusEnum = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'ACTIVE',
  'INACTIVE',
] as const;
const VendorTypeEnum = ['individual', 'company'] as const;
const VendorCurrencyEnum = ['EUR', 'USD', 'XAF'] as const;
const VendorClassificationEnum = ['Supplier', 'Service Provider'] as const;
const VendorIndustryEnum = [
  'Technology',
  'Manufacturing',
  'Retail',
  'Healthcare',
  'Finance',
  'Education',
  'Construction',
  'Transportation',
  'Food & Beverage',
  'Other',
] as const;
const VendorPaymentMethodEnum = [
  'CREDIT_CARD',
  'BANK_TRANSFER',
  'ACH_TRANSFER',
  'MOBILE_MONEY',
  'DIGITAL_WALLET',
  'CASH',
  'CREDIT',
  'OTHER',
] as const;
const URL =
  /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/gm;
const phoneNumberRegex = /^\+\d{1,4}\s?\d{6,14}$/;

// Payment method validation schema
export const paymentMethodSchema = yup.object().shape({
  paymentMethodType: yup
    .string()
    .oneOf([...VendorPaymentMethodEnum], 'Invalid payment method type')
    .required('Payment method type is required'),
  accountName: yup.string().when('paymentMethodType', {
    is: (val: string) => val !== 'MOBILE_MONEY',
    then: (schema) => schema.required('Account name is required'),
    otherwise: (schema) => schema.nullable(),
  }),
  accountNumber: yup.string().when('paymentMethodType', {
    is: (val: string) =>
      ['BANK_TRANSFER', 'ACH_TRANSFER', 'CREDIT_CARD', 'CREDIT'].includes(val),
    then: (schema) =>
      schema.required('Account number is required for this payment type'),
    otherwise: (schema) => schema.nullable(),
  }),
  bankName: yup.string().when('paymentMethodType', {
    is: (val: string) => ['BANK_TRANSFER', 'ACH_TRANSFER'].includes(val),
    then: (schema) =>
      schema.required('Bank name is required for bank transfers'),
    otherwise: (schema) => schema.nullable(),
  }),
  phoneNumber: yup.string().when('paymentMethodType', {
    is: 'MOBILE_MONEY',
    then: (schema) =>
      schema.required('Phone number is required for mobile money'),
    otherwise: (schema) => schema.nullable(),
  }),
  walletId: yup.string().when('paymentMethodType', {
    is: 'DIGITAL_WALLET',
    then: (schema) =>
      schema.required('Wallet ID is required for digital wallet'),
    otherwise: (schema) => schema.nullable(),
  }),
  dailyLimit: yup
    .number()
    .typeError('Must be a number')
    .min(0, 'Daily limit must be positive'),
  monthlyLimit: yup
    .number()
    .typeError('Must be a number')
    .min(0, 'Monthly limit must be positive'),
  isPrimary: yup.boolean().default(false),
  isActive: yup.boolean().default(true),
  notes: yup.string().nullable(),
});

export const vendorSchema = yup.object().shape({
  name: yup.string().required('Vendor name is required'),
  type: yup
    .string()
    .oneOf([...VendorTypeEnum], 'Invalid type')
    .required('Type is required'),
  contactPerson: yup.string(),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(phoneNumberRegex, 'Invalid phone number. Example: +237689393939'),
  address: addressSchema,
  taxID: yup.string(),
  paymentTerms: yup.string(),
  website: yup.string(),
  accountDetails: yup.string(),
  currency: yup
    .string()
    .oneOf([...VendorCurrencyEnum], 'currency')
    .required('Currency is required'),
  openingBalance: yup.number().typeError('Must be a number'),
  classification: yup
    .string()
    .oneOf([...VendorClassificationEnum], 'Invalid Classification')
    .required('Classification is required'),
  industry: yup.string().oneOf([...VendorIndustryEnum], 'Invalid industry'),
  creditLimit: yup
    .number()
    .typeError('Must be a number')
    .min(0, 'Credit limit must be positive'),
  
  notes: yup.string(),
  // KYC initialization option
  initializeKYC: yup.boolean().default(false),
});

export const updateVendorSchema = yup.object().shape({
  name: yup.string().required('Vendor name is required'),
  type: yup
    .string()
    .oneOf([...VendorTypeEnum], 'Invalid type')
    .required('Type is required'),
  contactPerson: yup.string().required('Contact person is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(phoneNumberRegex, 'Invalid phone number. Example: +237689393939'),
  address: addressSchema,
  taxID: yup.string().nullable(),
  paymentTerms: yup.string().nullable(),
  paymentMethod: yup
    .string()
    .oneOf([...VendorPaymentMethodEnum], 'Invalid payment method')
    .nullable(),
  website: yup.string().nullable(),
  accountDetails: yup.string().nullable(),
  currency: yup
    .string()
    .oneOf([...VendorCurrencyEnum], 'currency')
    .required('Currency is required'),
  openingBalance: yup.number().typeError('Must be a number'),
  classification: yup
    .string()
    .oneOf([...VendorClassificationEnum], 'Invalid Classification')
    .required('Classification is required'),
  industry: yup
    .string()
    .oneOf([...VendorIndustryEnum], 'Invalid industry')
    .nullable(),
  creditLimit: yup
    .number()
    .typeError('Must be a number')
    .min(0, 'Credit limit must be positive')
    .nullable(),
  notes: yup.string().nullable(),
  status: yup
    .string()
    .oneOf([...VendorStatusEnum], 'Invalid Status')
    .required('Status is required'),
});

export type UpdateVendorPayload = yup.InferType<typeof updateVendorSchema>;
export type VendorPayload = yup.InferType<typeof vendorSchema>;
