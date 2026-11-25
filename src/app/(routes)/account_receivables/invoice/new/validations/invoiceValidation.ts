import * as yup from 'yup';

// Line item validation schema
const lineItemSchema = yup.object({
  name: yup
    .string()
    .required('Description is required')
    .min(1, 'Description cannot be empty'),
  qty: yup
    .number()
    .required('Quantity is required')
    .positive('Quantity must be greater than 0'),
  price: yup
    .number()
    .required('Price is required')
    .positive('Price must be greater than 0'),
  tax: yup
    .number()
    .min(0, 'Tax rate cannot be negative')
    .max(100, 'Tax rate cannot exceed 100%'),
  uuid: yup.string().required('Product ID is required'),
});

/**
 * Draft invoices only require a customer and at least one line.
 * Dates, terms, currency, payment, addresses, and notes use form defaults
 * unless the client changes them.
 */
export const invoiceValidationSchema = yup
  .object({
    customerName: yup.string().required('Customer is required'),
    invoiceNumber: yup.string().required('Invoice number is required'),
    invoiceType: yup.string().required('Invoice type is required'),
    currency: yup.string().optional(),
    issueDate: yup.string().optional(),
    dueDate: yup.string().optional(),
    billingAddress: yup.string().optional(),
    shippingAddress: yup.string().optional(),
    lineItems: yup
      .array()
      .of(lineItemSchema)
      .min(1, 'At least one line item is required'),
    paymentMethod: yup.string().optional(),
    paymentReference: yup.string().optional(),
    taxRate: yup
      .number()
      .min(0, 'Tax rate cannot be negative')
      .max(100, 'Tax rate cannot exceed 100%')
      .optional(),
    paymentTerms: yup.string().optional(),
    notes: yup.string().optional(),
  })
  .test(
    'due-date-after-issue',
    'Due date cannot be before issue date',
    function (value) {
      if (!value.issueDate || !value.dueDate) return true;

      const issueDate = new Date(value.issueDate);
      const dueDate = new Date(value.dueDate);

      return dueDate >= issueDate;
    },
  );

// Validation function for the form
export const validateInvoiceForm = async (
  data: any,
  _options: {
    validateAddresses?: boolean;
    validatePaymentTerms?: boolean;
    validateNotes?: boolean;
  } = {},
) => {
  try {
    const validatedData = await invoiceValidationSchema.validate(data, {
      abortEarly: false,
    });
    return { isValid: true, data: validatedData, errors: {} };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: Record<string, string> = {};
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      return { isValid: false, data: null, errors };
    }
    return {
      isValid: false,
      data: null,
      errors: { general: 'Validation failed' },
    };
  }
};

// Individual field validation functions
export const validateField = async (field: string, value: any, schema: any) => {
  try {
    await schema.validateAt(field, { [field]: value });
    return { isValid: true, error: null };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return { isValid: false, error: error.message };
    }
    return { isValid: false, error: 'Validation failed' };
  }
};

// Export individual schemas for field-level validation
export const fieldSchemas = {
  issueDate: yup.string().optional(),
  dueDate: yup.string().optional(),
  customerName: yup.string().required('Customer is required'),
  currency: yup.string().optional(),
  billingAddress: yup.string().optional(),
  shippingAddress: yup.string().optional(),
  paymentMethod: yup.string().optional(),
  taxRate: yup
    .number()
    .min(0, 'Tax rate cannot be negative')
    .max(100, 'Tax rate cannot exceed 100%'),
  paymentTerms: yup.string().optional(),
  notes: yup.string().optional(),
};
