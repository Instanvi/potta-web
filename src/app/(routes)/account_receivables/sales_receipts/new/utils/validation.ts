import * as Yup from 'yup';

// Define the payment method options
const paymentMethodOptions = ['Credit Card', 'Bank Transfer', 'ACH Transfer', 'Other', 'mtnMobileMoney', 'orangeMoney', 'bankTransfer', 'other'];

// Define the discount type options
const discountTypeOptions = ['FlatRate', 'Percentage', 'PercentageWithCap'];

// Define the LineItemsDto schema
export const LineItemsDtoSchema = Yup.object({
description: Yup.string().required('Description is required'),
quantity: Yup.number().positive('Quantity must be positive').required('Quantity is required'),
discountCap: Yup.number().min(0, 'Discount cap must be non-negative').required('Discount cap is required'),
discountType: Yup.string().nullable().oneOf([...discountTypeOptions, null], 'Invalid discount type'),
unitPrice: Yup.number().positive('Unit price must be positive').required('Unit price is required'),
taxRate: Yup.number().min(0, 'Tax rate must be non-negative').required('Tax rate is required'),
discountRate: Yup.number().min(0, 'Discount rate must be non-negative').required('Discount rate is required'),
productId: Yup.string().required('Product ID is required'),
});

// Define the SaleReceiptDto schema
export const SaleReceiptDtoSchema = Yup.object({
saleDate: Yup.string().required('Sale date is required'),
totalAmount: Yup.number().positive('Total amount must be positive').required('Total amount is required'),
paymentReference: Yup.string(),
notes: Yup.string(),
paymentMethod: Yup.string()
  .oneOf(paymentMethodOptions, 'Invalid payment method')
  .required('Payment method is required'),
receiptNumber: Yup.string().required('Receipt number is required'),
discountAmount: Yup.number().min(0, 'Discount amount must be non-negative').required('Discount amount is required'),
customerId: Yup.string().required('Customer ID is required'),
salePerson: Yup.string()
  .required('Sales person is required')
  .test(
    'is-valid-sales-person',
    'Sales person ID must be c9c0c3a4-353f-4907-a342-ae64e629936f',
    value => value === 'c9c0c3a4-353f-4907-a342-ae64e629936f'
  ),
lineItems: Yup.array()
  .of(LineItemsDtoSchema)
  .min(1, 'At least one line item is required')
  .required('Line items are required'),
});

// TypeScript interfaces
export interface LineItemsDto {
description: string;
quantity: number;
discountCap: number;
discountType: string | null;
unitPrice: number;
taxRate: number;
discountRate: number;
productId: string;
}

export interface SaleReceiptDto {
saleDate: string;
totalAmount: number;
paymentReference?: string;
notes?: string;
paymentMethod: string;
receiptNumber: string;
discountAmount: number;
customerId: string;
salePerson: string;
lineItems: LineItemsDto[];
}
