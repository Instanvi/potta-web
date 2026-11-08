import * as yup from 'yup';
import { BillCurrency, PaymentMethod } from '../../utils/types';

export interface BillLineFormValues {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discountAmount?: number;
  productId?: string;
}

export interface BillFormValues {
  vendorId: string;
  purchaseOrderId?: string;
  vendorInvoiceNumber?: string;
  issueDate: string;
  dueDate: string;
  currency: BillCurrency;
  paymentMethod: PaymentMethod;
  expenseAccountCode: string;
  notes?: string;
  lineItems: BillLineFormValues[];
}

const optionalNumber = () =>
  yup
    .number()
    .transform((value, original) => (original === '' || original === null ? undefined : value))
    .typeError('Must be a number')
    .min(0, 'Cannot be negative')
    .optional();

export const billLineSchema = yup.object({
  description: yup.string().trim().required('Description is required'),
  quantity: yup.number().typeError('Quantity is required').moreThan(0, 'Must be more than 0').required(),
  unitPrice: yup.number().typeError('Unit price is required').min(0, 'Cannot be negative').required(),
  taxRate: optionalNumber().max(100, 'At most 100%'),
  discountAmount: optionalNumber().test(
    'discount-within-line',
    'Discount exceeds the line amount',
    function (value) {
      const { quantity, unitPrice } = this.parent as BillLineFormValues;
      if (!value) return true;
      return value <= Number(quantity || 0) * Number(unitPrice || 0);
    }
  ),
  productId: yup.string().optional(),
});

export const billSchema = yup.object({
  vendorId: yup.string().required('Select a vendor'),
  purchaseOrderId: yup.string().optional(),
  vendorInvoiceNumber: yup.string().trim().max(100, 'At most 100 characters').optional(),
  issueDate: yup.string().required('Issue date is required'),
  dueDate: yup
    .string()
    .required('Due date is required')
    .test('after-issue', 'Due date cannot be before the issue date', function (value) {
      const { issueDate } = this.parent as BillFormValues;
      return !value || !issueDate || value >= issueDate;
    }),
  currency: yup.mixed<BillCurrency>().oneOf(['XAF', 'USD', 'EUR']).required(),
  paymentMethod: yup.mixed<PaymentMethod>().required(),
  expenseAccountCode: yup
    .string()
    .trim()
    .required('Expense account is required')
    .matches(/^\d{2,20}$/, 'Use a chart of accounts code (e.g. 601, 605, 622)'),
  notes: yup.string().optional(),
  lineItems: yup.array().of(billLineSchema).min(1, 'Add at least one line item').required(),
});

export const lineTotals = (line: Partial<BillLineFormValues>) => {
  const gross = Number(line.quantity || 0) * Number(line.unitPrice || 0);
  const discount = Math.min(Number(line.discountAmount || 0), gross);
  const net = gross - discount;
  const tax = (net * Number(line.taxRate || 0)) / 100;
  return { gross, discount, net, tax, total: net + tax };
};
