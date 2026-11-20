import * as yup from 'yup';

// UUID Regex Pattern
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Payment Method and Discount Type Enums
const PaymentMethods = [
  'Credit Card',
  'Bank Transfer',
  'ACH Transfer',
  'Other',
] as const;
const DiscountTypes = ['FlatRate', 'Percentage', 'PercentageWithCap'] as const;

// Line Item Schema
const lineItemSchema = yup.object({
  description: yup.string().required('Description is required'),
  quantity: yup
    .number()
    .required('Quantity is required')
    .positive('Quantity must be positive')
    .integer('Quantity must be an integer'),
  discountCap: yup
    .number()
    .required('Discount cap is required')
    .min(0, 'Discount cap cannot be negative'),
  discountType: yup
    .string()
    .required('Discount type is required')
    .oneOf(DiscountTypes, 'Invalid discount type'),
  unitPrice: yup
    .number()
    .required('Unit price is required')
    .positive('Unit price must be positive'),
  taxRate: yup
    .number()
    .required('Tax rate is required')
    .min(0, 'Tax rate cannot be negative'),
  discountRate: yup.number().min(0, 'Discount rate cannot be negative'),
  productId: yup
    .string()
    .required('Product ID is required')
    .matches(uuidRegex, 'Product ID must be a valid UUID'),
});

// Main Sales Receipt Schema
const salesReceiptSchema = yup.object({
  saleDate: yup
    .string()
    .required('Sale date is required')
    .test(
      'is-iso-date',
      'Sale date must be a valid ISO date string',
      (value) => !value || !isNaN(Date.parse(value))
    ),
  paymentReference: yup.string(),
  notes: yup.string(),
  paymentMethod: yup
    .string()
    .required('Payment method is required')
    .oneOf(PaymentMethods, 'Invalid payment method'),
  receiptNumber: yup.string(),
  customerId: yup
    .string()
    .required('Customer ID is required')
    .matches(uuidRegex, 'Customer ID must be a valid UUID'),
  salePerson: yup
    .string()
    .required('Sales person ID is required')
    .matches(uuidRegex, 'Sales person ID must be a valid UUID'),
  lineItems: yup
    .array()
    .of(lineItemSchema)
    .required('Line items are required')
    .min(1, 'At least one line item is required'),
});

// TypeScript types based on the Yup schema
type LineItemPayload = yup.InferType<typeof lineItemSchema>;
type SalesReceiptPayload = yup.InferType<typeof salesReceiptSchema>;

export { lineItemSchema, salesReceiptSchema };

export type { LineItemPayload, SalesReceiptPayload };
