import * as yup from 'yup';

export const lineItemValidationSchema = yup.object().shape({
  description: yup.string().required('Description is required'), // Required string
  quantity: yup
    .number()
    .required('Quantity is required')
    .positive('Quantity must be positive')
    .integer('Quantity must be an integer'), // Positive integer
  discountCap: yup
    .number()
    .required('Discount cap is required')
    .positive('Discount cap must be positive'), // Positive number
  discountType: yup
    .string()
    .required('Discount type is required')
    .oneOf(['PercentageWithCap'], 'Invalid discount type'), // Specific string value
  unitPrice: yup
    .number()
    .required('Unit price is required')
    .positive('Unit price must be positive'), // Positive number
  taxRate: yup
    .number()
    .required('Tax rate is required')
    .positive('Tax rate must be positive'), // Positive number
  discountRate: yup
    .number()
    .required('Discount rate is required')
    .positive('Discount rate must be positive'), // Positive number
  paymentTerms: yup.string().required('Payment terms are required'), // Required string
  paymentMethod: yup
    .string()
    .required('Payment method is required')
    .oneOf(['ACH Transfer'], 'Invalid payment method'), // Specific string value
  paymentReference: yup.string().required('Payment reference is required'), // Required string
  productId: yup.string().optional().uuid('Product ID must be a valid UUID'), // UUID validation
  salesReceiptId: yup
    .string()
    .optional()
    .uuid('Sales receipt ID must be a valid UUID'), // UUID validation
});

export const invoiceSchema = yup.object().shape({
  customerId: yup.string().uuid().required(),
  currency: yup.string().oneOf(['XAF']).required('Currency is required'),
  invoiceType: yup
    .string()
    .oneOf(['Invoice'], 'must be a valid type')
    .required('invoice type is required'),
  notes: yup.string().required('note is required'),
  paymentTerms: yup.string().required('the payment term is required'),
  paymentMethod: yup
    .string()
    .oneOf(['ACH Transfer'], 'must be a valid payment method')
    .required('Payment method is required'),
  issuedDate: yup
    .date()
    .typeError('must be a valid date')
    .required('issued date is required'),
  dueDate: yup
    .date()
    .typeError('must be a valid date')
    .required('due date is required'),
  invoiceTotal: yup.number().required('invoice total is required'),
  invoiceNumber: yup.string().required('invoice number is required'),
  taxRate: yup
    .number()
    .typeError('must be a number')
    .required('Tax rate is required'),
  taxAmount: yup
    .number()
    .typeError('must be a number')
    .required('Tax amount is required'),
  billingAddress: yup.string().required('billing address is required'),
  shippingAddress: yup.string().required('shipping address is required'),
  status: yup
    .string()
    .oneOf(['Overdue'], 'must be a valid status')
    .required('status is required'),
  paymentReference: yup.string().required('payment reference is required'),
  lineItems: yup.array().of(lineItemValidationSchema).optional(),
});

export const customerValidationSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'), // Required string
  lastName: yup.string().required('Last name is required'), // Required string
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'), // Valid email format
  phone: yup
    .string()
    .min(9, 'Phone numbers must be atleast 9 characters')
    .matches(/^\d+$/, 'Phone number must contain only digits')
    .required('Phone number is required'), // Required string
  gender: yup.string().required('Gender is required'), // Required string
  address: yup.object().shape({
    address: yup.string().required('Address is required'), // Required string
    city: yup.string().required('City is required'), // Required string
    state: yup.string().required('State is required'), // Required string
    country: yup.string().required('Country is required'), // Required string
    postalCode: yup.string().required('Postal code is required'), // Required string
    latitude: yup.number().required('Latitude is required'), // Required number
    longitude: yup.number().required('Longitude is required'), // Required number
  }),
  type: yup
    .string()
    .required('Type is required')
    .oneOf(['individual', 'business'], 'Invalid type'), // Specific string value
  contactPerson: yup.string().required('Contact person is required'), // Required string
  creditLimit: yup
    .number()
    .required('Credit limit is required')
    .positive('Credit limit must be positive'), // Positive number
  taxId: yup
    .string()
    .required('Tax ID is required')
    .length(10, 'Tax ID must be exactly 10 characters'), // Exact length of 10
});

export type ICustomerPayload = yup.InferType<typeof customerValidationSchema>;

export type IInvoicePayload = yup.InferType<typeof invoiceSchema>;

// Example usage:
// invoiceSchema.validate(invoiceObject).then(console.log).catch(console.error);
