import * as yup from 'yup';
import { DISCOUNT_TYPES, PAYMENT_METHOD_VALUES, type SalePayload } from './sale';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const lineItemSchema = yup.object({
  description: yup.string().required('Description is required'),
  quantity: yup.number().required('Quantity is required').positive('Quantity must be positive').integer('Quantity must be an integer'),
  discountCap: yup.number().min(0, 'Discount cap cannot be negative').default(0),
  discountType: yup.string().oneOf([...DISCOUNT_TYPES], 'Invalid discount type').default('PERCENTAGE'),
  unitPrice: yup.number().required('Unit price is required').min(0, 'Unit price cannot be negative'),
  taxRate: yup.number().min(0, 'Tax rate cannot be negative').default(0),
  discountRate: yup.number().min(0, 'Discount rate cannot be negative').default(0),
  productId: yup.string().required('Product is required').matches(uuidRegex, 'Product ID must be a valid UUID'),
});

const salesReceiptSchema = yup.object({
  saleDate: yup
    .string()
    .required('Sale date is required')
    .test('is-iso-date', 'Sale date must be a valid ISO date string', (value) => !value || !isNaN(Date.parse(value))),
  totalAmount: yup.number().required().min(0, 'Total amount cannot be negative'),
  paymentReference: yup.string(),
  notes: yup.string(),
  paymentMethod: yup.string().required('Payment method is required').oneOf([...PAYMENT_METHOD_VALUES, 'OTHER'], 'Invalid payment method'),
  receiptNumber: yup.string(),
  discountAmount: yup.number().min(0, 'Discount amount cannot be negative'),
  customerId: yup.string().matches(uuidRegex, { message: 'Customer ID must be a valid UUID', excludeEmptyString: true }),
  lineItems: yup.array().of(lineItemSchema).required('Line items are required').min(1, 'At least one line item is required'),
});

type LineItemPayload = yup.InferType<typeof lineItemSchema>;
type SalesReceiptPayload = SalePayload;

export { lineItemSchema, salesReceiptSchema };
export type { LineItemPayload, SalesReceiptPayload };
