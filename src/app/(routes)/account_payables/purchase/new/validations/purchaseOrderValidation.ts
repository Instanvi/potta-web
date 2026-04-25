import * as yup from 'yup';

// Purchase Order Validation Schema
export const purchaseOrderValidationSchema = yup.object().shape({
  orderDate: yup
    .date()
    .required('Order date is required')
    .typeError('Please select a valid order date'),

  requiredDate: yup
    .date()
    .required('Required date is required')
    .typeError('Please select a valid required date'),

  vendorId: yup
    .string()
    .required('Vendor selection is required')
    .min(1, 'Please select a vendor'),

  shippingAddress: yup
    .string()
    .required('Shipping address is required')
    .min(5, 'Shipping address must be at least 5 characters')
    .max(500, 'Shipping address must not exceed 500 characters'),

  paymentMethod: yup
    .string()
    .required('Payment method is required')
    .oneOf(
      [
        'CREDIT_CARD',
        'BANK_TRANSFER',
        'ACH_TRANSAFER',
        'MOBILE_MONEY',
        'CASH',
        'CREDIT',
        'OTHER',
      ],
      'Please select a valid payment method'
    ),

  paymentTerms: yup
    .string()
    .required('Payment terms are required')
    .min(10, 'Payment terms must be at least 10 characters')
    .max(1000, 'Payment terms must not exceed 1000 characters'),

  note: yup.string().max(1000, 'Notes must not exceed 1000 characters'),

  lineItems: yup
    .array()
    .min(1, 'At least one item is required')
    .of(
      yup.object().shape({
        name: yup.string().required('Item name is required'),
        qty: yup
          .number()
          .positive('Quantity must be greater than 0')
          .required('Quantity is required'),
        price: yup
          .number()
          .min(0, 'Price must be 0 or greater')
          .required('Price is required'),
        tax: yup
          .number()
          .min(0, 'Tax must be 0 or greater')
          .max(100, 'Tax cannot exceed 100%')
          .required('Tax is required'),
      })
    ),
});

// Individual field validation schemas
export const fieldSchemas = {
  orderDate: yup
    .date()
    .required('Order date is required')
    .typeError('Please select a valid order date'),

  requiredDate: yup
    .date()
    .required('Required date is required')
    .typeError('Please select a valid required date'),

  vendorId: yup
    .string()
    .required('Vendor selection is required')
    .min(1, 'Please select a vendor'),

  shippingAddress: yup
    .string()
    .required('Shipping address is required')
    .min(5, 'Shipping address must be at least 5 characters')
    .max(500, 'Shipping address must not exceed 500 characters'),

  paymentMethod: yup
    .string()
    .required('Payment method is required')
    .oneOf(
      [
        'CREDIT_CARD',
        'BANK_TRANSFER',
        'ACH_TRANSAFER',
        'MOBILE_MONEY',
        'CASH',
        'CREDIT',
        'OTHER',
      ],
      'Please select a valid payment method'
    ),

  paymentTerms: yup
    .string()
    .required('Payment terms are required')
    .min(10, 'Payment terms must be at least 10 characters')
    .max(1000, 'Payment terms must not exceed 1000 characters'),

  note: yup.string().max(1000, 'Notes must not exceed 1000 characters'),
};

// Validation functions
export const validatePurchaseOrderForm = async (data: any) => {
  try {
    // Custom validation for date comparison
    if (data.orderDate && data.requiredDate) {
      const orderDate = new Date(data.orderDate);
      const requiredDate = new Date(data.requiredDate);
      if (requiredDate <= orderDate) {
        return {
          isValid: false,
          errors: {
            requiredDate: 'Due date must be after order date',
          },
        };
      }
    }

    await purchaseOrderValidationSchema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error: any) {
    const errors: { [key: string]: string } = {};
    if (error.inner) {
      error.inner.forEach((err: any) => {
        errors[err.path] = err.message;
      });
    }
    return { isValid: false, errors };
  }
};

export const validateField = async (
  fieldName: string,
  value: any,
  schema: any
) => {
  try {
    await schema.validateAt(fieldName, { [fieldName]: value });
    return { isValid: true, error: '' };
  } catch (error: any) {
    return { isValid: false, error: error.message };
  }
};

// Helper function to format error messages for TextArea component
export const formatErrorForTextArea = (error: string | undefined) => {
  if (!error) return undefined;
  return { message: error };
};

// Helper function to check if form has errors
export const hasFormErrors = (errors: { [key: string]: string }) => {
  return Object.keys(errors).length > 0;
};

// Helper function to get first error field for scrolling
export const getFirstErrorField = (errors: any) => {
  const firstErrorKey = Object.keys(errors)[0];
  return firstErrorKey
    ? document.querySelector(`[name="${firstErrorKey}"]`)
    : null;
};
