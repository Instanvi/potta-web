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

// Main invoice validation schema
export const invoiceValidationSchema = yup
  .object({
    // Basic Information
    issueDate: yup.string().required('Issue date is required'),
    dueDate: yup.string().required('Due date is required'),
    customerName: yup.string().required('Customer is required'),
    currency: yup.string().required('Currency is required'),
    invoiceNumber: yup.string().required('Invoice number is required'),
    invoiceType: yup.string().required('Invoice type is required'),

    // Addresses (optional but validate if provided)
    billingAddress: yup.string().when('$validateAddresses', {
      is: true,
      then: (schema) =>
        schema.min(10, 'Billing address must be at least 10 characters'),
      otherwise: (schema) => schema.optional(),
    }),
    shippingAddress: yup.string().when('$validateAddresses', {
      is: true,
      then: (schema) =>
        schema.min(10, 'Shipping address must be at least 10 characters'),
      otherwise: (schema) => schema.optional(),
    }),

    // Line Items
    lineItems: yup
      .array()
      .of(lineItemSchema)
      .min(1, 'At least one line item is required'),

    // Payment Information
    paymentMethod: yup.string().required('Payment method is required'),
    paymentReference: yup.string().optional(),
    taxRate: yup
      .number()
      .min(0, 'Tax rate cannot be negative')
      .max(100, 'Tax rate cannot exceed 100%'),
    paymentTerms: yup.string().when('$validatePaymentTerms', {
      is: true,
      then: (schema) =>
        schema.min(5, 'Payment terms must be at least 5 characters'),
      otherwise: (schema) => schema.optional(),
    }),

    // Notes (optional but validate if provided)
    notes: yup.string().when('$validateNotes', {
      is: true,
      then: (schema) =>
        schema.min(10, 'Notes must be at least 10 characters if provided'),
      otherwise: (schema) => schema.optional(),
    }),
  })
  .test(
    'due-date-after-issue',
    'Due date cannot be before issue date',
    function (value) {
      if (!value.issueDate || !value.dueDate) return true;

      const issueDate = new Date(value.issueDate);
      const dueDate = new Date(value.dueDate);

      return dueDate >= issueDate;
    }
  );

// Validation function for the form
export const validateInvoiceForm = async (
  data: any,
  options: {
    validateAddresses?: boolean;
    validatePaymentTerms?: boolean;
    validateNotes?: boolean;
  } = {}
) => {
  try {
    const validatedData = await invoiceValidationSchema.validate(data, {
      abortEarly: false,
      context: {
        validateAddresses: options.validateAddresses || false,
        validatePaymentTerms: options.validatePaymentTerms || false,
        validateNotes: options.validateNotes || false,
      },
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
  issueDate: yup.string().required('Issue date is required'),
  dueDate: yup.string().required('Due date is required'),
  customerName: yup.string().required('Customer is required'),
  currency: yup.string().required('Currency is required'),
  billingAddress: yup
    .string()
    .min(10, 'Billing address must be at least 10 characters'),
  shippingAddress: yup
    .string()
    .min(10, 'Shipping address must be at least 10 characters'),
  paymentMethod: yup.string().required('Payment method is required'),
  taxRate: yup
    .number()
    .min(0, 'Tax rate cannot be negative')
    .max(100, 'Tax rate cannot exceed 100%'),
  paymentTerms: yup
    .string()
    .min(5, 'Payment terms must be at least 5 characters'),
  notes: yup
    .string()
    .min(10, 'Notes must be at least 10 characters if provided'),
};
